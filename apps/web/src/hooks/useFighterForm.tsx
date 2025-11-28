import { useMutation, useQueryClient } from '@tanstack/react-query';
import {  Fighter } from '@teamapp/api/schema';
import { createFighter, updateFighter } from '../services/fighter.api';

const useFighterForm = (isNew: boolean,id?:string|null) => {
  const qc = useQueryClient();


  const action = isNew ? (variables: Fighter) => createFighter(variables) : (variables: Fighter) => updateFighter({ id: variables.id, fighter: variables })

  const mutate= useMutation<unknown, Error, Fighter>({
    mutationFn:action,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fighters",id] });
    },
  });

  return mutate
}

export default useFighterForm