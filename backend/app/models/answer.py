from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Answer(Base):
    __tablename__ = "answers"
    __table_args__ = (
        UniqueConstraint("response_id", "question_id", name="uq_answers_response_question"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    response_id: Mapped[int] = mapped_column(
        ForeignKey("responses.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    question_id: Mapped[int] = mapped_column(
        ForeignKey("questions.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )
    question_option_id: Mapped[int | None] = mapped_column(
        ForeignKey("question_options.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )
    text_value: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    number_value: Mapped[float | None] = mapped_column(Float, nullable=True)
    boolean_value: Mapped[bool | None] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    response: Mapped["Response"] = relationship(back_populates="answers")
    question: Mapped["Question"] = relationship(back_populates="answers")
    question_option: Mapped["QuestionOption | None"] = relationship(back_populates="answers")
