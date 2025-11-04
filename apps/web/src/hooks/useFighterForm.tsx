import { useMutation, useQueryClient } from '@tanstack/react-query';
import {  NewFighter, UpdateFighter } from '@teamapp/api/schema';
import { createFighter, updateFighter } from '../routes/~fighter/utils/apiService';
import { useEffect } from 'react';
import { toast } from 'sonner';

const useFighterForm = (isNew: boolean,id?:string|null) => {
  const qc = useQueryClient();


  const action = isNew ? (variables: Partial<NewFighter>) => createFighter(variables) : (variables: Partial<UpdateFighter>) => updateFighter({ id: variables.id, fighter: variables })

  const mutate= useMutation<unknown, Error, NewFighter | UpdateFighter>({
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