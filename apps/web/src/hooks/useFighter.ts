"use client";
import { useQuery } from "@tanstack/react-query";
import { fighterItemQueryOptions, fighterQueryOptions } from "../services/fighter.api";


export function useFighters(id?:string) {

  if (id) {
    return useQuery(fighterItemQueryOptions(id))
  }

  return useQuery(fighterQueryOptions);
}
