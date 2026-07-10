import { http } from "@/services/http";
import type { FormBuilder } from "@/types/forms";
import type { PublicResponseInput, PublicResponseResult } from "@/types/responses";

export async function getPublicForm(slug: string): Promise<FormBuilder> {
  const response = await http.get<FormBuilder>(`/public/forms/${slug}`);
  return response.data;
}

export async function submitPublicResponse(
  slug: string,
  input: PublicResponseInput,
): Promise<PublicResponseResult> {
  const response = await http.post<PublicResponseResult>(`/public/forms/${slug}/responses`, input);
  return response.data;
}
