import { queryOptions } from "@tanstack/react-query";
import apiClient from "../lib/api-client";
import { queryKeys } from "../lib/queries";
import formatApiError from "../lib/format-api-error";
import {  Team, UpdateTeam } from "@teamapp/api/schema";

export const teamQueryOptions = queryOptions({
  ...queryKeys.teams,
  queryFn: async () => {
    const response = await apiClient.api.teams.$get();
    return response.json();
  },
});
export const teamItemQueryOptions = (id: string) => queryOptions({
  ...queryKeys.teamItem(id),
  queryFn: async () => {
    const response = await apiClient.api.teams[":id"].$get({ param: { id } });
    return response.json();
  },
});

export const createTeamQueryOptions = (id: string) => queryOptions({
  ...queryKeys.teamItem(id),
  queryFn: async () => {
    const response = await apiClient.api.teams[":id"].$get({
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

export const createTeam = async (team:Team) => {
  const response = await apiClient.api.teams.$post({
    json: team as any,
  });
  const json = await response.json();
  if ("success" in json) {
    const message = formatApiError(json);
    throw new Error(message);
  }
  return json;
};

export const deleteTeam = async (id: string) => {
  const response = await apiClient.api.teams[":id"].$delete({
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

export const updateFighter = async ({ id, team }: { id: string;team:UpdateTeam }) => {
  const response = await apiClient.api.fighters[":id"].$patch({
    param: {
      id,
    },
    json: team as any,
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
