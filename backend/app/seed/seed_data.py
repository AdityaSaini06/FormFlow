import logging
from datetime import UTC, datetime, timedelta

from app.db.init_db import init_db
from app.db.session import SessionLocal
from app.models import Answer, Form, FormStatus, Question, QuestionOption, QuestionType, Response

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def seed_data() -> None:
    # Ensure database tables exist
    init_db()

    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(Form).first() is not None:
            logger.info("Database already contains data. Skipping seed.")
            return

        logger.info("Seeding database...")

        # 1. Create a Published Form
        form1 = Form(
            title="Customer Satisfaction Survey",
            description="Help us improve by telling us about your experience.",
            slug="customer-satisfaction",
            status=FormStatus.PUBLISHED,
            published_at=datetime.now(UTC),
        )

        q1 = Question(
            type=QuestionType.EMAIL,
            title="What is your email address?",
            is_required=True,
            position=1,
        )
        q2 = Question(
            type=QuestionType.MULTIPLE_CHOICE,
            title="Which feature do you use most?",
            is_required=True,
            position=2,
        )
        q2_opt1 = QuestionOption(label="Form Builder", value="builder", position=1)
        q2_opt2 = QuestionOption(label="Analytics Dashboard", value="analytics", position=2)
        q2_opt3 = QuestionOption(label="Public Sharing", value="sharing", position=3)
        q2.options.extend([q2_opt1, q2_opt2, q2_opt3])

        q3 = Question(
            type=QuestionType.RATING,
            title="How would you rate our platform? (1 to 5)",
            is_required=True,
            position=3,
        )
        q4 = Question(
            type=QuestionType.LONG_TEXT,
            title="Any additional feedback or feature requests?",
            is_required=False,
            position=4,
        )

        form1.questions.extend([q1, q2, q3, q4])
        db.add(form1)
        db.flush()  # Generate IDs for references

        # 2. Add Responses and Answers for Form 1
        # Response A
        resp_a = Response(
            form_id=form1.id,
            started_at=datetime.now(UTC) - timedelta(minutes=5),
            submitted_at=datetime.now(UTC),
            completion_time_seconds=300,
        )
        ans_a1 = Answer(question_id=q1.id, text_value="alice@example.com")
        ans_a2 = Answer(question_id=q2.id, question_option_id=q2_opt1.id)
        ans_a3 = Answer(question_id=q3.id, number_value=5)
        ans_a4 = Answer(question_id=q4.id, text_value="The drag and drop builder is super fast!")
        resp_a.answers.extend([ans_a1, ans_a2, ans_a3, ans_a4])

        # Response B
        resp_b = Response(
            form_id=form1.id,
            started_at=datetime.now(UTC) - timedelta(minutes=2),
            submitted_at=datetime.now(UTC),
            completion_time_seconds=120,
        )
        ans_b1 = Answer(question_id=q1.id, text_value="bob@example.com")
        ans_b2 = Answer(question_id=q2.id, question_option_id=q2_opt2.id)
        ans_b3 = Answer(question_id=q3.id, number_value=4)
        resp_b.answers.extend([ans_b1, ans_b2, ans_b3])

        db.add_all([resp_a, resp_b])

        # 3. Create a Draft Form
        form2 = Form(
            title="Developer Event RSVP",
            description="RSVP draft for our upcoming 2026 developer conference.",
            slug="dev-conference-rsvp",
            status=FormStatus.DRAFT,
        )
        q2_1 = Question(
            type=QuestionType.SHORT_TEXT,
            title="What is your full name?",
            is_required=True,
            position=1,
        )
        q2_2 = Question(
            type=QuestionType.BOOLEAN,
            title="Will you be attending the networking dinner?",
            is_required=True,
            position=2,
        )
        form2.questions.extend([q2_1, q2_2])
        db.add(form2)

        db.commit()
        logger.info("Successfully seeded database with sample forms and responses.")
    except Exception as e:
        db.rollback()
        logger.error(f"Seeding failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()
