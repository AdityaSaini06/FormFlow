import { http } from "@/services/http";
import type { FormResults } from "@/types/responses";

export async function getFormResults(formId: number): Promise<FormResults> {
  const response = await http.get<FormResults>(`/forms/${formId}/results`);
  return response.data;
}

export async function exportFormResults(formId: number): Promise<Blob> {
  const response = await http.get(`/forms/${formId}/results/export`, { responseType: "blob" });
  return response.data;
}
