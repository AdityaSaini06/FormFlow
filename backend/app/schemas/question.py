from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import QuestionType


class QuestionOptionCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    label: str = Field(..., min_length=1, max_length=160)
    value: str | None = Field(default=None, max_length=180)


class QuestionOptionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    question_id: int
    label: str
    value: str
    position: int
    created_at: datetime
    updated_at: datetime


class QuestionCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    type: QuestionType = QuestionType.SHORT_TEXT
    title: str = Field(..., min_length=1, max_length=240)
    description: str | None = Field(default=None, max_length=1000)
    placeholder: str | None = Field(default=None, max_length=180)
    is_required: bool = False
    options: list[QuestionOptionCreate] = Field(default_factory=list)


class QuestionUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    type: QuestionType | None = None
    title: str | None = Field(default=None, min_length=1, max_length=240)
    description: str | None = Field(default=None, max_length=1000)
    placeholder: str | None = Field(default=None, max_length=180)
    is_required: bool | None = None
    options: list[QuestionOptionCreate] | None = None


class QuestionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    form_id: int
    type: QuestionType
    title: str
    description: str | None
    placeholder: str | None
    is_required: bool
    position: int
    created_at: datetime
    updated_at: datetime
    options: list[QuestionOptionRead] = Field(default_factory=list)


class QuestionReorder(BaseModel):
    question_ids: list[int] = Field(..., min_length=1)
