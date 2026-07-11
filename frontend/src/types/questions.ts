export type QuestionType = "short_text" | "long_text" | "email" | "multiple_choice" | "dropdown" | "number" | "rating" | "boolean";

export type QuestionOption = {
  id: number;
  question_id: number;
  label: string;
  value: string;
  position: number;
  created_at: string;
  updated_at: string;
};

export type Question = {
  id: number;
  form_id: number;
  type: QuestionType;
  title: string;
  description: string | null;
  placeholder: string | null;
  is_required: boolean;
  position: number;
  created_at: string;
  updated_at: string;
  options: QuestionOption[];
};

export type QuestionInput = {
  type: QuestionType;
  title: string;
  description?: string | null;
  placeholder?: string | null;
  is_required?: boolean;
  options?: Array<{
    label: string;
    value?: string | null;
  }>;
};

export type QuestionUpdateInput = Partial<QuestionInput>;
