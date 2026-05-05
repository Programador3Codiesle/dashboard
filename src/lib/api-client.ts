import axios from "axios";
import { getApiBaseUrl } from "@/config/public-env";

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
});

