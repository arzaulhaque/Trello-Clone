# Trello Clone — Backend API

Node.js + Express REST API backed by PostgreSQL for the Trello Clone project.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+

## Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file and fill in your database credentials
cp .env.example .env

# Create the database (run once)
createdb trello_clone

# Run database migrations + seed data
npm run migrate

# Start the development server (auto-restart on file changes)
npm run dev

# Or start the production server
npm start
```

The API server will be available at `http://localhost:3001`.

## Environment Variables

| Variable       | Default                | Description                                      |
|----------------|------------------------|--------------------------------------------------|
| `DATABASE_URL` | —                      | Full PostgreSQL connection string (takes precedence) |
| `DB_HOST`      | `localhost`            | Database host                                    |
| `DB_PORT`      | `5432`                 | Database port                                    |
| `DB_NAME`      | `trello_clone`         | Database name                                    |
| `DB_USER`      | `postgres`             | Database user                                    |
| `DB_PASSWORD`  | —                      | Database password                                |
| `PORT`         | `3001`                 | API server port                                  |
| `CORS_ORIGIN`  | `http://localhost:5173`| Allowed CORS origin (frontend URL)               |

## API Endpoints

### Health

| Method | Path      | Description        |
|--------|-----------|--------------------|
| GET    | `/health` | Server health check |

### Boards

| Method | Path           | Description                                      |
|--------|----------------|--------------------------------------------------|
| GET    | `/boards/:id`  | Get board with nested lists, cards, and members  |

**Response shape for `GET /boards/:id`:**

```json
{
  "board":   { "id": "board1", "title": "My Project Board", "background": "from-blue-600 to-blue-800" },
  "lists":   [{ "id": "list1", "boardId": "board1", "title": "To Do", "order": 0 }],
  "cards":   [{
    "id": "card1", "listId": "list1", "title": "...", "description": "...",
    "dueDate": "2025-01-01T00:00:00.000Z", "archived": false, "order": 0,
    "labels": [{ "id": "lbl1", "name": "Design", "color": "purple" }],
    "checklist": [{ "id": "ci1", "text": "Create wireframes", "completed": true }],
    "members": [{ "id": "m1", "name": "Alice Johnson", "initials": "AJ", "color": "#0079bf" }]
  }],
  "members": [{ "id": "m1", "name": "Alice Johnson", "initials": "AJ", "color": "#0079bf" }]
}
```

### Lists

| Method | Path              | Description               |
|--------|-------------------|---------------------------|
| POST   | `/lists`          | Create a list             |
| PUT    | `/lists/reorder`  | Batch-reorder lists       |
| PUT    | `/lists/:id`      | Update a list             |
| DELETE | `/lists/:id`      | Delete a list (and cards) |

**POST /lists body:**
```json
{ "boardId": "board1", "title": "Backlog", "order": 3 }
```

**PUT /lists/reorder body:**
```json
{ "lists": [{ "id": "list1", "order": 0 }, { "id": "list2", "order": 1 }] }
```

### Cards

| Method | Path              | Description                |
|--------|-------------------|----------------------------|
| POST   | `/cards`          | Create a card              |
| PUT    | `/cards/reorder`  | Batch-reorder cards        |
| PUT    | `/cards/:id`      | Update a card              |
| DELETE | `/cards/:id`      | Delete a card              |

**POST /cards body:**
```json
{
  "listId": "list1",
  "title": "New feature",
  "description": "Details here",
  "labels": [{ "id": "lbl1", "name": "Feature", "color": "blue" }],
  "checklist": [{ "id": "ci1", "text": "Step 1", "completed": false }],
  "members": [{ "id": "m1" }],
  "dueDate": "2025-06-01T00:00:00.000Z",
  "archived": false
}
```

**PUT /cards/reorder body:**
```json
{ "cards": [{ "id": "card1", "listId": "list1", "order": 0 }] }
```

**PUT /cards/:id body:**  
Any subset of the card fields above. When `labels`, `checklist`, or `members` are provided, the existing values are replaced entirely.

## Project Structure

```
backend/
├── src/
│   ├── index.js          # Express app entry point
│   ├── db.js             # PostgreSQL connection pool
│   ├── migrate.js        # Migration runner
│   └── routes/
│       ├── boards.js     # Board endpoints
│       ├── lists.js      # List endpoints
│       └── cards.js      # Card endpoints
├── migrations/
│   └── 001_init.sql      # Schema + seed data
├── .env.example
└── package.json
```

## Tech Stack

| Tool       | Purpose                        |
|------------|--------------------------------|
| Node.js 18 | Runtime                        |
| Express 4  | HTTP framework                 |
| pg         | PostgreSQL client              |
| uuid       | UUID generation                |
| dotenv     | Environment variable loading   |
| cors       | Cross-origin request handling  |
| nodemon    | Dev auto-restart               |
