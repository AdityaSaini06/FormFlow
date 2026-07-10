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

export type ResultOptionSummary = {
  option_id: number | null;
  label: string;
  count: number;
  percentage: number;
};

export type QuestionResultSummary = {
  question_id: number;
  title: string;
  type: string;
  response_count: number;
  average_number: number | null;
  options: ResultOptionSummary[];
  text_answers: string[];
};

export type ResponseAnswerRead = {
  question_id: number;
  question_title: string;
  value: string;
};

export type ResponseListItem = {
  id: number;
  submitted_at: string;
  completion_time_seconds: number | null;
  answers: ResponseAnswerRead[];
};

export type FormResults = {
  id: number;
  title: string;
  description: string | null;
  slug: string;
  status: string;
  response_count: number;
  average_completion_time_seconds: number | null;
  questions: QuestionResultSummary[];
  recent_responses: ResponseListItem[];
};
