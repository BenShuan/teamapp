---
name: form-pattern
description: When building a create or edit form for an entity using react-hook-form, load this skill. Triggers on phrases like "add form", "create form for", "edit form", "פורם יצירה", "טופס עריכה", "הוסף טופס ל".
---

# Skill: Form Pattern (Create & Edit)

## Role & Persona
You are a senior React developer who builds accessible, bilingual (Hebrew UI / English code) forms using react-hook-form with FormProvider and custom Field components. You handle both create and edit modes in a single component.

## Trigger Description
Activate when the user wants to:
- Build a create form for a new entity
- Build an edit form for an existing entity
- Add form fields to an existing form
- Build a form inside a Dialog

---

## Step-by-Step Workflow

<workflow>

### Step 1 — Determine Form Mode
- Receiving `entity` prop → Edit mode (`isNew = false`)
- No `entity` prop → Create mode (`isNew = true`)
- Single component handles both → less duplication

### Step 2 — Create the Form Component

```typescript
// routes/(app)/<domain>/components/<Entity>Form.tsx
"use client";

import { useForm, SubmitHandler, FormProvider } from "react-hook-form";
import { Card, CardContent } from "@/web/components/ui/card";
import { Button } from "@/web/components/ui/button";
import {
  TextField,
  NumberField,
  AutocompleteField,
  TextareaField,
  TimeField,
  // DateField — not yet exported from forms/index.ts; add when available
} from "@/web/components/forms";
import { MyEntity } from "@teamapp/api/schema";
import { useMyEntityForm } from "@/web/hooks/use<Domain>";
import { useNavigate } from "@tanstack/react-router";
import { useTeams } from "@/web/hooks/useTeams"; // if FK to team

type Props = {
  entity?: MyEntity;        // undefined = create, defined = edit
  onSuccess?: () => void;   // optional callback (e.g., close dialog)
};

// Empty defaults for CREATE mode
const defaultValues: Partial<MyEntity> = {
  name: "",
  description: "",
  quantity: undefined,
  teamId: undefined,
};

const MyEntityForm: React.FC<Props> = ({ entity, onSuccess }) => {
  const isNew = !entity?.id;
  const navigate = useNavigate();

  const methods = useForm<MyEntity>({
    defaultValues: isNew ? (defaultValues as MyEntity) : entity,
  });

  const { mutateAsync, isPending } = useMyEntityForm(isNew, entity?.id);

  // Optional: FK data for autocomplete
  const { data: teams = [], isLoading: teamsLoading } = useTeams();

  const onSubmit: SubmitHandler<MyEntity> = async (values) => {
    await mutateAsync(values);
    methods.reset();
    if (onSuccess) {
      onSuccess();               // close dialog
    } else {
      navigate({ to: ".." });   // navigate back if standalone page
    }
  };

  return (
    <Card>
      <CardContent>
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <div className="flex flex-col md:flex-row md:flex-wrap gap-4">

              {/* Required text field */}
              <TextField
                name="name"
                label="שם"
                requiredMark
                rules={{ required: "שדה חובה" }}
              />

              {/* Optional number field */}
              <NumberField
                name="quantity"
                label="כמות"
                min={0}
              />

              {/* Optional textarea */}
              <TextareaField
                name="description"
                label="תיאור"
                className="w-full"
              />

              {/* FK autocomplete */}
              <AutocompleteField
                name="teamId"
                label="צוות"
                options={teams.map((t) => ({ label: t.name, value: t.id }))}
                isLoading={teamsLoading}
                placeholder="בחר צוות"
              />

              {/* Date field */}
              <DateField
                name="workDate"
                label="תאריך"
                requiredMark
                rules={{ required: "שדה חובה" }}
              />

            </div>

            {/* Action buttons */}
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
                {isPending ? "שומר..." : isNew ? "צור פריט" : "עדכן פריט"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
};

export default MyEntityForm;
```

### Step 3 — Using Form in a Dialog

```typescript
// In a page or parent component:
function AddEntityDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>הוסף פריט</Button>
      </DialogTrigger>
      <DialogContent dir="rtl" className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogTitle>הוסף פריט חדש</DialogTitle>
        {/* Pass onSuccess to close dialog */}
        <MyEntityForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
```

</workflow>

---

## Field Components Reference

| Component | Use for | Key props |
|-----------|---------|-----------|
| `TextField` | Text input | `name`, `label`, `type`, `rules`, `requiredMark`, `placeholder` |
| `NumberField` | Numeric input | `name`, `label`, `min`, `max` |
| `TextareaField` | Multi-line text | `name`, `label`, `rows` |
| `AutocompleteField` | Select with search | `name`, `options`, `isLoading`, `emptyMessage`, `placeholder` |
| `DateField` | Date picker | `name`, `label`, `rules` |
| `TimeField` | Time picker | `name`, `label` |

All fields auto-read `control` from `FormProvider` — no need to pass it manually.

---

## Banned Patterns
- **NEVER** use `<input>` or `<select>` directly — always use Field components
- **NEVER** skip `FormProvider` — it's required for fields to auto-connect
- **NEVER** navigate without `methods.reset()` first — prevents stale form state
- **NEVER** use `defaultValues: entity` directly — it breaks when entity is undefined (create mode)
- **NEVER** show loading/error UI in the form — handle in the parent page

---

## Quality Checklist
- [ ] `isNew = !entity?.id` guards both modes in one component?
- [ ] `defaultValues` set correctly: empty object for create, entity for edit?
- [ ] `FormProvider` wraps the form?
- [ ] Every required field has `rules={{ required: "שדה חובה" }}` + `requiredMark`?
- [ ] Submit button shows `"שומר..."` when `isPending`?
- [ ] `methods.reset()` called after successful submit?
- [ ] `onSuccess()` callback or `navigate({ to: ".." })` after submit?
