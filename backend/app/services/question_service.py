import re

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models import Form, Question, QuestionOption, QuestionType
from app.schemas.form import FormBuilderRead
from app.schemas.question import QuestionCreate, QuestionOptionCreate, QuestionRead, QuestionReorder, QuestionUpdate
from app.services.exceptions import ConflictError, NotFoundError


OPTION_VALUE_PATTERN = re.compile(r"[^a-z0-9]+")


def get_builder_form(db: Session, form_id: int) -> FormBuilderRead:
    statement = (
        select(Form)
        .options(selectinload(Form.questions).selectinload(Question.options))
        .where(Form.id == form_id)
    )
    form = db.execute(statement).scalar_one_or_none()
    if form is None:
        raise NotFoundError("Form not found.")

    return FormBuilderRead.model_validate(form)


def create_question(db: Session, form_id: int, payload: QuestionCreate) -> QuestionRead:
    form = db.get(Form, form_id)
    if form is None:
        raise NotFoundError("Form not found.")

    question = Question(
        form_id=form.id,
        type=payload.type,
        title=payload.title,
        description=payload.description,
        placeholder=payload.placeholder,
        is_required=payload.is_required,
        position=_next_position(db, form.id),
    )
    _replace_options(question, payload, payload.type)

    db.add(question)
    db.commit()
    db.refresh(question)
    return _read_question(db, form_id, question.id)


def update_question(db: Session, form_id: int, question_id: int, payload: QuestionUpdate) -> QuestionRead:
    question = _get_question(db, form_id, question_id)
    changes = payload.model_dump(exclude_unset=True, exclude={"options"})
    next_type = payload.type or question.type

    for field, value in changes.items():
        setattr(question, field, value)

    if payload.options is not None:
        question.options.clear()
        db.flush()
        _replace_options(question, payload, next_type)
    elif payload.type is not None and payload.type != QuestionType.MULTIPLE_CHOICE:
        question.options.clear()
        db.flush()
    elif payload.type == QuestionType.MULTIPLE_CHOICE and not question.options:
        _replace_options(question, payload, next_type)

    db.commit()
    return _read_question(db, form_id, question.id)


def delete_question(db: Session, form_id: int, question_id: int) -> None:
    question = _get_question(db, form_id, question_id)
    db.delete(question)
    db.flush()
    _normalize_positions(db, form_id)
    db.commit()


def reorder_questions(db: Session, form_id: int, payload: QuestionReorder) -> list[QuestionRead]:
    questions = db.scalars(
        select(Question)
        .options(selectinload(Question.options))
        .where(Question.form_id == form_id)
        .order_by(Question.position)
    ).all()

    if not questions:
        raise NotFoundError("Form has no questions to reorder.")

    existing_ids = {question.id for question in questions}
    requested_ids = set(payload.question_ids)
    if existing_ids != requested_ids:
        raise ConflictError("Question order must include every question exactly once.")

    question_by_id = {question.id: question for question in questions}
    for index, question in enumerate(questions, start=1):
        question.position = -index
    db.flush()

    for position, question_id in enumerate(payload.question_ids, start=1):
        question_by_id[question_id].position = position

    db.commit()
    return [_read_question(db, form_id, question_id) for question_id in payload.question_ids]


def _get_question(db: Session, form_id: int, question_id: int) -> Question:
    question = db.scalar(
        select(Question)
        .options(selectinload(Question.options))
        .where(Question.form_id == form_id, Question.id == question_id)
    )
    if question is None:
        raise NotFoundError("Question not found.")
    return question


def _read_question(db: Session, form_id: int, question_id: int) -> QuestionRead:
    question = _get_question(db, form_id, question_id)
    return QuestionRead.model_validate(question)


def _next_position(db: Session, form_id: int) -> int:
    max_position = db.scalar(select(func.max(Question.position)).where(Question.form_id == form_id))
    return (max_position or 0) + 1


def _normalize_positions(db: Session, form_id: int) -> None:
    questions = db.scalars(
        select(Question).where(Question.form_id == form_id).order_by(Question.position)
    ).all()
    for position, question in enumerate(questions, start=1):
        question.position = position


def _replace_options(
    question: Question,
    payload: QuestionCreate | QuestionUpdate,
    question_type: QuestionType | None,
) -> None:
    options = payload.options or _default_options_for(question_type)
    if question_type != QuestionType.MULTIPLE_CHOICE:
        return

    for position, option in enumerate(options, start=1):
        question.options.append(
            QuestionOption(
                label=option.label,
                value=option.value or _option_value(option.label),
                position=position,
            )
        )


def _default_options_for(question_type: QuestionType | None) -> list[QuestionOptionCreate]:
    if question_type != QuestionType.MULTIPLE_CHOICE:
        return []

    return [
        QuestionOptionCreate(label="Option 1", value="option_1"),
        QuestionOptionCreate(label="Option 2", value="option_2"),
    ]


def _option_value(label: str) -> str:
    value = OPTION_VALUE_PATTERN.sub("_", label.lower()).strip("_")
    return value or "option"
