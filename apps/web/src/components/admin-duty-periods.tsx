import { useState } from "react";
import { Button } from "@/web/components/ui/button";
import { Card } from "@/web/components/ui/card";
import { Badge } from "@/web/components/ui/badge";
import { Input } from "@/web/components/ui/input";
import { Switch } from "@/web/components/ui/switch";
import { DatePicker } from "@/web/components/ui/date-picker";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/web/components/ui/dialog";
import { Plus, Trash2, Edit2 } from "lucide-react";
import {
  useDutyPeriods,
  useCreateDutyPeriod,
  useUpdateDutyPeriod,
  useDeleteDutyPeriod,
} from "@/web/hooks/useDutyPeriod";
import type { DutyPeriod, NewDutyPeriod, UpdateDutyPeriod } from "@teamapp/api/schema";
import { formatShortDate } from "@teamapp/shared";

export function AdminDutyPeriodManager() {
  const { data: dutyPeriods = [] } = useDutyPeriods();
  const createMutation = useCreateDutyPeriod();
  const updateMutation = useUpdateDutyPeriod();
  const deleteMutation = useDeleteDutyPeriod();

  const [editingPeriod, setEditingPeriod] = useState<DutyPeriod | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const handleCreate = (data: NewDutyPeriod) => {
    createMutation.mutate(data);
  };

  const handleUpdate = (id: string, updates: UpdateDutyPeriod) => {
    updateMutation.mutate({ id, updates });
    setEditOpen(false);
    setEditingPeriod(null);
  };

  const handleDelete = (period: DutyPeriod) => {
    if (confirm(`מחק תקופת צו "${period.name}"? לא ניתן למחוק תקופה שיש לה רשומות נוכחות.`)) {
      deleteMutation.mutate(period.id);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">ניהול תקופות צו</h3>
        <CreateDutyPeriodDialog onAdd={handleCreate} />
      </div>

      <div className="space-y-2">
        {(dutyPeriods as DutyPeriod[]).map((period) => (
          <div
            key={period.id}
            className="flex items-center justify-between p-3 rounded border bg-card"
          >
            <div className="flex items-center gap-3">
              <div>
                <div className="font-medium">{period.name || "ללא שם"}</div>
                <div className="text-sm text-muted-foreground">
                  {period.startDate} – {period.endDate}
                </div>
              </div>
              <Badge variant={period.isOpen ? "default" : "secondary"}>
                {period.isOpen ? "פתוחה" : "סגורה"}
              </Badge>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditingPeriod(period);
                  setEditOpen(true);
                }}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(period)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
        {dutyPeriods.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            אין תקופות צו. הוסף תקופה חדשה כדי להתחיל.
          </p>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(open) => {
        setEditOpen(open);
        if (!open) setEditingPeriod(null);
      }}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle>עריכת תקופת צו</DialogTitle>
          </DialogHeader>
          {editingPeriod && (
            <DutyPeriodForm
              defaultValues={editingPeriod}
              submitLabel="שמור שינויים"
              onSubmit={(values) => handleUpdate(editingPeriod.id, values)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function CreateDutyPeriodDialog({ onAdd }: { onAdd: (data: NewDutyPeriod) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" /> הוסף תקופה
        </Button>
      </DialogTrigger>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle>הוסף תקופת צו חדשה</DialogTitle>
        </DialogHeader>
        <DutyPeriodForm
          submitLabel="הוסף תקופה"
          onSubmit={(values) => {
            onAdd(values as NewDutyPeriod);
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

interface DutyPeriodFormProps {
  defaultValues?: Partial<DutyPeriod>;
  submitLabel: string;
  onSubmit: (values: { name?: string | null; startDate: string; endDate: string; isOpen?: boolean }) => void;
}

function DutyPeriodForm({ defaultValues, submitLabel, onSubmit }: DutyPeriodFormProps) {
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [startDate, setStartDate] = useState<Date | null>(
    defaultValues?.startDate ? new Date(defaultValues.startDate) : null
  );
  const [endDate, setEndDate] = useState<Date | null>(
    defaultValues?.endDate ? new Date(defaultValues.endDate) : null
  );
  const [isOpen, setIsOpen] = useState(defaultValues?.isOpen ?? false);

  const canSubmit = startDate && endDate;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      name: name || null,
      startDate: formatShortDate(startDate),
      endDate: formatShortDate(endDate),
      isOpen,
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium mb-1 block">שם התקופה (אופציונלי)</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="שם" />
      </div>
      <div>
        <DatePicker
          label="תאריך התחלה"
          value={startDate}
          onChange={(d) => setStartDate(d ?? null)}
        >
          <DatePicker.Input />
        </DatePicker>
      </div>
      <div>
        <DatePicker
          label="תאריך סיום"
          value={endDate}
          onChange={(d) => setEndDate(d ?? null)}
        >
          <DatePicker.Input />
        </DatePicker>
      </div>
      <div className="flex items-center gap-3">
        <Switch checked={isOpen} onCheckedChange={setIsOpen} />
        <label className="text-sm font-medium">תקופה פתוחה</label>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <DialogClose asChild>
          <Button variant="outline">ביטול</Button>
        </DialogClose>
        <DialogClose asChild>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {submitLabel}
          </Button>
        </DialogClose>
      </div>
    </div>
  );
}
