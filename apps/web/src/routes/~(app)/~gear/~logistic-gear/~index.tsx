import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { createFileRoute } from "@tanstack/react-router";

import RoutePending from "@/web/components/route-pending";
import { DataTable, DataTableSearch } from "@/web/components/dataTable/DataTable";
import { DataTableColumnHeader } from "@/web/components/dataTable/columnHeader";
import { DataTableViewOptions } from "@/web/components/dataTable/columnToggle";
import { AutocompleteField, NumberField, TextField } from "@/web/components/forms";
import { Button } from "@/web/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/web/components/ui/dialog";
import queryClient from "@/web/lib/query-client";
import {
  useCreateLogisticGear,
  useDeleteLogisticGear,
  useLogisticGear,
  useUpdateLogisticGear,
} from "@/web/hooks/useLogisticGear";
import { useTeams } from "@/web/hooks/useTeams";
import { logisticGearQueryOptions } from "@/web/services/logisticGear.api";
import type { LogisticGear, NewLogisticGear, UpdateLogisticGear } from "@teamapp/api/schema";
import { Edit2, Trash2 } from "lucide-react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";

type FormValues = (NewLogisticGear & { id?: string }) | (UpdateLogisticGear & { id?: string });

const defaultValues: FormValues = {
  name: "",
  description: "",
  quantity: 0,
  location: "",
  timeOfIssue: "",
  teamId: "",
};

const LogisticGearForm = ({
  gear,
  onClose,
}: {
  gear?: LogisticGear;
  onClose?: () => void;
}) => {
  const isEdit = Boolean(gear?.id);
  const methods = useForm<FormValues>({
    defaultValues: gear ? { ...gear } : defaultValues,
  });
  const { teamsMap, isLoading: isTeamsLoading } = useTeams();
  const { mutateAsync: createGear, isPending: isCreating } = useCreateLogisticGear();
  const { mutateAsync: updateGear, isPending: isUpdating } = useUpdateLogisticGear();

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    try {
      if (isEdit && gear) {
        await updateGear({ id: gear.id, gear: values as UpdateLogisticGear });
      } else {
        await createGear(values as NewLogisticGear);
      }
      methods.reset(defaultValues);
      onClose?.();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4 py-2">
        <div className="flex flex-col md:flex-row md:flex-wrap gap-4 md:justify-between">
          <TextField name="name" label="שם" requiredMark placeholder="שם הציוד" rules={{ required: "שדה חובה" }} />

          <NumberField name="quantity" label="כמות" placeholder="0" min={0} rules={{ required: "שדה חובה" }} />

          <AutocompleteField
            name="teamId"
            label="צוות"
            requiredMark
            options={
              Object.values(teamsMap).map(({ label, value }) => ({ label, value: value.id })) as {
                label: string;
                value: string;
              }[]
            }
            placeholder="בחר צוות"
            isLoading={isTeamsLoading}
            rules={{ required: "שדה חובה" }}
          />

          <TextField name="location" label="מיקום" placeholder="לדוגמה: מחסן" />

          <TextField name="timeOfIssue" label="מועד הנפקה" placeholder="YYYY-MM-DD" />

          <TextField name="description" label="תיאור" placeholder="מידע נוסף" />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="reset" variant="outline" onClick={() => methods.reset(gear ?? defaultValues)} disabled={isCreating || isUpdating}>
            אפס
          </Button>
          <Button type="submit" disabled={isCreating || isUpdating}>
            {isEdit ? "עדכן ציוד" : "הוסף ציוד"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

const LogisticGearPage = () => {
  const { data, isLoading, isError, error } = useLogisticGear();
  const { teamsMap } = useTeams();
  const { mutate: deleteGear } = useDeleteLogisticGear();

  const [openForm, setOpenForm] = useState(false);
  const [editingGear, setEditingGear] = useState<LogisticGear | undefined>(undefined);

  const columns: ColumnDef<LogisticGear>[] = [
    {
      accessorKey: "name",
      id: "שם",
    },
    {
      accessorKey: "description",
      id: "תיאור",
      cell: ({ getValue }: { getValue: () => any }) => getValue() || "-",
    },
    {
      accessorKey: "quantity",
      id: "כמות",
    },
    {
      accessorKey: "location",
      id: "מיקום",
      cell: ({ getValue }: { getValue: () => any }) => getValue() || "-",
    },
    {
      accessorKey: "timeOfIssue",
      id: "מועד הנפקה",
      cell: ({ getValue }: { getValue: () => any }) => {
        const value = getValue();
        return value ? value : "-";
      },
    },
    {
      accessorKey: "teamId",
      id: "צוות",
      cell: ({ getValue }: { getValue: () => any }) => {
        const teamId = getValue() as string | undefined;
        return teamId ? teamsMap?.[teamId]?.label ?? "-" : "-";
      },
    },
    {
      id: "פעולות",
      cell: ({ row }: { row: { original: LogisticGear } }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setEditingGear(row.original);
              setOpenForm(true);
            }}
            title="ערוך"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteGear(row.original.id)}
            title="מחק"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ].map((col) => ({
    ...col,
    header: ({ column }) => <DataTableColumnHeader column={column} title={column.id} />,
    enableHiding: true,
    enableSorting: true,
  }));

  if (isLoading) return <div>טוען ציוד לוגיסטי...</div>;
  if (isError) return <div>שגיאה בטעינה: {(error as Error)?.message}</div>;

  const closeForm = () => {
    setOpenForm(false);
    setEditingGear(undefined);
  };

  const columnVisibility = columns.reduce(
    (acc, col) => {
      acc[col.id as string] = col.id === "תיאור" ? false : true;
      return acc;
    },
    {} as Record<string, boolean>,
  );

  return (
    <div className="mx-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ציוד לוגיסטי</h1>
        <Dialog
          open={openForm}
          onOpenChange={(open) => {
            setOpenForm(open);
            if (!open) setEditingGear(undefined);
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setEditingGear(undefined)}>הוסף ציוד</Button>
          </DialogTrigger>
          <DialogContent
            dir="rtl"
            className="w-5/6 max-w-[720px] max-h-[80vh] overflow-y-auto flex flex-col text-right"
          >
            <DialogTitle>{editingGear ? "עריכת ציוד" : "הוסף ציוד"}</DialogTitle>
            <LogisticGearForm gear={editingGear} onClose={closeForm} />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable<LogisticGear, unknown>
        columns={columns}
        data={(data ?? []) as LogisticGear[]}
        initialState={{ columnVisibility }}
      >
        <DataTableViewOptions />
        <DataTableSearch />
      </DataTable>
    </div>
  );
};

export const Route = createFileRoute("/(app)/gear/logistic-gear/")({
  component: LogisticGearPage,
  loader: () => queryClient.ensureQueryData(logisticGearQueryOptions),
  pendingComponent: RoutePending,
});
