import apiClient from "@/web/lib/api-client";
import formatApiError from "@/web/lib/format-api-error";
import { queryOptions } from "@tanstack/react-query";

export const usersQueryOptions = () => queryOptions({
  queryKey: ["users"],
  queryFn: async () => {
    const response = await apiClient.api.users.$get();
    return response.json();
  },
});

export const teamsQueryOptions = () => queryOptions({
  queryKey: ["teams"],
  queryFn: async () => {
    const response = await apiClient.api.teams.$get();
    return response.json();
  },
});

export const platoonsQueryOptions = () => queryOptions({
  queryKey: ["platoons"],
  queryFn: async () => {
    const response = await apiClient.api.platoons.$get();
    return response.json();
  },
});

export const updateUser = async ({
  id,
  updates,
}: {
  id: string;
  updates: { role?: string; name?: string; email?: string };
}) => {
  const response = await apiClient.api.users[":id"].$patch({
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

export const setUserTeams = async ({
  id,
  teamIds,
}: {
  id: string;
  teamIds: string[];
}) => {
  const response = await apiClient.api.users[":id"].teams.$put({
    param: { id },
    json: teamIds.map((teamId) => ({ userId: id, teamId })) as any,
  });
  if (response.status !== 200) {
    const json = await response.json();
    const message = formatApiError(json);
    throw new Error(message);
  }
  return response.json();
};

export const setUserPlatoons = async ({
  id,
  platoonIds,
}: {
  id: string;
  platoonIds: string[];
}) => {
  const response = await apiClient.api.users[":id"].platoons.$put({
    param: { id },
    json: platoonIds.map((platoonId) => ({ userId: id, platoonId })) as any,
  });
  if (response.status !== 200) {
    const json = await response.json();
    const message = formatApiError(json);
    throw new Error(message);
  }
  return response.json();
};

export const softDeleteUser = async (id: string) => {
  const response = await apiClient.api.users[":id"].$delete({
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

export const reactivateUser = async (id: string) => {
  const response = await apiClient.api.users[":id"].$patch({
    param: { id },
    json: { deletedAt: null } as any,
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
