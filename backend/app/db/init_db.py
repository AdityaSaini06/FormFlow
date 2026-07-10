from app.db.session import Base, engine

# Import models so SQLAlchemy registers them before create_all runs.
from app import models  # noqa: F401


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
