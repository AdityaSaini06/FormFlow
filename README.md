# Typeform Builder Clone

A production-minded Typeform clone built as a full-stack assignment.

## Tech Stack

- Frontend: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui-ready structure, Axios
- Backend: FastAPI, SQLAlchemy, SQLite, Pydantic

## Architecture

The repository is split into two deployable applications:

- `frontend/`: creator dashboard, form builder, public respondent flow, response views
- `backend/`: REST API, database models, schemas, services, seed data

Both apps are intentionally separated so the frontend only talks to the backend through typed service functions, while backend routes stay thin and delegate business logic to service modules.

## Local Development

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Default local URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Backend health check: `http://localhost:8000/api/health`

## Current Milestone

established the project foundation:

- Frontend app shell
- Backend app shell
- Health check endpoint
- Shared folder structure for future features
- API client boundary

## Planned Features

- Dashboard
- Form CRUD
- Form Builder
- Drag and Drop Questions
- Live Preview
- Public Shareable Forms
- One Question At A Time Experience
- Smooth Animations
- Keyboard Navigation
- Validation
- Progress Bar
- Submit Responses
- Responses Dashboard
- Response Details
- Summary Statistics
- Publish / Unpublish
- Seed Data
