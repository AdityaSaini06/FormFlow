from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import FormStatus


class FormCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str = Field(..., min_length=1, max_length=160)
    description: str | None = Field(default=None, max_length=1000)


class FormUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str | None = Field(default=None, min_length=1, max_length=160)
    description: str | None = Field(default=None, max_length=1000)


class FormRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None
    slug: str
    status: FormStatus
    created_at: datetime
    updated_at: datetime
    published_at: datetime | None


class FormListItem(FormRead):
    response_count: int = 0
