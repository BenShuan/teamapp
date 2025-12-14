"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteSerializedGear,
  gearCatalogQueryOptions,
  serializedGearItemQueryOptions,
  serializedGearQueryOptions,
} from "../services/serializedGear.api";
import { useMemo } from "react";
import { SerializedGear, SerializedGearFighter } from "@teamapp/api/schema";
import { queriesMap } from "../lib/queries";

export function useSerializedGear(id?: string) {
  if (id) {
    return useQuery(serializedGearItemQueryOptions(id));
  }

  const query = useQuery(serializedGearQueryOptions);

  const serailiezdGearMap: queriesMap<SerializedGearFighter> = useMemo(() => {
    if (!Array.isArray(query.data)) return {};
    const map = {} as queriesMap<SerializedGearFighter>;
    query.data.forEach((g: any) => {
      if (g && typeof g === "object" && "id" in g && "name" in g) {
        map[g.id as string] = {
          label: g.name,
          value: g
        };
      }
    });
    return map;
  }, [query.dataUpdatedAt]);

  return { ...query, serailiezdGearMap };
}

export function useGearCatalog() {

  const query = useQuery(gearCatalogQueryOptions);

    const catalogMap:queriesMap<SerializedGear> = useMemo(() => {
      if (!Array.isArray(query.data)) return {} ;
      const map= {} as queriesMap<SerializedGear>;
      query.data.forEach((g: any) => {
        if (g && typeof g === "object" && "id" in g && "name" in g) {
          map[g.id as string] ={
            label:g.name,
            value:g
          };
        }
      });
      return map;
    }, [query.dataUpdatedAt]);

    return {...query, catalogMap};

}


export const useDeleteSerializedGear = ( id: string) => {
  const qc = useQueryClient();

  const mutate = useMutation<unknown, Error, SerializedGearFighter>({
    mutationFn: ()=>deleteSerializedGear(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["serialized-gear"] });
    },
  });

  return mutate;
};
