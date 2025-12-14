import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SerializedGearFighter } from "@teamapp/api/schema";
import {
  createSerializedGear,
  updateSerializedGear,
} from "../services/serializedGear.api";

const useSerializedGearForm = (isNew: boolean, id?: string | null) => {
  const qc = useQueryClient();

  const action = isNew
    ? (variables: SerializedGearFighter) => createSerializedGear(variables)
    : (variables: SerializedGearFighter) =>
      updateSerializedGear({ id: variables.id, gear: variables });

  const mutate = useMutation<unknown, Error, SerializedGearFighter>({
    mutationFn: action,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["serialized-gear", id] });
    },
  });

  return mutate;
};

export default useSerializedGearForm;
