# 🤖 AI Guilda — Cobli

> Internal web app for Cobli's AI Guild — a repository of AI/automation projects and a structured channel to request help from guild members.

---

## ✨ Features

- **Project Catalog** — Browse and search all AI/automation projects across teams
- **Semantic Search** — Find projects by describing a problem; results are ranked by relevance
- **Help Requests** — Submit a help request and receive automatic suggestions of relevant projects and people
- **Training Resources** — Curated training materials organized by category
- **Admin Panel** — Manage projects, help requests, and trainings with a password-protected admin area

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS + shadcn/ui |
| Backend | Express.js (REST API) |
| Database | PostgreSQL + Drizzle ORM |
| Routing | wouter (client), Express (server) |
| Auth | Token-based admin sessions |

---

## 📁 Project Structure

```
├── client/          # React frontend (Vite)
│   └── src/
│       ├── components/   # UI components
│       ├── pages/        # Page-level components
│       └── lib/          # Utilities, hooks, constants
├── server/          # Express backend
│   ├── index.ts     # Entry point
│   ├── routes.ts    # API routes
│   └── storage.ts   # Data access layer (IStorage interface)
├── shared/          # Shared types and schemas (Drizzle + Zod)
└── script/          # Build scripts
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database

### Installation

```bash
# Install dependencies
npm install

# Push the database schema
npm run db:push

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5000`.

### Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `ADMIN_PASSWORD` | Password for the admin panel |

---

## 📄 Pages

| Route | Description |
|---|---|
| `/` | Home — semantic search + filters |
| `/projetos` | Paginated project list |
| `/projetos/:id` | Project detail page |
| `/ajuda` | Help request form with suggestions |
| `/treinamentos` | Training resources grid |
| `/admin/login` | Admin login |
| `/admin` | Admin panel (projects, requests, trainings) |

---

## 🔌 API Endpoints

### Projects
```
GET    /api/projects          # List/search projects (?q=&tag=&team=&status=&type=)
GET    /api/projects/:id      # Get single project
POST   /api/projects          # Create project
PATCH  /api/projects/:id      # Update project (admin)
DELETE /api/projects/:id      # Delete project (admin)
GET    /api/tags              # Get all unique tags
```

### Help Requests
```
GET    /api/help-requests           # List help requests
POST   /api/help-requests           # Create help request (returns suggestions)
PATCH  /api/help-requests/:id/status # Update status (admin)
```

### Trainings
```
GET    /api/trainings         # List trainings
POST   /api/trainings         # Create training (admin)
PATCH  /api/trainings/:id     # Update training (admin)
DELETE /api/trainings/:id     # Delete training (admin)
```

### Admin
```
POST   /api/admin/login       # Login
POST   /api/admin/logout      # Logout
GET    /api/admin/verify      # Verify token
```

---

## 🔮 Extending the App

The storage layer uses an `IStorage` interface (`server/storage.ts`), making it easy to swap backends:

- **Google Sheets** — Implement `GoogleSheetsStorage`
- **Firestore** — Implement `FirestoreStorage`
- **Slack notifications** — Add a webhook call in `createHelpRequest`
- **Jira integration** — Create Jira tickets from help requests

---

## 📜 License

MIT
