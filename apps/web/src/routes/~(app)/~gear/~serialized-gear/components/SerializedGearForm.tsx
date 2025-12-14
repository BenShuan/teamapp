"use client";

import { TextField, AutocompleteField } from "@/web/components/forms";
import { useGearCatalog } from "@/web/hooks/useSerializedGear";
import { useFighters } from "@/web/hooks/useFighter";
import type { SerializedGearFighter } from "@teamapp/api/schema";
import { useForm, SubmitHandler, FormProvider } from "react-hook-form";
import { Card, CardContent } from "@/web/components/ui/card";
import { Button } from "@/web/components/ui/button";
import useSerializedGearForm from "@/web/hooks/useSerializedGearForm";

type SerializedGearFormProps = {
  gear?: SerializedGearFighter;
  onCreated?: (gear: any) => void;
};

const defaultGear = {
  serializedGearId: "",
  fighterId: "",
  teamId: "",
  serialNumber: "",
  issuedDate: "",
  lastCheckDate: "",
  location: "",
} as unknown as SerializedGearFighter;

const SerializedGearForm: React.FC<SerializedGearFormProps> = ({ gear,onCreated }) => {
  const isNew = !gear?.id;

  const methods = useForm<SerializedGearFighter>({
    defaultValues: isNew ? defaultGear : gear,
  });

  const gearCatalogData = useGearCatalog();
  const fightersData = useFighters();

  const { mutateAsync, isPending } = useSerializedGearForm(isNew, gear?.id);

  const onSubmit: SubmitHandler<SerializedGearFighter> = async (values) => {
    values.fightersTeamId=(fightersData.fightersMap[values.fighterId])?.value?.teamId || "";
    await mutateAsync(values);
    methods.reset();
    onCreated?.(values)
  };

  return (
    <Card>
      <CardContent>
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <div className="flex flex-col md:flex-row md:flex-wrap gap-4 md:justify-between">
              <AutocompleteField
                name="serializedGearId"
                label="סוג ציוד"
                requiredMark
                options={
                  Object.values(gearCatalogData.catalogMap).map(({ label, value }) => ({ label, value: value.id })) as { label: string; value: any }[]
                }
                placeholder="בחר סוג ציוד"
                isLoading={gearCatalogData.isLoading}
                rules={{ required: "שדה חובה" }}
              />

              <AutocompleteField
                name="fighterId"
                label="לוחם"
                requiredMark
                options={
                  Object.values(fightersData.fightersMap).map(({ label, value }) => ({ label, value:value.id })) as { label: string; value: any }[]

                }
                placeholder="בחר לוחם"
                isLoading={fightersData.isLoading}
                rules={{ required: "שדה חובה" }}
              />

              <TextField
                name="serialNumber"
                label="מספר סידורי"
                placeholder="מספר סידורי ייחודי"
              />

              <TextField name="location" label="מיקום" placeholder="לדוגמה: מחסן / רכב" />

              <TextField
                name="issuedDate"
                label="תאריך הנפקה"
                placeholder="YYYY-MM-DD"
              />

              <TextField
                name="lastCheckDate"
                label="תאריך בדיקה אחרונה"
                placeholder="YYYY-MM-DD"
              />
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
                {isPending ? "שולח..." : "שמור ציוד"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
};

export default SerializedGearForm;
