import { http } from "@/services/http";
import type { FormResults } from "@/types/responses";

export async function getFormResults(formId: number): Promise<FormResults> {
  const response = await http.get<FormResults>(`/forms/${formId}/results`);
  return response.data;
}
