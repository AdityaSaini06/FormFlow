from enum import StrEnum


def enum_values(enum_class: type[StrEnum]) -> list[str]:
    return [item.value for item in enum_class]


class FormStatus(StrEnum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class QuestionType(StrEnum):
    SHORT_TEXT = "short_text"
    LONG_TEXT = "long_text"
    EMAIL = "email"
    MULTIPLE_CHOICE = "multiple_choice"
    DROPDOWN = "dropdown"
    NUMBER = "number"
    RATING = "rating"
    BOOLEAN = "boolean"
