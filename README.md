# FormFlow

FormFlow is a full-stack Typeform-style form builder. Creators can build and publish forms, collect responses through a one-question-at-a-time experience, and review or export results.

## Features

- Form dashboard with draft/published status and response counts
- Form create, rename, duplicate, delete, publish, and unpublish workflows
- Drag-and-drop builder with live preview
- Short text, long text, email, multiple choice, dropdown, number, rating, and yes/no questions
- Required fields, descriptions, placeholders, and editable choice options
- Public shareable forms with transitions, keyboard navigation, progress, and validation
- Response summaries, individual submissions, and CSV export
- Responsive desktop and mobile layouts
- Seeded demo forms and responses

## Tech Stack

- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS, Axios, dnd-kit, Framer Motion
- Backend: FastAPI, SQLAlchemy 2, Pydantic 2
- Database: SQLite

## Local Setup

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements-dev.txt
python -m app.seed.run
python -m uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`. Interactive documentation is available at `http://localhost:8000/docs`.

### Frontend

In a second terminal:

```powershell
cd frontend
Copy-Item .env.example .env.local
npm.cmd install
npm.cmd run dev
```

The frontend runs at `http://localhost:3000`.

## Architecture

```text
frontend/
  src/app/        Next.js routes
  src/features/   Dashboard, builder, public form, and results UI
  src/services/   Typed API client functions
  src/types/      Shared frontend contracts

backend/app/
  api/routes/     Thin FastAPI route handlers
  models/         SQLAlchemy database models
  schemas/        Pydantic request and response models
  services/       Business logic and validation
  seed/           Idempotent demo data
```

The frontend communicates with the backend only through REST services. Backend routes delegate form, question, submission, and analytics logic to service modules.

## Database Schema

The database is normalized rather than storing form definitions or responses as JSON.

| Table | Purpose |
| --- | --- |
| `forms` | Form metadata, slug, status, and publish timestamps |
| `questions` | Ordered questions belonging to a form |
| `question_options` | Ordered options for multiple-choice and dropdown questions |
| `responses` | One submitted response session |
| `answers` | One typed answer per response and question |

Answers use nullable typed columns: `text_value`, `number_value`, `boolean_value`, or `question_option_id`. Only the column matching the question type is populated.

## API Overview

- `GET/POST /api/forms` - list and create forms
- `GET/PATCH/DELETE /api/forms/{id}` - read, rename, or delete a form
- `POST /api/forms/{id}/duplicate` - duplicate form structure
- `POST /api/forms/{id}/publish` and `/unpublish` - manage publication
- `GET /api/forms/{id}/builder` - load a form with ordered questions
- `/api/forms/{id}/questions` - create, update, delete, and reorder questions
- `GET /api/public/forms/{slug}` - load a published form without authentication
- `POST /api/public/forms/{slug}/responses` - validate and submit answers
- `GET /api/forms/{id}/results` - response summaries and recent submissions
- `GET /api/forms/{id}/results/export` - export all responses as CSV

## Verification

```powershell
cd backend
.\.venv\Scripts\python.exe -m unittest discover -s tests -v

cd ..\frontend
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run build
```

Do not run `npm.cmd run build` while the frontend development server is active because both processes write to `.next`.

## Configuration

- Frontend: `NEXT_PUBLIC_API_BASE_URL`
- Backend: `DATABASE_URL`, `API_PREFIX`, `BACKEND_CORS_ORIGINS`

Example values are provided in `frontend/.env.example` and `backend/.env.example`.

## Assumptions

- Creator authentication is intentionally omitted; the app assumes one default creator.
- Published forms are publicly accessible by slug.
- Logic branching, integrations, themes, and thank-you screen customization are represented as future settings.
