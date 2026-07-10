from datetime import datetime

from pydantic import BaseModel, Field


class AnswerSubmit(BaseModel):
    question_id: int
    question_option_id: int | None = None
    text_value: str | None = Field(default=None, max_length=1000)
    number_value: int | None = None
    boolean_value: bool | None = None


class ResponseSubmit(BaseModel):
    answers: list[AnswerSubmit] = Field(default_factory=list)
    completion_time_seconds: int | None = Field(default=None, ge=0)


class ResponseSubmitResult(BaseModel):
    response_id: int
    submitted_at: datetime
