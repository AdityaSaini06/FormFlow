from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.form import FormBuilderRead, FormCreate, FormListItem, FormRead, FormUpdate
from app.schemas.question import QuestionCreate, QuestionRead, QuestionReorder, QuestionUpdate
from app.schemas.response import FormResultsRead
from app.services import form_service
from app.services import question_service
from app.services import results_service
from app.services.exceptions import ConflictError, NotFoundError


router = APIRouter(prefix="/forms")
DBSession = Annotated[Session, Depends(get_db)]


@router.get("", response_model=list[FormListItem])
def list_forms(db: DBSession) -> list[FormListItem]:
    return form_service.list_forms(db)


@router.post("", response_model=FormRead, status_code=status.HTTP_201_CREATED)
def create_form(payload: FormCreate, db: DBSession) -> FormRead:
    form = form_service.create_form(db, payload)
    return form_service.to_read_model(form)


@router.get("/{form_id}", response_model=FormRead)
def get_form(form_id: int, db: DBSession) -> FormRead:
    try:
        form = form_service.get_form(db, form_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    return form_service.to_read_model(form)


@router.get("/{form_id}/builder", response_model=FormBuilderRead)
def get_builder_form(form_id: int, db: DBSession) -> FormBuilderRead:
    try:
        return question_service.get_builder_form(db, form_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.get("/{form_id}/results", response_model=FormResultsRead)
def get_form_results(form_id: int, db: DBSession) -> FormResultsRead:
    try:
        return results_service.get_form_results(db, form_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.get("/{form_id}/results/export")
def export_form_results(form_id: int, db: DBSession) -> Response:
    try:
        content = results_service.export_form_responses(db, form_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="form-{form_id}-responses.csv"'},
    )


@router.patch("/{form_id}", response_model=FormRead)
def update_form(form_id: int, payload: FormUpdate, db: DBSession) -> FormRead:
    try:
        form = form_service.update_form(db, form_id, payload)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    return form_service.to_read_model(form)


@router.post("/{form_id}/duplicate", response_model=FormRead, status_code=status.HTTP_201_CREATED)
def duplicate_form(form_id: int, db: DBSession) -> FormRead:
    try:
        form = form_service.duplicate_form(db, form_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    return form_service.to_read_model(form)


@router.post("/{form_id}/publish", response_model=FormRead)
def publish_form(form_id: int, db: DBSession) -> FormRead:
    try:
        form = form_service.publish_form(db, form_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc

    return form_service.to_read_model(form)


@router.post("/{form_id}/unpublish", response_model=FormRead)
def unpublish_form(form_id: int, db: DBSession) -> FormRead:
    try:
        form = form_service.unpublish_form(db, form_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc

    return form_service.to_read_model(form)


@router.delete("/{form_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_form(form_id: int, db: DBSession) -> None:
    try:
        form_service.delete_form(db, form_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("/{form_id}/questions", response_model=QuestionRead, status_code=status.HTTP_201_CREATED)
def create_question(form_id: int, payload: QuestionCreate, db: DBSession) -> QuestionRead:
    try:
        return question_service.create_question(db, form_id, payload)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("/{form_id}/questions/reorder", response_model=list[QuestionRead])
def reorder_questions(form_id: int, payload: QuestionReorder, db: DBSession) -> list[QuestionRead]:
    try:
        return question_service.reorder_questions(db, form_id, payload)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.patch("/{form_id}/questions/{question_id}", response_model=QuestionRead)
def update_question(
    form_id: int,
    question_id: int,
    payload: QuestionUpdate,
    db: DBSession,
) -> QuestionRead:
    try:
        return question_service.update_question(db, form_id, question_id, payload)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.delete("/{form_id}/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(form_id: int, question_id: int, db: DBSession) -> None:
    try:
        question_service.delete_question(db, form_id, question_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
