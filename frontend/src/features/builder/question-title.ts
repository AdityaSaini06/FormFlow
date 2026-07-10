export const DEFAULT_QUESTION_TITLE = "Untitled question";
export const QUESTION_TITLE_PLACEHOLDER = "Type your question here...";

export function isPlaceholderQuestionTitle(title: string | null | undefined) {
  return !title?.trim() || title.trim() === DEFAULT_QUESTION_TITLE;
}

export function getQuestionTitleLabel(title: string | null | undefined) {
  const trimmedTitle = title?.trim() ?? "";
  return isPlaceholderQuestionTitle(trimmedTitle) ? QUESTION_TITLE_PLACEHOLDER : trimmedTitle;
}
