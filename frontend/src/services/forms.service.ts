import { http } from "@/services/http";
import type { CreateFormInput, FormListItem, FormRead, UpdateFormInput } from "@/types/forms";

export async function listForms(): Promise<FormListItem[]> {
  const response = await http.get<FormListItem[]>("/forms");
  return response.data;
}

export async function createForm(input: CreateFormInput): Promise<FormListItem> {
  const response = await http.post<FormRead>("/forms", input);
  return { ...response.data, response_count: 0 };
}

export async function updateForm(formId: number, input: UpdateFormInput): Promise<FormRead> {
  const response = await http.patch<FormRead>(`/forms/${formId}`, input);
  return response.data;
}

export async function duplicateForm(formId: number): Promise<FormListItem> {
  const response = await http.post<FormRead>(`/forms/${formId}/duplicate`);
  return { ...response.data, response_count: 0 };
}

export async function deleteForm(formId: number): Promise<void> {
  await http.delete(`/forms/${formId}`);
}
