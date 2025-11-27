import { useMutation, useQueryClient } from '@tanstack/react-query';
import {  Fighter } from '@teamapp/api/schema';
import { createFighter, updateFighter } from '../services/fighter.api';
import { useEffect } from 'react';
import { toast } from 'sonner';

const useFighterForm = (isNew: boolean,id?:string|null) => {
  const qc = useQueryClient();


  const action = isNew ? (variables: Fighter) => createFighter(variables) : (variables: Fighter) => updateFighter({ id: variables.id, fighter: variables })

  const mutate= useMutation<unknown, Error, Fighter>({
    mutationFn:action,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fighters",id] });
    },
  });

  useEffect(()=>{
    
    if (mutate.isError) {
        toast.error(mutate.error.message ?? "שגיאה בעדכון לוחם")
      }
    
      if (mutate.isSuccess) {
        toast.success(`לוחם ${isNew ? "נוצר" : "עודכן"} בהצלחה`)
      }
    
  }, [mutate.isError, mutate.isSuccess])

  return mutate
}

export default useFighterForm