import { useState } from "react";
import { Button } from "@/web/components/ui/button";
import { Input } from "@/web/components/ui/input";
import { DialogClose } from "@/web/components/ui/dialog";

export type NewPlatoonInput = { name: string; codeName: string; description?: string };
export type NewTeamInput = { name: string; teamNumber: string; description?: string; platoonId?: string };

export function PlatoonForm({ onSubmit }: { onSubmit: (platoon: NewPlatoonInput) => void }) {
  const [name, setName] = useState("");
  const [codeName, setCodeName] = useState("");
  const [description, setDescription] = useState("");

  const canSubmit = name.trim() && codeName.trim();

  const handleAdd = () => {
    if (!canSubmit) return;
    onSubmit({ name, codeName, description: description || undefined });
    setName("");
    setCodeName("");
    setDescription("");
  };

  return (
    <div>
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium mb-1 block">שם פלוגה</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="שם" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">שם קוד</label>
          <Input value={codeName} onChange={(e) => setCodeName(e.target.value)} placeholder="שם קוד" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">תיאור (אופציונלי)</label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="תיאור" />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <DialogClose asChild>
          <Button variant="outline">ביטול</Button>
        </DialogClose>
        <DialogClose asChild>
          <Button onClick={handleAdd} disabled={!canSubmit}>הוסף פלוגה</Button>
        </DialogClose>
      </div>
    </div>
  );
}

export function TeamForm({ platoonId, onSubmit }: { platoonId: string; onSubmit: (team: NewTeamInput) => void }) {
  const [name, setName] = useState("");
  const [teamNumber, setTeamNumber] = useState("");
  const [description, setDescription] = useState("");

  const canSubmit = name.trim() && teamNumber.trim();

  const handleAdd = () => {
    if (!canSubmit) return;
    onSubmit({ name, teamNumber, description: description || undefined, platoonId });
    setName("");
    setTeamNumber("");
    setDescription("");
  };

  return (
    <div>
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium mb-1 block">שם צוות</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="שם" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">מספר צוות</label>
          <Input value={teamNumber} onChange={(e) => setTeamNumber(e.target.value)} placeholder="מספר" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">תיאור (אופציונלי)</label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="תיאור" />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <DialogClose asChild>
          <Button variant="outline">ביטול</Button>
        </DialogClose>
        <DialogClose asChild>
          <Button onClick={handleAdd} disabled={!canSubmit}>הוסף צוות</Button>
        </DialogClose>
      </div>
    </div>
  );
}
