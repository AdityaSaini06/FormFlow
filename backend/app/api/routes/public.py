from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.form import FormBuilderRead
from app.schemas.response import ResponseSubmit, ResponseSubmitResult
from app.services import public_form_service
from app.services.exceptions import ConflictError, NotFoundError


router = APIRouter(prefix="/public/forms")
DBSession = Annotated[Session, Depends(get_db)]


@router.get("/{slug}", response_model=FormBuilderRead)
def get_public_form(slug: str, db: DBSession) -> FormBuilderRead:
    try:
        return public_form_service.get_public_form(db, slug)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("/{slug}/responses", response_model=ResponseSubmitResult, status_code=status.HTTP_201_CREATED)
def submit_response(slug: str, payload: ResponseSubmit, db: DBSession) -> ResponseSubmitResult:
    try:
        return public_form_service.submit_response(db, slug, payload)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
