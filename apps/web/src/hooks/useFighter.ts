"use client";
import { useQuery } from "@tanstack/react-query";
import { fighterItemQueryOptions, fighterQueryOptions } from "../services/fighter.api";
import { useMemo } from "react";
import { Fighter } from "@teamapp/api/schema";
import { fullName } from "@teamapp/shared";
import { queriesMap } from "../lib/queries";



export function useFighters(id?: string) {

  if (id) {
    return { ...useQuery(fighterItemQueryOptions(id)), fightersMap: {} as queriesMap<Fighter> };
  }

  const query = useQuery(fighterQueryOptions);

  const fightersMap: queriesMap<Fighter> = useMemo(() => {
    if (!Array.isArray(query.data)) return {};
    const map: queriesMap<Fighter> = {};
    query.data.forEach((g: any) => {
      if (g && typeof g === "object" && "id" in g) {
        map[g.id as string] = {
          label: fullName(g) ,
          value: g
        };
      }
    });
    return map;
  }, [query.dataUpdatedAt]);

  return { ...query, fightersMap };
}
