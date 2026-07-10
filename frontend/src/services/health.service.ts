import { http } from "@/services/http";

export type HealthResponse = {
  status: "ok";
  service: string;
};

export async function getHealth() {
  const response = await http.get<HealthResponse>("/health");
  return response.data;
}
