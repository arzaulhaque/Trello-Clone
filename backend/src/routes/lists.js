'use strict';

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();

// ─── POST /lists ─────────────────────────────────────────────────────────────
// Create a new list.
// Body: { boardId, title, order? }
router.post('/', async (req, res) => {
  const { boardId, title, order } = req.body;

  if (!boardId || !title) {
    return res.status(400).json({ error: 'boardId and title are required' });
  }

  try {
    // Determine order_index: use provided value or append at end
    let orderIndex = order;
    if (orderIndex === undefined || orderIndex === null) {
      const { rows } = await db.query(
        'SELECT COALESCE(MAX(order_index) + 1, 0) AS next FROM lists WHERE board_id = $1',
        [boardId]
      );
      orderIndex = rows[0].next;
    }

    const id = uuidv4();
    const { rows } = await db.query(
      `INSERT INTO lists (id, board_id, title, order_index)
       VALUES ($1, $2, $3, $4)
       RETURNING id, board_id AS "boardId", title, order_index AS "order"`,
      [id, boardId, title, orderIndex]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /lists error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── PUT /lists/reorder ───────────────────────────────────────────────────────
// Batch-update the order of multiple lists.
// Body: { lists: [{ id, order }, ...] }
// NOTE: This route must be registered BEFORE PUT /lists/:id
router.put('/reorder', async (req, res) => {
  const { lists } = req.body;

  if (!Array.isArray(lists) || lists.length === 0) {
    return res.status(400).json({ error: 'lists array is required' });
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    for (const { id, order } of lists) {
      await client.query(
        'UPDATE lists SET order_index = $1, updated_at = NOW() WHERE id = $2',
        [order, id]
      );
    }
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('PUT /lists/reorder error:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// ─── PUT /lists/:id ───────────────────────────────────────────────────────────
// Update a list (title or order).
// Body: Partial<{ title, order }>
router.put('/:id', async (req, res) => {
  const { title, order } = req.body;
  const { id } = req.params;

  const fields = [];
  const values = [];
  let idx = 1;

  if (title !== undefined) {
    fields.push(`title = $${idx++}`);
    values.push(title);
  }
  if (order !== undefined) {
    fields.push(`order_index = $${idx++}`);
    values.push(order);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'No updatable fields provided' });
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  try {
    const { rows, rowCount } = await db.query(
      `UPDATE lists SET ${fields.join(', ')} WHERE id = $${idx}
       RETURNING id, board_id AS "boardId", title, order_index AS "order"`,
      values
    );

    if (rowCount === 0) return res.status(404).json({ error: 'List not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('PUT /lists/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── DELETE /lists/:id ────────────────────────────────────────────────────────
// Delete a list (cascades to cards).
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await db.query('DELETE FROM lists WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'List not found' });
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /lists/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
