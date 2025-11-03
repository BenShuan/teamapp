"use client";
import { useQuery } from "@tanstack/react-query";
import { fighterQueryOptions } from "../routes/~fighter/utils/apiService";


export function useFighters() {

  return useQuery(fighterQueryOptions);
}
