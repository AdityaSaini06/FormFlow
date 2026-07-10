export type PublicAnswerInput = {
  question_id: number;
  question_option_id?: number | null;
  text_value?: string | null;
  number_value?: number | null;
  boolean_value?: boolean | null;
};

export type PublicResponseInput = {
  answers: PublicAnswerInput[];
  completion_time_seconds?: number | null;
};

export type PublicResponseResult = {
  response_id: number;
  submitted_at: string;
};
