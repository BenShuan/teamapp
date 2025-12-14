import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/web/components/ui/button";
import { Card } from "@/web/components/ui/card";
import { Plus, Trash2, Edit2 } from "lucide-react";
import {
  gearCatalogQueryOptions,
  createGearCatalog,
  updateGearCatalog,
  deleteGearCatalog,
} from "@/web/services/serializedGear.api";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/web/components/ui/dialog";
import { useForm, FormProvider } from "react-hook-form";
import { TextField, AutocompleteField } from "@/web/components/forms";
import type { NewSerializedGear, SerializedGear } from "@teamapp/api/schema";

const gearTypeOptions = [
  { label: "אמרל", value: "אמרל" },
  { label: "קשר", value: "קשר" },
  { label: "נשק", value: "נשק" },
  { label: "כללי", value: "כללי" },
  { label: "נפיצה", value: "נפיצה" },
  { label: "חבלה", value: "חבלה" },
];

function AddGearDialog({ onAdd }: { onAdd: (data: NewSerializedGear) => void }) {
  const [open, setOpen] = useState(false);
  const methods = useForm<NewSerializedGear>({
    defaultValues: { name: "", type: "כללי" },
  });

  const onSubmit = async (data: NewSerializedGear) => {
    await onAdd(data);
    methods.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 ml-1" />
          הוסף ציוד
        </Button>
      </DialogTrigger>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>הוסף פריט ציוד חדש</DialogTitle>
          <DialogDescription>הגדר סוג ציוד חדש לקטלוג</DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
            <TextField
              name="name"
              label="שם הציוד"
              requiredMark
              placeholder="לדוגמה: Google, מפה טקטית"
              rules={{ required: "שדה חובה" }}
            />
            <AutocompleteField
              name="type"
              label="קטגוריה"
              requiredMark
              options={gearTypeOptions}
              rules={{ required: "שדה חובה" }}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                ביטול
              </Button>
              <Button type="submit" disabled={methods.formState.isSubmitting}>
                {methods.formState.isSubmitting ? "שומר..." : "שמור"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

function EditGearDialog({
  gear,
  onEdit,
}: {
  gear: SerializedGear;
  onEdit: (data: { id: string; gear: NewSerializedGear }) => void;
}) {
  const [open, setOpen] = useState(false);
  const methods = useForm<NewSerializedGear>({
    defaultValues: { name: gear.name, type: gear.type },
  });

  const onSubmit = async (data: NewSerializedGear) => {
    await onEdit({ id: gear.id, gear: data });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <Edit2 className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>ערוך פריט ציוד</DialogTitle>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
            <TextField
              name="name"
              label="שם הציוד"
              requiredMark
              rules={{ required: "שדה חובה" }}
            />
            <AutocompleteField
              name="type"
              label="קטגוריה"
              requiredMark
              options={gearTypeOptions}
              rules={{ required: "שדה חובה" }}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                ביטול
              </Button>
              <Button type="submit" disabled={methods.formState.isSubmitting}>
                {methods.formState.isSubmitting ? "שומר..." : "שמור"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

export function AdminSerializedGearManager() {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const { data: gearCatalog = [], isLoading } = useQuery(gearCatalogQueryOptions);

  const createGearMutation = useMutation({
    mutationFn: createGearCatalog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gear-catalog"] });
    },
  });

  const editGearMutation = useMutation({
    mutationFn: updateGearCatalog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gear-catalog"] });
    },
  });

  const deleteGearMutation = useMutation({
    mutationFn: deleteGearCatalog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gear-catalog"] });
    },
  });

  const filteredGear = Array.isArray(gearCatalog)
    ? selectedType
      ? gearCatalog.filter((g: SerializedGear) => g.type === selectedType)
      : gearCatalog
    : [];

  const typeGroups = Array.isArray(gearCatalog)
    ? gearCatalog.reduce((acc: Record<string, number>, gear: SerializedGear) => {
      acc[gear.type] = (acc[gear.type] || 0) + 1;
      return acc;
    }, {})
    : {};

  if (isLoading) {
    return <div className="text-center py-4">טוען קטלוג ציוד...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Filter by Type */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">קטגוריות</h3>
        </div>
        <div className="space-y-2">
          <button
            onClick={() => setSelectedType(null)}
            className={`w-full text-right p-2 rounded border transition-colors ${!selectedType
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-muted border-border"
              }`}
          >
            <div className="flex justify-between items-center">
              <span>הכל</span>
              <span className="text-sm opacity-80">
                {Array.isArray(gearCatalog) ? gearCatalog.length : 0}
              </span>
            </div>
          </button>
          {gearTypeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedType(option.value)}
              className={`w-full text-right p-2 rounded border transition-colors ${selectedType === option.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-muted border-border"
                }`}
            >
              <div className="flex justify-between items-center">
                <span>{option.label}</span>
                <span className="text-sm opacity-80">{typeGroups[option.value] || 0}</span>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Gear Items List */}
      <Card className="p-4 md:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            פריטי ציוד {selectedType && `- ${selectedType}`}
          </h3>
          <AddGearDialog onAdd={createGearMutation.mutate} />
        </div>
        <div className="space-y-2">
          {filteredGear.map((gear: SerializedGear) => (
            <div
              key={gear.id}
              className="flex items-center justify-between p-3 rounded border bg-card"
            >
              <div>
                <div className="font-medium">{gear.name}</div>
                <div className="text-sm text-muted-foreground">{gear.type}</div>
              </div>
              <div className="flex gap-1">
                <EditGearDialog gear={gear} onEdit={editGearMutation.mutate} />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (confirm(`מחק פריט "${gear.name}"?`)) {
                      deleteGearMutation.mutate(gear.id);
                    }
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
          {filteredGear.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              אין פריטי ציוד{selectedType && ` בקטגוריה ${selectedType}`}. הוסף פריט חדש כדי
              להתחיל.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
