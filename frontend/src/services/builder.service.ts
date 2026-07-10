import { http } from "@/services/http";
import type { FormBuilder } from "@/types/forms";
import type { Question, QuestionInput, QuestionUpdateInput } from "@/types/questions";

export async function getBuilderForm(formId: number): Promise<FormBuilder> {
  const response = await http.get<FormBuilder>(`/forms/${formId}/builder`);
  return response.data;
}

export async function createQuestion(formId: number, input: QuestionInput): Promise<Question> {
  const response = await http.post<Question>(`/forms/${formId}/questions`, input);
  return response.data;
}

export async function updateQuestion(
  formId: number,
  questionId: number,
  input: QuestionUpdateInput,
): Promise<Question> {
  const response = await http.patch<Question>(`/forms/${formId}/questions/${questionId}`, input);
  return response.data;
}

export async function deleteQuestion(formId: number, questionId: number): Promise<void> {
  await http.delete(`/forms/${formId}/questions/${questionId}`);
}

export async function reorderQuestions(formId: number, questionIds: number[]): Promise<Question[]> {
  const response = await http.post<Question[]>(`/forms/${formId}/questions/reorder`, {
    question_ids: questionIds,
  });
  return response.data;
}
