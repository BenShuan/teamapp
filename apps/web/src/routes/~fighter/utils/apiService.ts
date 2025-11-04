import apiClient from "@/web/lib/api-client";
import formatApiError from "@/web/lib/format-api-error";
import { qk as queryKeys } from "@/web/lib/queries";
import { queryOptions } from "@tanstack/react-query";
import { NewFighter, UpdateFighter } from "@teamapp/api/schema";


export const fighterQueryOptions = queryOptions({
  ...queryKeys.fighters,
  queryFn: async () => {
    const response = await apiClient.api.fighters.$get();
    return response.json();
  },
});
export const fighterItemQueryOptions = (id:string)=>queryOptions({
  ...queryKeys.fighterItem(id),
  queryFn: async () => {
    const response = await apiClient.api.fighters[":id"].$get({param:{id}});
    return response.json();
  },
});

export const createFighterQueryOptions = (id: string) => queryOptions({
  ...queryKeys.fighterItem(id),
  queryFn: async () => {
    const response = await apiClient.api.fighters[":id"].$get({
      param: {
        id,
      },
    });
    const json = await response.json();
    if ("message" in json) {
      throw new Error(json.message);
    }
    if ("success" in json) {
      const message = formatApiError(json);
      throw new Error(message);
    }
    return json;
  },
});

export const createFighter = async (fighter:NewFighter ) => {
  const response = await apiClient.api.fighters.$post({
    json: fighter as any,
  });
  const json = await response.json();
  if ("success" in json) {
    const message = formatApiError(json);
    throw new Error(message);
  }
  return json;
};

export const deleteFighter = async (id: string) => {
  const response = await apiClient.api.fighters[":id"].$delete({
    param: {
      id,
    },
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

export const updateFighter = async ({ id, fighter }: { id: string; fighter: UpdateFighter }) => {
  const response = await apiClient.api.fighters[":id"].$patch({
    param: {
      id,
    },
    json: fighter as any,
  });
  if (response.status !== 200) {
    const json = await response.json();
    if ("message" in json) {
      throw new Error(json.message);
    }
    const message = formatApiError(json);
    throw new Error(message);
  }
};
