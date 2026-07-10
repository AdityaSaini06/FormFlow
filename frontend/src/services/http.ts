import axios from "axios";

import { config } from "@/lib/config";

export const http = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});
