# AI Guilda - Cobli

## Overview
Internal web app for Cobli's AI Guild - a repository of AI/automation projects and a structured channel to ask for help from guild members.

## Architecture
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui components
- **Backend**: Express.js REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Routing**: wouter (frontend), Express (backend)
- **Admin Auth**: Token-based sessions (in-memory Set), password via ADMIN_PASSWORD env var

## Key Pages
1. **Home** (`/`) - Semantic search + filters (tag, team, status, type)
2. **Projects** (`/projetos`) - Paginated list with project cards
3. **Project Detail** (`/projetos/:id`) - Full project info + links + "ask for help" button
4. **Ask for Help** (`/ajuda`) - Form that submits help request and shows suggestions
5. **Trainings** (`/treinamentos`) - Training resources grid with categories
6. **Admin Login** (`/admin/login`) - Password-based admin login
7. **Admin Panel** (`/admin`) - Tabs for managing Projects, Help Requests, and Trainings

## Data Model
- `projects` table: id, title, status, type, tags[], team, owner, lastUpdated, summary, problem, solution, dataDependencies, risks, metrics, links (jsonb)
- `help_requests` table: id, title, description, urgency, context, requester, team, projectId, createdAt, status, suggestedProjects[], suggestedPeople[]
- `trainings` table: id, title, description, link, category, createdAt
- `teams` table: id, name (unique) - dynamic, users can create new teams inline
- `project_types` table: id, name (unique) - dynamic, users can create new types inline

## API Endpoints
- `GET /api/projects?q=&tag=&team=&status=&type=` - List/search projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project (public)
- `PATCH /api/projects/:id` - Update project (admin)
- `DELETE /api/projects/:id` - Delete project (admin)
- `GET /api/tags` - Get all unique tags
- `GET /api/teams` - List teams
- `POST /api/teams` - Create team (public)
- `GET /api/project-types` - List project types
- `POST /api/project-types` - Create project type (public)
- `GET /api/help-requests` - List help requests
- `POST /api/help-requests` - Create help request (returns suggestions)
- `PATCH /api/help-requests/:id/status` - Update help request status (admin)
- `GET /api/trainings` - List trainings
- `POST /api/trainings` - Create training (admin)
- `PATCH /api/trainings/:id` - Update training (admin)
- `DELETE /api/trainings/:id` - Delete training (admin)
- `POST /api/admin/login` - Login with password
- `POST /api/admin/logout` - Logout (admin)
- `GET /api/admin/verify` - Verify admin token

## Search & Suggestions
- Search works by matching query words against title, summary, problem, solution, and tags
- Problem field gets higher weight in scoring (semantic-like search by problem description)
- People suggestions based on project ownership and relevance scoring

## Key Frontend Files
- `client/src/lib/admin.ts` - Admin context, useAdmin hook, adminFetch helper
- `client/src/components/project-form-dialog.tsx` - Project creation/editing form dialog
- `client/src/components/app-sidebar.tsx` - Sidebar with navigation, submit project, and admin link
- `client/src/components/team-select.tsx` - Combobox for teams with search and inline creation
- `client/src/components/type-select.tsx` - Combobox for project types with search and inline creation
- `client/src/lib/constants.ts` - Color maps for status, urgency, and type icons

## How to Evolve
- **Google Sheets integration**: Replace `DatabaseStorage` in `server/storage.ts` with a `GoogleSheetsStorage` class implementing `IStorage`
- **Firestore integration**: Replace with `FirestoreStorage` class
- **Slack notifications**: Add a webhook call in the `createHelpRequest` method
- **Jira integration**: Add a Jira API call to create tickets from help requests

## Running
- `npm run dev` starts both frontend and backend
- Database schema managed with Drizzle Kit (`npm run db:push`)
