"use client";
import { useQuery } from "@tanstack/react-query";
import { Team } from "@teamapp/api/schema";
import apiClient from "../lib/api-client";


export function useTeams() {

  // return useQuery({
  //   queryKey: [qk.teams],
  //   queryFn: () => apiClient.api,
  // });

  return  [] as Team[]
  
}
