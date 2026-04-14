# Notecraft — Markdown Notes App

A full-stack Markdown notes application with real-time split-screen preview, version history, tag filtering, and debounced auto-save.

**Stack:** React 18 · Node.js + Express · SQLite (via sql.js)

---

## Features

- **CRUD** — Create, edit, delete, and list notes
- **Split-screen editor** — Raw Markdown on the left, live rendered preview on the right
- **Three view modes** — Editor only / Split / Preview only
- **Markdown toolbar** — Quick-insert buttons for headings, bold, italic, lists, code, links, tables, images, etc.
- **Debounced auto-save** — Saves 1.2 s after you stop typing (no API spam)
- **Manual save** — Ctrl+S or the Save button
- **Version history** — Up to 20 snapshots per note; one-click restore
- **Tags** — Comma-separated tags on each note; click a tag pill to filter
- **Full-text search** — Searches title and content simultaneously
- **Dark / Light theme** — Persisted in localStorage
- **Word count** — Live counter in the toolbar
- **Image support** — Embed images with markdown syntax, responsive sizing
- **Keyboard shortcuts** — `Ctrl+N` new note · `Ctrl+S` save

---

## Project Structure

```
notes-app/
├── backend/
│   ├── src/
│   │   ├── index.js               # Express server entry
│   │   ├── db/database.js         # sql.js SQLite wrapper
│   │   ├── routes/notes.js        # Route definitions
│   │   ├── controllers/
│   │   │   └── notesController.js # All business logic
│   │   └── middleware/
│   │       └── errorHandler.js    # Error handling
│   ├── data/                      # Auto-created; holds notes.db
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/index.html
    ├── src/
    │   ├── App.js / App.css
    │   ├── index.js
    │   ├── components/
    │   │   ├── Sidebar.jsx / .css      # Note list, search, tags
    │   │   ├── Editor.jsx / .css       # Split-screen markdown editor
    │   │   ├── Topbar.jsx / .css       # Theme toggle, version history btn
    │   │   └── VersionHistory.jsx/.css # Restore previous versions
    │   ├── hooks/
    │   │   ├── useNotes.js        # Central state & API calls
    │   │   └── useDebounce.js
    │   ├── services/api.js        # Axios client
    │   └── styles/globals.css
    └── package.json
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### 1. Clone and install

```bash
git clone <your-repo-url>
cd notes-app

# Install backend
cd backend
npm install

# Install frontend
cd ../frontend
npm install
```

### 2. Configure environment

```bash
cd backend
cp .env.example .env
# Edit .env if you need a different port
```

### 3. Run the backend

```bash
cd backend
npm start

``` 
### 4. Run the frontend

```bash
cd frontend
npm start

```

---

## API Reference

| Method | Endpoint                               | Description                                          |
| ------ | -------------------------------------- | ---------------------------------------------------- |
| GET    | `/api/notes`                           | List notes (supports `?search=&tag=&limit=&offset=`) |
| GET    | `/api/notes/tags`                      | Get all unique tags                                  |
| GET    | `/api/notes/:id`                       | Get single note                                      |
| POST   | `/api/notes`                           | Create note `{ title, content, tags }`               |
| PUT    | `/api/notes/:id`                       | Update note (partial)                                |
| DELETE | `/api/notes/:id`                       | Delete note                                          |
| GET    | `/api/notes/:id/versions`              | List version history                                 |
| POST   | `/api/notes/:id/versions/:vId/restore` | Restore a version                                    |

All responses follow `{ success: boolean, data: ... }`.

