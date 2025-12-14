"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createLogisticGear,
  deleteLogisticGear,
  logisticGearItemQueryOptions,
  logisticGearQueryOptions,
  updateLogisticGear,
} from "@/web/services/logisticGear.api";
import { queryKeys } from "@/web/lib/queries";
import { NewLogisticGear, UpdateLogisticGear } from "@teamapp/api/schema";

export const useLogisticGear = (id?: string) => {
  if (id) {
    return useQuery(logisticGearItemQueryOptions(id));
  }
  return useQuery(logisticGearQueryOptions);
};

export const useCreateLogisticGear = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (gear: NewLogisticGear) => createLogisticGear(gear),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.logisticGear.queryKey });
    },
  });
};

export const useUpdateLogisticGear = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, gear }: { id: string; gear: UpdateLogisticGear }) =>
      updateLogisticGear({ id, gear }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.logisticGear.queryKey });
      queryClient.invalidateQueries({ queryKey: queryKeys.logisticGearItem(id).queryKey });
    },
  });
};

export const useDeleteLogisticGear = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLogisticGear(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.logisticGear.queryKey });
      queryClient.invalidateQueries({ queryKey: queryKeys.logisticGearItem(id).queryKey });
    },
  });
};
