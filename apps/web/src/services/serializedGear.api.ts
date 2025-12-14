import apiClient from "@/web/lib/api-client";
import formatApiError from "@/web/lib/format-api-error";
import { queryKeys } from "@/web/lib/queries";
import { queryOptions } from "@tanstack/react-query";
import type { NewSerializedGear, SerializedGearFighter, NewSerializedGearFighter } from "@teamapp/api/schema";
import { toast } from "sonner";

// Gear catalog queries
export const gearCatalogQueryOptions = queryOptions({
  ...queryKeys.gearCatalog,
  queryFn: async () => {
    const response = await apiClient.api["serialized-gear"].catalog.$get();
    return response.json();
  },
});

export const createGearCatalog = async (gear: NewSerializedGear) => {
  const response = await apiClient.api["serialized-gear"].catalog.$post({
    json: gear as any,
  });
  const json = await response.json();
  if ("error" in json) {
    const message = formatApiError(json);
    throw new Error(message);
  }
  toast.success("פריט ציוד נוצר בהצלחה");
  return json;
};

export const gearCatalogItemQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["gear-catalog", id],
    queryFn: async () => {
      const response = await apiClient.api["serialized-gear"].catalog[":id"].$get({
        param: { id },
      });
      return response.json();
    },
  });

export const updateGearCatalog = async ({ id, gear }: { id: string; gear: NewSerializedGear }) => {
  const response = await apiClient.api["serialized-gear"].catalog[":id"].$patch({
    param: { id },
    json: gear as any,
  });
  if (response.status !== 200) {
    const json = await response.json();
    throw new Error("error" in json ? formatApiError(json) : "Update failed");
  }
  toast.success("פריט ציוד עודכן בהצלחה");
  return await response.json();
};

export const deleteGearCatalog = async (id: string) => {
  const response = await apiClient.api["serialized-gear"].catalog[":id"].$delete({
    param: { id },
  });
  if (response.status !== 204) {
    const json = await response.json();
    throw new Error("error" in json ? formatApiError(json) : "Delete failed");
  }
  toast.success("פריט ציוד נמחק בהצלחה");
};

// Gear assignment queries
export const serializedGearQueryOptions = queryOptions({
  ...queryKeys.serializedGear,
  queryFn: async () => {
    const response = await apiClient.api["serialized-gear"].$get();
    return response.json();
  },
});

export const serializedGearItemQueryOptions = (id: string) =>
  queryOptions({
    ...queryKeys.serializedGearItem(id),
    queryFn: async () => {
      const response = await apiClient.api["serialized-gear"][":id"].$get({
        param: { id },
      });
      return response.json();
    },
  });

export const createSerializedGear = async (gear: NewSerializedGearFighter) => {
  const response = await apiClient.api["serialized-gear"].$post({
    json: gear as any,
  });
  const json = await response.json();
  if ("error" in json) {
    throw new Error(formatApiError(json));
  }
  toast.success("ציוד שויך ללוחם בהצלחה");
  return json;
};

export const updateSerializedGear = async ({
  id,
  gear,
}: {
  id: string;
  gear: SerializedGearFighter;
}) => {
  const response = await apiClient.api["serialized-gear"][":id"].$patch({
    param: { id },
    json: gear as any,
  });
  if (response.status !== 200) {
    const json = await response.json();
    throw new Error("error" in json ? formatApiError(json) : json.message || "Update failed");
  }
  toast.success("ציוד עודכן בהצלחה");
  return await response.json();
};

export const deleteSerializedGear = async (id: string) => {
  const response = await apiClient.api["serialized-gear"][":id"].$delete({
    param: { id },
  });
  if (response.status !== 204) {
    const json = await response.json();
    throw new Error("error" in json ? formatApiError(json) : json.message || "Delete failed");
  }
  toast.success("ציוד נמחק בהצלחה");
};

export const bulkCheckGear = async (teamId: string, date?: string) => {
  const response = await apiClient.api["serialized-gear"]["bulk-check"].$post({
    json: { teamId, date },
  });
  const json = await response.json();
  if ("error" in json) {
    throw new Error(formatApiError(json));
  }
  if ("checkedCount" in json) {
    toast.success(`בדיקה הושלמה: ${json.checkedCount} פריטים נבדקו, ${json.failedCount} נכשלו`);
  }
  return json;
};

export const createGearCheck = async (assignmentId: string, date: string, isCheck: boolean) => {
  const response = await apiClient.api["serialized-gear"][":id"].check.$post({
    param: { id: assignmentId },
    json: { date, isCheck },
  });
  const json = await response.json();
  if ("error" in json) {
    // Server returned our structured error schema
    throw new Error(formatApiError(json as any));
  }
  if ("success" in json) {
    return json;
  }
  // Fallback for unexpected payloads
  throw new Error((json as any)?.message ?? "Unexpected response from server");
};
