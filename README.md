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

## Database Design

The backend uses normalized SQLAlchemy models instead of storing whole forms as JSON. This keeps form editing, response validation, and analytics queryable.

Core tables:

- `forms`: top-level form metadata such as title, description, slug, status, and publish timestamps.
- `questions`: ordered questions that belong to a form. The `position` field supports drag-and-drop ordering.
- `question_options`: ordered options for choice-style questions.
- `responses`: one submitted response session for a form.
- `answers`: one answer for one question inside one response.

Relationships:

```text
Form
  has many Questions
  has many Responses

Question
  belongs to Form
  may have many QuestionOptions
  has many Answers

Response
  belongs to Form
  has many Answers

Answer
  belongs to Response
  belongs to Question
  may reference QuestionOption
```

Answer values are stored in typed nullable columns:

- `text_value`: short text, long text, and email answers
- `number_value`: numeric answers such as ratings
- `boolean_value`: yes/no answers
- `question_option_id`: selected option for multiple-choice answers

Only the relevant value column is filled for each answer. This is more queryable than a single string or JSON value, especially for results summaries and option counts.

## Backend API Contracts

Form endpoints:

- `GET /api/forms`: list forms for the dashboard, including response counts
- `POST /api/forms`: create a draft form
- `GET /api/forms/{form_id}`: fetch one form
- `GET /api/forms/{form_id}/builder`: fetch one form with ordered questions and options for the builder
- `PATCH /api/forms/{form_id}`: update form metadata
- `POST /api/forms/{form_id}/duplicate`: duplicate a form structure without copying responses
- `POST /api/forms/{form_id}/publish`: publish a form
- `POST /api/forms/{form_id}/unpublish`: return a form to draft
- `DELETE /api/forms/{form_id}`: delete a form
- `POST /api/forms/{form_id}/questions`: add a question to a form
- `PATCH /api/forms/{form_id}/questions/{question_id}`: update question settings
- `DELETE /api/forms/{form_id}/questions/{question_id}`: remove a question and normalize ordering
- `POST /api/forms/{form_id}/questions/reorder`: persist a new full question order

Routes are intentionally thin. They translate HTTP requests and errors, while service modules contain business logic such as slug generation, duplication, and publish state changes.

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

Backend with test/dev dependencies:

```bash
cd backend
.venv\Scripts\activate
pip install -r requirements-dev.txt
```

Seed demo data:

```bash
cd backend
.venv\Scripts\activate
python -m app.seed.run
```

Default local URLs:

- Frontend: `http://localhost:3000` or `http://localhost:3001`
- Backend: `http://localhost:8000`
- Backend health check: `http://localhost:8000/api/health`

## Current Milestone

established the project foundation and database model layer:

- Frontend app shell
- Backend app shell
- Health check endpoint
- Shared folder structure for future features
- API client boundary
- Normalized SQLAlchemy models for forms, questions, options, responses, and answers
- Form CRUD API foundation with Pydantic schemas, thin routes, and service-layer logic
- Idempotent seed script for demo forms and response counts
- Builder API foundation and first three-panel builder UI shell

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
