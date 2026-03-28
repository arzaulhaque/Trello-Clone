'use strict';

const express = require('express');
const db = require('../db');

const router = express.Router();

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Fetch a board by ID and return its full nested representation:
 *   { board, lists, cards, members }
 * Matches the shape the frontend boardStore expects on initial load.
 */
async function fetchFullBoard(boardId) {
  // Board row
  const boardResult = await db.query(
    'SELECT id, title, background FROM boards WHERE id = $1',
    [boardId]
  );
  if (boardResult.rowCount === 0) return null;
  const board = boardResult.rows[0];

  // Lists for this board
  const listsResult = await db.query(
    `SELECT id, board_id AS "boardId", title, order_index AS "order"
       FROM lists
      WHERE board_id = $1
      ORDER BY order_index`,
    [boardId]
  );
  const lists = listsResult.rows;

  // Cards for all lists in this board
  const cardsResult = await db.query(
    `SELECT c.id,
            c.list_id    AS "listId",
            c.title,
            c.description,
            c.due_date   AS "dueDate",
            c.archived,
            c.order_index AS "order"
       FROM cards c
       JOIN lists l ON l.id = c.list_id
      WHERE l.board_id = $1
      ORDER BY c.list_id, c.order_index`,
    [boardId]
  );
  const cardRows = cardsResult.rows;

  if (cardRows.length > 0) {
    const cardIds = cardRows.map((c) => c.id);

    // Labels
    const labelsResult = await db.query(
      `SELECT id, card_id AS "cardId", name, color FROM labels WHERE card_id = ANY($1)`,
      [cardIds]
    );

    // Checklist items
    const checklistResult = await db.query(
      `SELECT id, card_id AS "cardId", text, completed
         FROM checklist_items
        WHERE card_id = ANY($1)
        ORDER BY order_index`,
      [cardIds]
    );

    // Card members (joined with members table)
    const cardMembersResult = await db.query(
      `SELECT cm.card_id AS "cardId", m.id, m.name, m.initials, m.color, m.avatar
         FROM card_members cm
         JOIN members m ON m.id = cm.member_id
        WHERE cm.card_id = ANY($1)`,
      [cardIds]
    );

    // Group by card_id
    const labelsByCard = {};
    for (const row of labelsResult.rows) {
      (labelsByCard[row.cardId] = labelsByCard[row.cardId] || []).push({
        id: row.id,
        name: row.name,
        color: row.color,
      });
    }

    const checklistByCard = {};
    for (const row of checklistResult.rows) {
      (checklistByCard[row.cardId] = checklistByCard[row.cardId] || []).push({
        id: row.id,
        text: row.text,
        completed: row.completed,
      });
    }

    const membersByCard = {};
    for (const row of cardMembersResult.rows) {
      (membersByCard[row.cardId] = membersByCard[row.cardId] || []).push({
        id: row.id,
        name: row.name,
        initials: row.initials,
        color: row.color,
        ...(row.avatar ? { avatar: row.avatar } : {}),
      });
    }

    for (const card of cardRows) {
      card.labels = labelsByCard[card.id] || [];
      card.checklist = checklistByCard[card.id] || [];
      card.members = membersByCard[card.id] || [];
    }
  } else {
    // No cards — still need to initialise nested fields
    for (const card of cardRows) {
      card.labels = [];
      card.checklist = [];
      card.members = [];
    }
  }

  // All members for the board (for member picker)
  const membersResult = await db.query(
    'SELECT id, name, initials, color, avatar FROM members ORDER BY name'
  );
  const members = membersResult.rows.map((m) => ({
    id: m.id,
    name: m.name,
    initials: m.initials,
    color: m.color,
    ...(m.avatar ? { avatar: m.avatar } : {}),
  }));

  return { board, lists, cards: cardRows, members };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /boards/:id
router.get('/:id', async (req, res) => {
  try {
    const data = await fetchFullBoard(req.params.id);
    if (!data) return res.status(404).json({ error: 'Board not found' });
    res.json(data);
  } catch (err) {
    console.error('GET /boards/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
