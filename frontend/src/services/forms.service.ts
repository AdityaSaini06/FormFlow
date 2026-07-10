import { http } from "@/services/http";
import type { CreateFormInput, FormListItem, FormRead } from "@/types/forms";

export async function listForms(): Promise<FormListItem[]> {
  const response = await http.get<FormListItem[]>("/forms");
  return response.data;
}

export async function createForm(input: CreateFormInput): Promise<FormListItem> {
  const response = await http.post<FormRead>("/forms", input);
  return { ...response.data, response_count: 0 };
}
