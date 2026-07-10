import type { Question } from "@/types/questions";

export type FormStatus = "draft" | "published" | "archived";

export type FormRead = {
  id: number;
  title: string;
  description: string | null;
  slug: string;
  status: FormStatus;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export type FormListItem = FormRead & {
  response_count: number;
};

export type CreateFormInput = {
  title: string;
  description?: string | null;
};

export type FormBuilder = FormRead & {
  questions: Question[];
};
