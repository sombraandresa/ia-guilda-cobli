# AI Guilda - Cobli

## Overview
Internal web app for Cobli's AI Guild - a repository of AI/automation projects and a structured channel to ask for help from guild members.

## Architecture
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui components
- **Backend**: Express.js REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Routing**: wouter (frontend), Express (backend)

## Key Pages
1. **Home** (`/`) - Semantic search + filters (tag, team, status, type)
2. **Projects** (`/projetos`) - Paginated list with project cards
3. **Project Detail** (`/projetos/:id`) - Full project info + links + "ask for help" button
4. **Ask for Help** (`/ajuda`) - Form that submits help request and shows suggestions

## Data Model
- `projects` table: id, title, status, type, tags[], team, owner, lastUpdated, summary, problem, solution, dataDependencies, risks, metrics, links (jsonb)
- `help_requests` table: id, title, description, urgency, context, requester, team, projectId, createdAt, status, suggestedProjects[], suggestedPeople[]

## API Endpoints
- `GET /api/projects?q=&tag=&team=&status=&type=` - List/search projects
- `GET /api/projects/:id` - Get single project
- `GET /api/tags` - Get all unique tags
- `GET /api/help-requests` - List help requests
- `POST /api/help-requests` - Create help request (returns suggestions)

## Search & Suggestions
- Search works by matching query words against title, summary, problem, solution, and tags
- Problem field gets higher weight in scoring (semantic-like search by problem description)
- People suggestions based on project ownership and relevance scoring

## How to Evolve
- **Google Sheets integration**: Replace `DatabaseStorage` in `server/storage.ts` with a `GoogleSheetsStorage` class implementing `IStorage`
- **Firestore integration**: Replace with `FirestoreStorage` class
- **Slack notifications**: Add a webhook call in the `createHelpRequest` method
- **Jira integration**: Add a Jira API call to create tickets from help requests

## Running
- `npm run dev` starts both frontend and backend
- Database schema managed with Drizzle Kit (`npm run db:push`)
