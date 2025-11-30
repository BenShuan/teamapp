import apiClient from "@/web/lib/api-client";
import formatApiError from "@/web/lib/format-api-error";
import { NewUser } from "@teamapp/api/schema";



export async function register(payload: NewUser) {
  const response = await apiClient.api.auth.register.$post({
    json: payload as any,
  });
  const json = await response.json();
  if ("error" in json) {
    const message = formatApiError(json);
    throw new Error(message);
  }
  return json;
}
