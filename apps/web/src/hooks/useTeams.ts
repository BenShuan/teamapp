"use client";
import { useQuery } from "@tanstack/react-query";
import { teamQueryOptions } from "../services/teams.api";
import { Team } from "@teamapp/api/schema";


export function useTeams() {

  const query = useQuery(teamQueryOptions);

  const teamsMap = query.data?.reduce((acc, team) => {

    acc[team.id] = team
    return acc
  }, {} as Record<string, Team>)

  return { ...query, teamsMap }
}
