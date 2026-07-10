import re

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models import Answer, Form, FormStatus, Question, QuestionOption, QuestionType, Response
from app.schemas.form import FormBuilderRead
from app.schemas.response import AnswerSubmit, ResponseSubmit, ResponseSubmitResult
from app.services.exceptions import ConflictError, NotFoundError


EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def get_public_form(db: Session, slug: str) -> FormBuilderRead:
    form = _get_published_form(db, slug)
    return FormBuilderRead.model_validate(form)


def submit_response(db: Session, slug: str, payload: ResponseSubmit) -> ResponseSubmitResult:
    form = _get_published_form(db, slug)
    answers_by_question_id = {answer.question_id: answer for answer in payload.answers}

    for question in form.questions:
        answer = answers_by_question_id.get(question.id)
        if question.is_required and not _has_value(answer):
            raise ConflictError(f"Question {question.id} is required.")
        if answer is not None and _has_value(answer):
            _validate_answer(question, answer)

    response = Response(
        form_id=form.id,
        completion_time_seconds=payload.completion_time_seconds,
    )

    for question in form.questions:
        answer = answers_by_question_id.get(question.id)
        if answer is None or not _has_value(answer):
            continue

        response.answers.append(
            Answer(
                question_id=question.id,
                question_option_id=answer.question_option_id,
                text_value=_clean_text(answer.text_value),
                number_value=answer.number_value,
                boolean_value=answer.boolean_value,
            )
        )

    db.add(response)
    db.commit()
    db.refresh(response)
    return ResponseSubmitResult(response_id=response.id, submitted_at=response.submitted_at)


def _get_published_form(db: Session, slug: str) -> Form:
    form = db.scalar(
        select(Form)
        .options(selectinload(Form.questions).selectinload(Question.options))
        .where(Form.slug == slug)
    )
    if form is None:
        raise NotFoundError("Form not found.")
    if form.status != FormStatus.PUBLISHED:
        raise NotFoundError("Form is not published.")
    return form


def _validate_answer(question: Question, answer: AnswerSubmit) -> None:
    if question.type in {QuestionType.SHORT_TEXT, QuestionType.LONG_TEXT}:
        if not _clean_text(answer.text_value):
            raise ConflictError(f"Question {question.id} expects a text answer.")
        return

    if question.type == QuestionType.EMAIL:
        text_value = _clean_text(answer.text_value)
        if not text_value or not EMAIL_PATTERN.match(text_value):
            raise ConflictError(f"Question {question.id} expects a valid email answer.")
        return

    if question.type == QuestionType.MULTIPLE_CHOICE:
        option_ids = {option.id for option in question.options}
        if answer.question_option_id not in option_ids:
            raise ConflictError(f"Question {question.id} expects one of its saved options.")
        return

    if question.type == QuestionType.RATING:
        if answer.number_value is None or answer.number_value < 1 or answer.number_value > 5:
            raise ConflictError(f"Question {question.id} expects a rating from 1 to 5.")
        return

    if question.type == QuestionType.BOOLEAN:
        if answer.boolean_value is None:
            raise ConflictError(f"Question {question.id} expects yes or no.")
        return


def _has_value(answer: AnswerSubmit | None) -> bool:
    if answer is None:
        return False

    return (
        _clean_text(answer.text_value) is not None
        or answer.number_value is not None
        or answer.boolean_value is not None
        or answer.question_option_id is not None
    )


def _clean_text(value: str | None) -> str | None:
    if value is None:
        return None

    stripped = value.strip()
    return stripped or None
