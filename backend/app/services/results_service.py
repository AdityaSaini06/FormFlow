from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models import Answer, Form, Question, QuestionType, Response
from app.schemas.response import (
    FormResultsRead,
    QuestionResultSummary,
    ResponseAnswerRead,
    ResponseListItem,
    ResultOptionSummary,
)
from app.services.exceptions import NotFoundError


def get_form_results(db: Session, form_id: int) -> FormResultsRead:
    form = db.scalar(
        select(Form)
        .options(
            selectinload(Form.questions).selectinload(Question.options),
            selectinload(Form.responses).selectinload(Response.answers).selectinload(Answer.question_option),
        )
        .where(Form.id == form_id)
    )
    if form is None:
        raise NotFoundError("Form not found.")

    questions = sorted(form.questions, key=lambda question: question.position)
    responses = sorted(form.responses, key=lambda response: response.submitted_at, reverse=True)
    answers_by_question = _answers_by_question(responses)

    completion_times = [
        response.completion_time_seconds
        for response in responses
        if response.completion_time_seconds is not None
    ]

    return FormResultsRead(
        id=form.id,
        title=form.title,
        description=form.description,
        slug=form.slug,
        status=form.status,
        response_count=len(responses),
        average_completion_time_seconds=_average_int(completion_times),
        questions=[
            _question_summary(question, answers_by_question.get(question.id, []))
            for question in questions
        ],
        recent_responses=_recent_responses(responses, questions),
    )


def _answers_by_question(responses: list[Response]) -> dict[int, list[Answer]]:
    grouped: dict[int, list[Answer]] = {}
    for response in responses:
        for answer in response.answers:
            grouped.setdefault(answer.question_id, []).append(answer)
    return grouped


def _question_summary(question: Question, answers: list[Answer]) -> QuestionResultSummary:
    numbers = [answer.number_value for answer in answers if answer.number_value is not None]

    return QuestionResultSummary(
        question_id=question.id,
        title=question.title,
        type=question.type,
        response_count=len(answers),
        average_number=_average_float(numbers),
        options=_option_summaries(question, answers),
        text_answers=[
            answer.text_value
            for answer in answers
            if answer.text_value is not None
        ][:5],
    )


def _option_summaries(question: Question, answers: list[Answer]) -> list[ResultOptionSummary]:
    if question.type == QuestionType.MULTIPLE_CHOICE:
        return [
            _option_summary(option.id, option.label, _count_option_answers(answers, option.id), len(answers))
            for option in question.options
        ]

    if question.type == QuestionType.RATING:
        return [
            _option_summary(None, str(rating), _count_number_answers(answers, rating), len(answers))
            for rating in range(1, 6)
        ]

    if question.type == QuestionType.BOOLEAN:
        return [
            _option_summary(None, "Yes", _count_boolean_answers(answers, True), len(answers)),
            _option_summary(None, "No", _count_boolean_answers(answers, False), len(answers)),
        ]

    return []


def _option_summary(option_id: int | None, label: str, count: int, total: int) -> ResultOptionSummary:
    return ResultOptionSummary(
        option_id=option_id,
        label=label,
        count=count,
        percentage=round((count / total) * 100, 1) if total else 0,
    )


def _recent_responses(responses: list[Response], questions: list[Question]) -> list[ResponseListItem]:
    question_by_id = {question.id: question for question in questions}

    return [
        ResponseListItem(
            id=response.id,
            submitted_at=response.submitted_at,
            completion_time_seconds=response.completion_time_seconds,
            answers=[
                ResponseAnswerRead(
                    question_id=answer.question_id,
                    question_title=question_by_id[answer.question_id].title,
                    value=_answer_value(answer),
                )
                for answer in response.answers
                if answer.question_id in question_by_id
            ],
        )
        for response in responses[:20]
    ]


def _answer_value(answer: Answer) -> str:
    if answer.question_option is not None:
        return answer.question_option.label
    if answer.text_value is not None:
        return answer.text_value
    if answer.number_value is not None:
        return str(answer.number_value)
    if answer.boolean_value is not None:
        return "Yes" if answer.boolean_value else "No"
    return ""


def _count_option_answers(answers: list[Answer], option_id: int) -> int:
    return sum(1 for answer in answers if answer.question_option_id == option_id)


def _count_number_answers(answers: list[Answer], value: int) -> int:
    return sum(1 for answer in answers if answer.number_value == value)


def _count_boolean_answers(answers: list[Answer], value: bool) -> int:
    return sum(1 for answer in answers if answer.boolean_value is value)


def _average_int(values: list[int]) -> int | None:
    return round(sum(values) / len(values)) if values else None


def _average_float(values: list[int]) -> float | None:
    return round(sum(values) / len(values), 1) if values else None
