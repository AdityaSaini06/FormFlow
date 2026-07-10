from datetime import UTC, datetime, timedelta

from app.db.init_db import init_db
from app.db.session import SessionLocal
from app.models import Answer, Form, FormStatus, Question, QuestionOption, QuestionType, Response


def seed_database() -> None:
    init_db()

    db = SessionLocal()
    try:
        if db.query(Form).filter(Form.slug == "customer-feedback-survey-q3").first():
            print("Seed data already exists.")
            return

        now = datetime.now(UTC)
        feedback = Form(
            title="Customer Feedback Survey Q3",
            description="Understand customer satisfaction and product fit.",
            slug="customer-feedback-survey-q3",
            status=FormStatus.PUBLISHED,
            published_at=now - timedelta(days=8),
        )
        feedback.questions = [
            Question(
                type=QuestionType.EMAIL,
                title="What's your professional email address?",
                description="We'll only use this to send a copy of your results.",
                placeholder="name@example.com",
                is_required=True,
                position=1,
            ),
            Question(
                type=QuestionType.MULTIPLE_CHOICE,
                title="How did you hear about us?",
                description="Choose the channel that fits best.",
                is_required=True,
                position=2,
                options=[
                    QuestionOption(label="Social Media", value="social_media", position=1),
                    QuestionOption(label="Search Engine", value="search_engine", position=2),
                    QuestionOption(label="Friend/Colleague", value="referral", position=3),
                    QuestionOption(label="Podcast Ad", value="podcast_ad", position=4),
                ],
            ),
            Question(
                type=QuestionType.RATING,
                title="How would you rate your experience?",
                description="1 means poor, 5 means excellent.",
                is_required=True,
                position=3,
            ),
        ]

        offsite = Form(
            title="Annual Offsite Registration",
            description="Collect attendance and dietary preferences for the team offsite.",
            slug="annual-offsite-registration",
            status=FormStatus.DRAFT,
        )
        offsite.questions = [
            Question(
                type=QuestionType.SHORT_TEXT,
                title="What is your full name?",
                placeholder="Jane Doe",
                is_required=True,
                position=1,
            ),
            Question(
                type=QuestionType.MULTIPLE_CHOICE,
                title="Which day will you attend?",
                is_required=True,
                position=2,
                options=[
                    QuestionOption(label="Thursday", value="thursday", position=1),
                    QuestionOption(label="Friday", value="friday", position=2),
                ],
            ),
        ]

        waitlist = Form(
            title="Beta Access Waitlist",
            description="Prioritize teams interested in early access.",
            slug="beta-access-waitlist",
            status=FormStatus.PUBLISHED,
            published_at=now - timedelta(days=20),
        )
        waitlist.questions = [
            Question(
                type=QuestionType.EMAIL,
                title="What's your work email?",
                placeholder="you@company.com",
                is_required=True,
                position=1,
            ),
            Question(
                type=QuestionType.LONG_TEXT,
                title="What workflow do you want to improve?",
                placeholder="Tell us about your current process...",
                is_required=False,
                position=2,
            ),
        ]

        db.add_all([feedback, offsite, waitlist])
        db.flush()

        _add_feedback_responses(db, feedback)
        _add_waitlist_responses(db, waitlist)

        db.commit()
        print("Seed data created.")
    finally:
        db.close()


def _add_feedback_responses(db, form: Form) -> None:
    email_question = form.questions[0]
    source_question = form.questions[1]
    rating_question = form.questions[2]
    source_options = source_question.options

    for index in range(12):
        response = Response(form=form, completion_time_seconds=90 + index * 7)
        response.answers = [
            Answer(question=email_question, text_value=f"customer{index + 1}@example.com"),
            Answer(question=source_question, question_option=source_options[index % len(source_options)]),
            Answer(question=rating_question, number_value=(index % 5) + 1),
        ]
        db.add(response)


def _add_waitlist_responses(db, form: Form) -> None:
    email_question = form.questions[0]
    workflow_question = form.questions[1]

    for index in range(8):
        response = Response(form=form, completion_time_seconds=70 + index * 5)
        response.answers = [
            Answer(question=email_question, text_value=f"founder{index + 1}@startup.test"),
            Answer(question=workflow_question, text_value="Qualifying leads and routing follow-ups."),
        ]
        db.add(response)


if __name__ == "__main__":
    seed_database()
