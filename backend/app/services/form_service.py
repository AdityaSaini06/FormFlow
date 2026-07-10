from datetime import UTC, datetime
import re

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Form, FormStatus, Question, QuestionOption, Response
from app.schemas.form import FormCreate, FormListItem, FormRead, FormUpdate
from app.services.exceptions import ConflictError, NotFoundError


SLUG_PATTERN = re.compile(r"[^a-z0-9]+")


def list_forms(db: Session) -> list[FormListItem]:
    response_counts = (
        select(Response.form_id, func.count(Response.id).label("response_count"))
        .group_by(Response.form_id)
        .subquery()
    )
    statement = (
        select(Form, func.coalesce(response_counts.c.response_count, 0).label("response_count"))
        .outerjoin(response_counts, Form.id == response_counts.c.form_id)
        .order_by(Form.updated_at.desc())
    )

    rows = db.execute(statement).all()
    return [_to_list_item(form, response_count) for form, response_count in rows]


def get_form(db: Session, form_id: int) -> Form:
    form = db.get(Form, form_id)
    if form is None:
        raise NotFoundError("Form not found.")
    return form


def create_form(db: Session, payload: FormCreate) -> Form:
    form = Form(
        title=payload.title,
        description=payload.description,
        slug=_generate_unique_slug(db, payload.title),
    )
    db.add(form)
    db.commit()
    db.refresh(form)
    return form


def update_form(db: Session, form_id: int, payload: FormUpdate) -> Form:
    form = get_form(db, form_id)
    changes = payload.model_dump(exclude_unset=True)

    for field, value in changes.items():
        setattr(form, field, value)

    db.commit()
    db.refresh(form)
    return form


def duplicate_form(db: Session, form_id: int) -> Form:
    source = get_form(db, form_id)
    duplicate = Form(
        title=f"{source.title} Copy",
        description=source.description,
        slug=_generate_unique_slug(db, f"{source.title} copy"),
        status=FormStatus.DRAFT,
    )

    for question in source.questions:
        copied_question = Question(
            type=question.type,
            title=question.title,
            description=question.description,
            placeholder=question.placeholder,
            is_required=question.is_required,
            position=question.position,
        )
        for option in question.options:
            copied_question.options.append(
                QuestionOption(
                    label=option.label,
                    value=option.value,
                    position=option.position,
                )
            )
        duplicate.questions.append(copied_question)

    db.add(duplicate)
    db.commit()
    db.refresh(duplicate)
    return duplicate


def publish_form(db: Session, form_id: int) -> Form:
    form = get_form(db, form_id)
    if form.status == FormStatus.ARCHIVED:
        raise ConflictError("Archived forms cannot be published.")

    form.status = FormStatus.PUBLISHED
    form.published_at = datetime.now(UTC)
    db.commit()
    db.refresh(form)
    return form


def unpublish_form(db: Session, form_id: int) -> Form:
    form = get_form(db, form_id)
    if form.status == FormStatus.ARCHIVED:
        raise ConflictError("Archived forms cannot be unpublished.")

    form.status = FormStatus.DRAFT
    form.published_at = None
    db.commit()
    db.refresh(form)
    return form


def delete_form(db: Session, form_id: int) -> None:
    form = get_form(db, form_id)
    db.delete(form)
    db.commit()


def to_read_model(form: Form) -> FormRead:
    return FormRead.model_validate(form)


def _to_list_item(form: Form, response_count: int) -> FormListItem:
    data = FormRead.model_validate(form).model_dump()
    return FormListItem(**data, response_count=response_count)


def _generate_unique_slug(db: Session, title: str) -> str:
    base_slug = _slugify(title)
    candidate = base_slug
    suffix = 2

    while _slug_exists(db, candidate):
        candidate = f"{base_slug}-{suffix}"
        suffix += 1

    return candidate


def _slugify(value: str) -> str:
    slug = SLUG_PATTERN.sub("-", value.lower()).strip("-")
    return slug or "untitled-form"


def _slug_exists(db: Session, slug: str) -> bool:
    statement = select(Form.id).where(Form.slug == slug).limit(1)
    return db.execute(statement).scalar_one_or_none() is not None
