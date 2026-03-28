'use strict';

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Fetch a single card by id with all nested data (labels, checklist, members).
 */
async function fetchCard(cardId) {
  const { rows, rowCount } = await db.query(
    `SELECT id, list_id AS "listId", title, description,
            due_date AS "dueDate", archived, order_index AS "order"
       FROM cards WHERE id = $1`,
    [cardId]
  );
  if (rowCount === 0) return null;
  const card = rows[0];

  const [labelsRes, checklistRes, membersRes] = await Promise.all([
    db.query('SELECT id, name, color FROM labels WHERE card_id = $1', [cardId]),
    db.query(
      'SELECT id, text, completed FROM checklist_items WHERE card_id = $1 ORDER BY order_index',
      [cardId]
    ),
    db.query(
      `SELECT m.id, m.name, m.initials, m.color, m.avatar
         FROM card_members cm JOIN members m ON m.id = cm.member_id
        WHERE cm.card_id = $1`,
      [cardId]
    ),
  ]);

  card.labels = labelsRes.rows;
  card.checklist = checklistRes.rows;
  card.members = membersRes.rows.map((m) => ({
    id: m.id,
    name: m.name,
    initials: m.initials,
    color: m.color,
    ...(m.avatar ? { avatar: m.avatar } : {}),
  }));

  return card;
}

/**
 * Replace all labels for a card within an existing DB client/transaction.
 */
async function replaceLabels(client, cardId, labels) {
  await client.query('DELETE FROM labels WHERE card_id = $1', [cardId]);
  for (const lbl of labels) {
    await client.query(
      'INSERT INTO labels (id, card_id, name, color) VALUES ($1, $2, $3, $4)',
      [lbl.id || uuidv4(), cardId, lbl.name, lbl.color]
    );
  }
}

/**
 * Replace all checklist items for a card within an existing DB client/transaction.
 */
async function replaceChecklist(client, cardId, checklist) {
  await client.query('DELETE FROM checklist_items WHERE card_id = $1', [cardId]);
  for (let i = 0; i < checklist.length; i++) {
    const item = checklist[i];
    await client.query(
      `INSERT INTO checklist_items (id, card_id, text, completed, order_index)
       VALUES ($1, $2, $3, $4, $5)`,
      [item.id || uuidv4(), cardId, item.text, item.completed ?? false, i]
    );
  }
}

/**
 * Replace all member assignments for a card within an existing DB client/transaction.
 */
async function replaceMembers(client, cardId, members) {
  await client.query('DELETE FROM card_members WHERE card_id = $1', [cardId]);
  for (const m of members) {
    await client.query(
      'INSERT INTO card_members (card_id, member_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [cardId, m.id]
    );
  }
}

// ─── POST /cards ──────────────────────────────────────────────────────────────
// Create a new card.
// Body: { listId, title, description?, labels?, checklist?, members?, dueDate?, archived?, order? }
router.post('/', async (req, res) => {
  const { listId, title, description = '', labels = [], checklist = [], members = [], dueDate, archived = false, order } = req.body;

  if (!listId || !title) {
    return res.status(400).json({ error: 'listId and title are required' });
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // Determine order_index
    let orderIndex = order;
    if (orderIndex === undefined || orderIndex === null) {
      const { rows } = await client.query(
        'SELECT COALESCE(MAX(order_index) + 1, 0) AS next FROM cards WHERE list_id = $1',
        [listId]
      );
      orderIndex = rows[0].next;
    }

    const id = uuidv4();
    await client.query(
      `INSERT INTO cards (id, list_id, title, description, due_date, archived, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, listId, title, description, dueDate || null, archived, orderIndex]
    );

    await replaceLabels(client, id, labels);
    await replaceChecklist(client, id, checklist);
    await replaceMembers(client, id, members);

    await client.query('COMMIT');

    const card = await fetchCard(id);
    res.status(201).json(card);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /cards error:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// ─── PUT /cards/reorder ───────────────────────────────────────────────────────
// Batch-update the order and/or listId of multiple cards.
// Body: { cards: [{ id, listId, order }, ...] }
// NOTE: This route must be registered BEFORE PUT /cards/:id
router.put('/reorder', async (req, res) => {
  const { cards } = req.body;

  if (!Array.isArray(cards) || cards.length === 0) {
    return res.status(400).json({ error: 'cards array is required' });
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    for (const { id, listId, order } of cards) {
      await client.query(
        'UPDATE cards SET list_id = $1, order_index = $2, updated_at = NOW() WHERE id = $3',
        [listId, order, id]
      );
    }
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('PUT /cards/reorder error:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// ─── PUT /cards/:id ───────────────────────────────────────────────────────────
// Update a card.
// Body: Partial<Card> — any subset of card fields including nested labels/checklist/members
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, dueDate, archived, order, listId, labels, checklist, members } = req.body;

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // Build dynamic UPDATE for scalar fields
    const fields = [];
    const values = [];
    let idx = 1;

    if (title !== undefined)       { fields.push(`title = $${idx++}`);       values.push(title); }
    if (description !== undefined) { fields.push(`description = $${idx++}`); values.push(description); }
    if (dueDate !== undefined)     { fields.push(`due_date = $${idx++}`);    values.push(dueDate || null); }
    if (archived !== undefined)    { fields.push(`archived = $${idx++}`);    values.push(archived); }
    if (order !== undefined)       { fields.push(`order_index = $${idx++}`); values.push(order); }
    if (listId !== undefined)      { fields.push(`list_id = $${idx++}`);     values.push(listId); }

    if (fields.length > 0) {
      fields.push('updated_at = NOW()');
      values.push(id);
      const { rowCount } = await client.query(
        `UPDATE cards SET ${fields.join(', ')} WHERE id = $${idx}`,
        values
      );
      if (rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Card not found' });
      }
    } else {
      // Verify the card exists even if no scalar fields changed
      const { rowCount } = await client.query('SELECT id FROM cards WHERE id = $1', [id]);
      if (rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Card not found' });
      }
    }

    // Replace nested relations when provided
    if (Array.isArray(labels))    await replaceLabels(client, id, labels);
    if (Array.isArray(checklist)) await replaceChecklist(client, id, checklist);
    if (Array.isArray(members))   await replaceMembers(client, id, members);

    await client.query('COMMIT');

    const card = await fetchCard(id);
    res.json(card);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('PUT /cards/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// ─── DELETE /cards/:id ────────────────────────────────────────────────────────
// Delete a card (cascades to labels, checklist, card_members).
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await db.query('DELETE FROM cards WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Card not found' });
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /cards/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
