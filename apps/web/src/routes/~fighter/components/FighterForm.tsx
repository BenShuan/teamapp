"use client";

import { TextField, NumberField, AutocompleteField } from "@/web/components/forms";
import { useTeams } from "@/web/hooks/useTeams";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import type { Fighter, NewFighter } from "@teamapp/api/schema";
import { useForm, SubmitHandler, FormProvider } from "react-hook-form";
import { createFighter } from "../utils/apiService";
import { Card, CardContent } from "@/web/components/ui/card";
import { Button } from "@/web/components/ui/button";



type FighterFormProps = {
  fighter?:Fighter
  onCreated?: (fighter: any) => void;
};


const FighterForm: React.FC<FighterFormProps> = ({  }) => {
  const qc = useQueryClient();

  // Use NewFighter for creation to match API type
  const methods = useForm<NewFighter>({
    defaultValues: {
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
    } satisfies Partial<NewFighter> as NewFighter,
  });

const teamsData = useTeams();

  const { mutateAsync, isPending } = useMutation<unknown, Error, NewFighter>({
    mutationFn: (variables) => createFighter(variables),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fighters"] });
    },
  });

  const onSubmit: SubmitHandler<NewFighter> = async (values) => {
    await mutateAsync(values);
    methods.reset();
  };

  // const teams = teamOptions && teamOptions.length > 0 ? teamOptions : defaultTeamOptions;/

  return (
    <Card>
      <CardContent>
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextField
                name="firstName"
                label="שם פרטי"
                requiredMark
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
                min={20}
                max={60}
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

              <NumberField name="ironNumber" label="מספר נשק" />
              <AutocompleteField
                name="teamId"
                label="צוות"
                options={teamsData?.map((team ) => ({
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
