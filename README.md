# Trello Clone — Kanban Project Management App

A fully-featured Trello-like Kanban board built with **React**, **TypeScript**, **Tailwind CSS**, **Zustand**, and **dnd-kit**.

## ✨ Features

- 📋 **Board** with multiple draggable lists (columns) and horizontal scroll
- 📝 **Lists** — Create, rename, delete, and reorder via drag & drop
- 🃏 **Cards** — Create, edit, archive, delete, and drag cards within/between lists
- 🖼️ **Card Details Modal** — Labels, due dates, checklists with progress, member assignment
- 🔍 **Search & Filter** — Search by title; filter by labels, members, due date
- 🎯 **Drag & Drop** — dnd-kit for smooth list and card drag-and-drop
- 🔌 **API-ready** — Service layer with axios for backend integration
- 📦 **Zustand state** — Normalized, performant state management

## 🗂️ Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── CardItem.tsx    # Single card in a list
│   ├── ListColumn.tsx  # A column/list on the board
│   ├── CardModal.tsx   # Card details popup
│   ├── AddCard.tsx     # Inline card creation form
│   ├── AddList.tsx     # New list creation form
│   └── FilterBar.tsx   # Search + filter controls
├── hooks/
│   └── useFilteredCards.ts  # Filter logic hook
├── pages/
│   └── BoardPage.tsx   # Main board page with DnD context
├── services/
│   ├── api.ts          # Axios API service functions
│   └── mockData.ts     # Initial mock board data
├── store/
│   ├── boardStore.ts   # Zustand store (boards, lists, cards, filters)
│   └── utils/
│       └── nanoid.ts   # Unique ID generator
├── types/
│   └── index.ts        # TypeScript types
└── utils/
    └── labelColors.ts  # Label color mappings
```

## 🚀 Setup & Development

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd Trello-Clone

# Install dependencies
npm install

# Copy env example
cp .env.example .env

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🏗️ Build

```bash
npm run build
```

Output is in the `dist/` folder, ready for deployment.

## 🌐 Deployment

### Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variable `VITE_API_BASE_URL` in Vercel project settings
4. Deploy — Vercel auto-detects Vite and runs `npm run build`

### Netlify

1. Push to GitHub
2. Connect to [Netlify](https://netlify.com)
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add `VITE_API_BASE_URL` environment variable in Netlify dashboard

## 🔌 API Integration

Edit `src/services/api.ts` to connect to your backend:

```typescript
// Set VITE_API_BASE_URL in .env
VITE_API_BASE_URL=https://your-api.com
```

The service layer implements:
- `GET /boards/:id` — Load board
- `POST /lists` — Create list
- `PUT /lists/:id` — Update list
- `DELETE /lists/:id` — Delete list
- `POST /cards` — Create card
- `PUT /cards/:id` — Update card
- `DELETE /cards/:id` — Delete card

## 🧪 Tech Stack

| Tool | Purpose |
|------|---------|
| React 19 + TypeScript | UI framework |
| Vite 8 | Build tool |
| Tailwind CSS v4 | Styling |
| Zustand 5 | State management |
| dnd-kit | Drag & drop |
| axios | HTTP client |
| date-fns | Date utilities |
| lucide-react | Icons |

## ⌨️ Keyboard Shortcuts

- **Escape** — Close card modal / cancel editing
- **Enter** — Save card/list title, add checklist item
- **Shift+Enter** — New line in text areas
