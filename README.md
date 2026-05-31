# TaskMind AI — AI-Powered Task Manager

An intelligent task manager that uses Google Gemini AI to automatically prioritize tasks, break them into subtasks, estimate time, and assign tags — the moment you add a task.

![Node.js](https://img.shields.io/badge/Node.js-24+-green?style=flat-square)
![Express](https://img.shields.io/badge/Express-4.18-black?style=flat-square)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square)
![Gemini](https://img.shields.io/badge/Gemini-2.5--flash-orange?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

---

## How It Works

You type: `"Build a login system for my Flask app"`

Gemini instantly returns:

```json
{
  "priority": "high",
  "estimated_time": "3 days",
  "tags": ["JWT", "Flask", "Authentication", "Security"],
  "subtasks": [
    { "title": "Install and configure Flask-JWT-Extended", "done": false },
    { "title": "Design user model and database schema", "done": false },
    { "title": "Create /register endpoint with password hashing", "done": false },
    { "title": "Create /login endpoint and token generation", "done": false },
    { "title": "Implement JWT-protected routes using decorators", "done": false }
  ]
}
```

All saved to your personal Supabase database, visible only to you.

---

## Features

- **AI task enrichment** — every task is auto-analyzed by Gemini for priority, time estimate, tags, and subtasks
- **Google OAuth login** — one-click sign in, each user sees only their own tasks
- **Row-Level Security** — Supabase RLS policies ensure strict data isolation between users
- **Subtask tracking** — check off individual subtasks with a live progress bar
- **Status management** — move tasks between Todo, In Progress, and Done
- **Filter and search** — filter by status or priority in one click
- **Full REST API** — all operations exposed as clean JSON endpoints

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Database | Supabase (PostgreSQL) |
| AI | Google Gemini 2.5 Flash API |
| Auth | Supabase Auth + Google OAuth |
| Frontend | Vanilla JS, HTML, CSS |
| Deployment | Render |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | Get all tasks for logged-in user |
| GET | `/api/tasks/:id` | Get single task |
| POST | `/api/tasks` | Create task with AI enrichment |
| PATCH | `/api/tasks/:id` | Update task status or subtasks |
| DELETE | `/api/tasks/:id` | Delete task |

All endpoints require a valid Supabase JWT token in the `Authorization: Bearer` header.

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free)
- A [Gemini API key](https://aistudio.google.com/apikey) (free)
- Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com)

### Installation

```bash
# Clone the repo
git clone https://github.com/Dineshv0311/taskmanager-api.git
cd taskmanager-api

# Install dependencies
npm install
```

### Database Setup

Run this SQL in your Supabase SQL Editor:

```sql
create table tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  priority text default 'medium',
  status text default 'todo',
  tags text[],
  estimated_time text,
  subtasks jsonb default '[]',
  user_id uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

alter table tasks enable row level security;

create policy "Users see own tasks" on tasks
  for select using (auth.uid() = user_id);

create policy "Users insert own tasks" on tasks
  for insert with check (auth.uid() = user_id);

create policy "Users update own tasks" on tasks
  for update using (auth.uid() = user_id);

create policy "Users delete own tasks" on tasks
  for delete using (auth.uid() = user_id);
```

### Configuration

Create a `.env` file in the root:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
PORT=3000
```

### Run locally

```bash
node src/app.js
```

Open `http://localhost:3000`

---

## Project Structure

```
taskmanager-api/
├── src/
│   ├── app.js          # Express server entry point
│   ├── routes.js       # All API routes with auth middleware
│   ├── db.js           # Supabase client
│   └── gemini.js       # Gemini AI enrichment logic
├── public/
│   └── index.html      # Frontend UI with Google OAuth
├── .env                # Environment variables (not committed)
├── .gitignore
└── package.json
```

---

## Deployment

Deployed on [Render](https://render.com) (free tier).

1. Fork this repo
2. Create a new Web Service on Render
3. Set Build Command: `npm install`
4. Set Start Command: `node src/app.js`
5. Add environment variables in Render dashboard
6. Deploy

---

## What I Learned

- Designing a **RESTful API** with Express and proper middleware architecture
- **JWT-based authentication** with Supabase Auth and Google OAuth
- **Row-Level Security (RLS)** in PostgreSQL for multi-user data isolation
- **Prompt engineering** for structured JSON output from LLMs
- Connecting a **Node.js backend to PostgreSQL** via Supabase client
- Deploying a **Node.js app to production** on Render

---

## Author

Built by **Dinesh V** as a portfolio project.

- GitHub: [@Dineshv0311](https://github.com/Dineshv0311)

---

## License

MIT
