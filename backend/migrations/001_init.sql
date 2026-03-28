-- Trello Clone PostgreSQL Schema
-- Run this migration to initialise the database

-- ─── Tables ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS boards (
  id          VARCHAR(50)  PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  background  VARCHAR(100) NOT NULL DEFAULT 'from-blue-600 to-blue-800',
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS members (
  id          VARCHAR(50)  PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  initials    VARCHAR(10)  NOT NULL,
  color       VARCHAR(20)  NOT NULL,
  avatar      VARCHAR(500),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lists (
  id          VARCHAR(50)  PRIMARY KEY,
  board_id    VARCHAR(50)  NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  order_index INTEGER      NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cards (
  id          VARCHAR(50)  PRIMARY KEY,
  list_id     VARCHAR(50)  NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  title       VARCHAR(500) NOT NULL,
  description TEXT         NOT NULL DEFAULT '',
  due_date    TIMESTAMPTZ,
  archived    BOOLEAN      NOT NULL DEFAULT false,
  order_index INTEGER      NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS labels (
  id       VARCHAR(50)  PRIMARY KEY,
  card_id  VARCHAR(50)  NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  name     VARCHAR(100) NOT NULL,
  color    VARCHAR(20)  NOT NULL
);

CREATE TABLE IF NOT EXISTS checklist_items (
  id          VARCHAR(50) PRIMARY KEY,
  card_id     VARCHAR(50) NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  text        TEXT        NOT NULL,
  completed   BOOLEAN     NOT NULL DEFAULT false,
  order_index INTEGER     NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS card_members (
  card_id   VARCHAR(50) NOT NULL REFERENCES cards(id)   ON DELETE CASCADE,
  member_id VARCHAR(50) NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  PRIMARY KEY (card_id, member_id)
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_lists_board_id     ON lists(board_id);
CREATE INDEX IF NOT EXISTS idx_cards_list_id      ON cards(list_id);
CREATE INDEX IF NOT EXISTS idx_labels_card_id     ON labels(card_id);
CREATE INDEX IF NOT EXISTS idx_checklist_card_id  ON checklist_items(card_id);
CREATE INDEX IF NOT EXISTS idx_card_members_card  ON card_members(card_id);

-- ─── Seed Data ────────────────────────────────────────────────────────────────

INSERT INTO boards (id, title, background) VALUES
  ('board1', 'My Project Board', 'from-blue-600 to-blue-800')
ON CONFLICT (id) DO NOTHING;

INSERT INTO members (id, name, initials, color) VALUES
  ('m1', 'Alice Johnson', 'AJ', '#0079bf'),
  ('m2', 'Bob Smith',     'BS', '#d29034'),
  ('m3', 'Carol White',   'CW', '#519839'),
  ('m4', 'David Brown',   'DB', '#b04632')
ON CONFLICT (id) DO NOTHING;

INSERT INTO lists (id, board_id, title, order_index) VALUES
  ('list1', 'board1', 'To Do',       0),
  ('list2', 'board1', 'In Progress', 1),
  ('list3', 'board1', 'Done',        2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO cards (id, list_id, title, description, due_date, archived, order_index) VALUES
  ('card1', 'list1', 'Design new landing page',
   'Create wireframes and mockups for the new landing page redesign.',
   NOW() + INTERVAL '7 days', false, 0),

  ('card2', 'list1', 'Set up CI/CD pipeline',
   'Configure GitHub Actions for automated testing and deployment.',
   NOW() + INTERVAL '3 days', false, 1),

  ('card3', 'list1', 'Write unit tests',
   'Add comprehensive test coverage for core business logic.',
   NULL, false, 2),

  ('card4', 'list2', 'Implement authentication',
   'Build login/signup with JWT tokens and refresh token rotation.',
   NOW() - INTERVAL '1 day', false, 0),

  ('card5', 'list2', 'API endpoint documentation',
   'Document all REST API endpoints using OpenAPI/Swagger spec.',
   NULL, false, 1),

  ('card6', 'list3', 'Database schema design',
   'Design and finalize the PostgreSQL database schema.',
   NULL, false, 0),

  ('card7', 'list3', 'Project kickoff meeting',
   'Initial meeting to align on goals, timeline, and responsibilities.',
   NULL, false, 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO labels (id, card_id, name, color) VALUES
  ('lbl1', 'card1', 'Design',   'purple'),
  ('lbl2', 'card2', 'DevOps',   'blue'),
  ('lbl3', 'card3', 'Testing',  'green'),
  ('lbl4', 'card4', 'Backend',  'orange'),
  ('lbl5', 'card4', 'Security', 'red'),
  ('lbl6', 'card5', 'Docs',     'sky'),
  ('lbl7', 'card6', 'Database', 'lime'),
  ('lbl8', 'card7', 'Meeting',  'yellow')
ON CONFLICT (id) DO NOTHING;

INSERT INTO checklist_items (id, card_id, text, completed, order_index) VALUES
  ('ci1',  'card1', 'Create wireframes',       true,  0),
  ('ci2',  'card1', 'Design mockups',          false, 1),
  ('ci3',  'card1', 'Get stakeholder approval',false, 2),
  ('ci4',  'card2', 'Set up GitHub Actions',   false, 0),
  ('ci5',  'card2', 'Configure staging env',   false, 1),
  ('ci6',  'card4', 'JWT implementation',      true,  0),
  ('ci7',  'card4', 'Refresh token logic',     true,  1),
  ('ci8',  'card4', 'OAuth integration',       false, 2),
  ('ci9',  'card5', 'Auth endpoints',          true,  0),
  ('ci10', 'card5', 'User endpoints',          false, 1),
  ('ci11', 'card6', 'Entity relationship diagram', true, 0),
  ('ci12', 'card6', 'Migration scripts',       true,  1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO card_members (card_id, member_id) VALUES
  ('card1', 'm1'),
  ('card2', 'm2'),
  ('card4', 'm1'), ('card4', 'm3'),
  ('card5', 'm4'),
  ('card6', 'm2'),
  ('card7', 'm1'), ('card7', 'm2'), ('card7', 'm3'), ('card7', 'm4')
ON CONFLICT DO NOTHING;
