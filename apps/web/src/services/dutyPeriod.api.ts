import { queryOptions } from "@tanstack/react-query";
import apiClient from "@/web/lib/api-client";
import formatApiError from "@/web/lib/format-api-error";
import { queryKeys } from "@/web/lib/queries";
import { NewDutyPeriod, UpdateDutyPeriod } from "@teamapp/api/schema";

export const dutyPeriodQueryOptions = () => queryOptions({
  ...queryKeys.dutyPeriods,
  queryFn: async () => {
    const response = await apiClient.api["duty-periods"].$get();
    return response.json();
  },
});

export const createDutyPeriod = async (data: NewDutyPeriod) => {
  const response = await apiClient.api["duty-periods"].$post({
    json: data as any,
  });
  const json = await response.json();
  if ("success" in json && !json.success) {
    const message = formatApiError(json);
    throw new Error(message);
  }
  return json;
};

export const updateDutyPeriod = async ({ id, updates }: { id: string; updates: UpdateDutyPeriod }) => {
  const response = await apiClient.api["duty-periods"][":id"].$patch({
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

export const deleteDutyPeriod = async (id: string) => {
  const response = await apiClient.api["duty-periods"][":id"].$delete({
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
