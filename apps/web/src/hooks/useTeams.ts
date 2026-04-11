"use client";
import { useQuery } from "@tanstack/react-query";
import { teamQueryOptions } from "../services/teams.api";
import { Team } from "@teamapp/api/schema";
import { useMemo } from "react";
import { queriesMap } from "../lib/queries";


export function useTeams() {

  const query = useQuery(teamQueryOptions);
  const teamArray = query.data as Team[] | undefined;
  const teamsMap: queriesMap<Team> = useMemo(() => teamArray?.reduce((acc, team) => {

    acc[team.id] = {
      label: team.name,
      value: team
    }
    return acc
  }, {} as queriesMap<Team>), [query.dataUpdatedAt]) || {};

  return { ...query, teamsMap }
}
