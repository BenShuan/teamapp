import { queryOptions } from "@tanstack/react-query";
import apiClient from "../lib/api-client";
import formatApiError from "../lib/format-api-error";

export const platoonsQueryOptions = () => queryOptions({
  queryKey: ["platoons"],
  queryFn: async () => {
    const response = await apiClient.api.platoons.$get();
    return response.json();
  },
});

export const createPlatoon = async (platoon: { name: string; codeName: string; description?: string }) => {
  const response = await apiClient.api.platoons.$post({
    json: platoon as any,
  });
  const json = await response.json();
  if ("success" in json && !json.success) {
    const message = formatApiError(json);
    throw new Error(message);
  }
  return json;
};

export const updatePlatoon = async ({ id, updates }: { id: string; updates: { name?: string; codeName?: string; description?: string } }) => {
  const response = await apiClient.api.platoons[":id"].$patch({
    param: { id },
    json: updates as any,
  });
  if (response.status !== 200) {
    const json = await response.json();
    if ("message" in json) {
      throw new Error(json.message);
    }
    const message = formatApiError(json);
    throw new Error(message);
  }
  return response.json();
};

export const deletePlatoon = async (id: string) => {
  const response = await apiClient.api.platoons[":id"].$delete({
    param: { id },
  });
  if (response.status !== 204) {
    const json = await response.json();
    if ("message" in json) {
      throw new Error(json.message);
    }
    const message = formatApiError(json);
    throw new Error(message);
  }
};
