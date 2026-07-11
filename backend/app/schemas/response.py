from datetime import datetime

from pydantic import BaseModel, Field

from app.models.enums import FormStatus, QuestionType


class AnswerSubmit(BaseModel):
    question_id: int
    question_option_id: int | None = None
    text_value: str | None = Field(default=None, max_length=1000)
    number_value: float | None = None
    boolean_value: bool | None = None


class ResponseSubmit(BaseModel):
    answers: list[AnswerSubmit] = Field(default_factory=list)
    completion_time_seconds: int | None = Field(default=None, ge=0)


class ResponseSubmitResult(BaseModel):
    response_id: int
    submitted_at: datetime


class ResultOptionSummary(BaseModel):
    option_id: int | None = None
    label: str
    count: int
    percentage: float


class QuestionResultSummary(BaseModel):
    question_id: int
    title: str
    type: QuestionType
    response_count: int
    average_number: float | None = None
    options: list[ResultOptionSummary] = Field(default_factory=list)
    text_answers: list[str] = Field(default_factory=list)


class ResponseAnswerRead(BaseModel):
    question_id: int
    question_title: str
    value: str


class ResponseListItem(BaseModel):
    id: int
    submitted_at: datetime
    completion_time_seconds: int | None = None
    answers: list[ResponseAnswerRead] = Field(default_factory=list)


class FormResultsRead(BaseModel):
    id: int
    title: str
    description: str | None
    slug: str
    status: FormStatus
    response_count: int
    average_completion_time_seconds: int | None = None
    questions: list[QuestionResultSummary] = Field(default_factory=list)
    recent_responses: list[ResponseListItem] = Field(default_factory=list)
