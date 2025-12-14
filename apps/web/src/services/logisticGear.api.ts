import apiClient from "@/web/lib/api-client";
import formatApiError from "@/web/lib/format-api-error";
import { queryKeys } from "@/web/lib/queries";
import { queryOptions } from "@tanstack/react-query";
import { LogisticGear, NewLogisticGear, UpdateLogisticGear } from "@teamapp/api/schema";
import { toast } from "sonner";

export const logisticGearQueryOptions = queryOptions({
  ...queryKeys.logisticGear,
  queryFn: async () => {
    const response = await apiClient.api["logistic-gear"].$get();
    return response.json();
  },
});

export const logisticGearItemQueryOptions = (id: string) =>
  queryOptions({
    ...queryKeys.logisticGearItem(id),
    queryFn: async () => {
      const response = await apiClient.api["logistic-gear"][":id"].$get({
        param: { id },
      });
      return response.json();
    },
  });

export const createLogisticGear = async (gear: NewLogisticGear) => {
  const response = await apiClient.api["logistic-gear"].$post({
    json: gear as any,
  });
  const json = await response.json();
  if ("error" in json) {
    throw new Error(formatApiError(json));
  }
  toast.success("ציוד לוגיסטי נוצר בהצלחה");
  return json as LogisticGear;
};

export const updateLogisticGear = async ({
  id,
  gear,
}: {
  id: string;
  gear: UpdateLogisticGear;
}) => {
  const response = await apiClient.api["logistic-gear"][":id"].$patch({
    param: { id },
    json: gear as any,
  });
  if (response.status !== 200) {
    const json = await response.json();
    throw new Error("error" in json ? formatApiError(json) : (json as any).message || "Update failed");
  }
  const json = await response.json();
  toast.success("ציוד לוגיסטי עודכן בהצלחה");
  return json as LogisticGear;
};

export const deleteLogisticGear = async (id: string) => {
  const response = await apiClient.api["logistic-gear"][":id"].$delete({
    param: { id },
  });
  if (response.status !== 204) {
    const json = await response.json();
    throw new Error("error" in json ? formatApiError(json) : (json as any).message || "Delete failed");
  }
  toast.success("ציוד לוגיסטי נמחק בהצלחה");
};
