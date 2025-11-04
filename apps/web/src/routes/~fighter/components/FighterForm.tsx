"use client";

import { TextField, NumberField, AutocompleteField } from "@/web/components/forms";
import { useTeams } from "@/web/hooks/useTeams";
import type { Fighter, NewFighter } from "@teamapp/api/schema";
import { useForm, SubmitHandler, FormProvider } from "react-hook-form";
import { Card, CardContent } from "@/web/components/ui/card";
import { Button } from "@/web/components/ui/button";
import useFighterForm from "@/web/hooks/useFighterForm";



type FighterFormProps = {
  fighter?: Fighter
  onCreated?: (fighter: any) => void;
};


const defaultFighter = {
  firstName: "",
  lastName: "",
  idNumber: "",
  personalNumber: "",
  email: "",
  phoneNumber: "",
  shoesSize: undefined,
  shirtSize: "",
  pantsSize: "",
  professional: "",
  ironNumber: undefined,
  teamId: undefined,
  class: "",
  kit: "",
  address: undefined,
} satisfies Partial<Fighter> as Fighter

const FighterForm: React.FC<FighterFormProps> = ({ fighter }) => {

  const isNew = !fighter?.id

  // Use NewFighter for creation to match API type
  const methods = useForm<Partial<Fighter>>({
    defaultValues: isNew ? defaultFighter : fighter,
  });


  const teamsData = useTeams();

  const { mutateAsync, isPending } = useFighterForm(isNew,fighter?.id)

  

  const onSubmit: SubmitHandler<NewFighter> = async (values) => {
    await mutateAsync(values);

    methods.reset();
  };


  return (
    <Card>
      <CardContent>
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <div className="flex flex-col md:flex-row md:flex-wrap gap-4  md:justify-between ">

              <TextField
                name="firstName"
                label="שם פרטי"
                requiredMark
                className=""
                rules={{ required: "שדה חובה" }}
              />
              <TextField
                name="lastName"
                label="שם משפחה"
                requiredMark
                rules={{ required: "שדה חובה" }}
              />
              <TextField
                name="idNumber"
                label="תעודת זהות"
                requiredMark
                rules={{ required: "שדה חובה" }}
              />
              <TextField
                name="personalNumber"
                label="מספר אישי"
                requiredMark
                rules={{ required: "שדה חובה" }}
              />

              <TextField name="email" label="אימייל" type="email" />
              <TextField name="phoneNumber" label="טלפון" inputMode="tel" />

              <NumberField
                name="shoesSize"
                label="מידת נעליים"
                
               
              />
              <TextField
                name="shirtSize"
                label="מידת חולצה"
                placeholder="S / M / L / XL"
              />
              <TextField
                name="pantsSize"
                label="מידת מכנסיים"
                placeholder="30 / 32 / 34"
              />
              <TextField name="professional" label="מקצוע" />

              <TextField name="ironNumber" label="מספר נשק" placeholder="#######"/>
              <AutocompleteField
                name="teamId"
                label="צוות"
                options={teamsData?.map((team) => ({
                  label: team.name,
                  value: team.id,
                })) || []}
                placeholder="בחר צוות"
              />

              <TextField name="class" label="כיתה" maxLength={2} />
              <TextField name="kit" label="ערכת ציוד" />

              <NumberField name="address" label="כתובת (מזהה)" />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="reset"
                variant="outline"
                onClick={() => methods.reset()}
                disabled={isPending}
              >
                נקה
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "שולח..." : "שמור לוחם"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
};

export default FighterForm;
