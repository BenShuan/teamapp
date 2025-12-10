import { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/web/components/dataTable/DataTable";
import { updateUser, setUserTeams, setUserPlatoons, softDeleteUser, reactivateUser, usersQueryOptions, teamsQueryOptions, platoonsQueryOptions } from "@/web/services/users.api";
import { useState } from "react";
import { Button } from "@/web/components/ui/button";
import { Input } from "@/web/components/ui/input";
import { Badge } from "@/web/components/ui/badge";
import { X, Check, Pencil } from "lucide-react";
import { User, usersRoles } from "@teamapp/api/schema";
import { Autocomplete } from "./ui/autocomplete";
import { Popover, PopoverTrigger, PopoverContent } from "@/web/components/ui/popover";
import { cn } from "../lib/utils";



export function AdminUsersTable() {
  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useQuery(usersQueryOptions());
  const { data: teams = [] } = useQuery(teamsQueryOptions());
  const { data: platoons = [] } = useQuery(platoonsQueryOptions());

  const updateUserMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const setTeamsMutation = useMutation({
    mutationFn: setUserTeams,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const setPlatoonsMutation = useMutation({
    mutationFn: setUserPlatoons,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const softDeleteMutation = useMutation({
    mutationFn: softDeleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const reactivateMutation = useMutation({
    mutationFn: reactivateUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "שם משתמש",
      cell: ({ row }) => <EditableTextCell row={row} field="name" onSave={(value) => updateUserMutation.mutate({ id: row.original.id, updates: { name: value } })} />,
    },
    {
      accessorKey: "email",
      header: "אימייל",
      cell: ({ row }) => <EditableTextCell row={row} field="email" onSave={(value) => updateUserMutation.mutate({ id: row.original.id, updates: { email: value } })} />,
    },
    {
      accessorKey: "role",
      header: "תפקיד",
      cell: ({ row }) => (

          <Autocomplete
            multiple={true} value={row.original.role}
            onValueChange={(value) => updateUserMutation.mutate({ id: row.original.id, updates: { role: value.toString() } })}
            name="role"
            options={usersRoles.map((role) => { return { label: role.toString(), value: role.toString() } })}
          />
      ),
    },
    {
      id: "teams",
      header: "צוותים",
      cell: ({ row }) => <IdPicker keyIdentifier="teamId" items={teams} usersItems={row.original?.userTeamMembership} onSave={(teamIds) => setTeamsMutation.mutate({ id: row.original.id, teamIds })} title="בחר צוותים" />,
    },
    {
      id: "platoons",
      header: "פלוגות",
      cell: ({ row }) => <IdPicker keyIdentifier="platoonId" items={platoons} usersItems={row.original?.userPlatoonMembership} onSave={(platoonIds) => setPlatoonsMutation.mutate({ id: row.original.id, platoonIds })} title={'בחר פלוגות'} />,
    },
    {
      id: "status",
      header: "סטטוס",
      cell: ({ row }) => {
        const isDeleted = !!row.original.deletedAt;
        return (
          <div className="flex items-center gap-2">
            <Badge variant={isDeleted ? "destructive" : "default"}>
              {isDeleted ? "לא פעיל" : "פעיל"}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (isDeleted) {
                  reactivateMutation.mutate(row.original.id);
                } else {
                  softDeleteMutation.mutate(row.original.id);
                }
              }}
            >
              {isDeleted ? "הפעל מחדש" : "השבת"}
            </Button>
          </div>
        );
      },
    },
  ];

  if (isLoading) return <div>טוען משתמשים...</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">ניהול משתמשים</h2>
      <DataTable columns={columns} data={users} initialState={{}} />
    </div>
  );
}

function EditableTextCell({ row, field, onSave }: { row: any; field: string; onSave: (value: string) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(row.original[field]);

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between gap-2">
        <span>{row.original[field]}</span>
        <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
          <Pencil className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <Input value={value} onChange={(e) => setValue(e.target.value)} className="h-8" />
      <Button size="sm" variant="ghost" onClick={() => { onSave(value); setIsEditing(false); }}>
        <Check className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={() => { setValue(row.original[field]); setIsEditing(false); }}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

function IdPicker({ items, usersItems, onSave, title, keyIdentifier }: { items: any[]; usersItems: any[] | undefined, onSave: (ids: string[]) => void, title: string, keyIdentifier: string }) {
  const [selected, setSelected] = useState<string[]>(usersItems?.map((ui) => ui?.[keyIdentifier]) ?? []);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline">
          {title} ({selected.length})
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-1">
          {items.map((item) => {
            const isSelected = selected.includes(item.id);
            return (
              <label key={item.id} className={cn(isSelected && "font-bold", "flex flex-row-reverse items-center gap-2 p-1 rounded hover:bg-muted")}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelected((prev) => [...prev, item.id]);
                    } else {
                      setSelected((prev) => prev.filter((id) => id !== item.id));
                    }
                  }}
                />
                <span className="text-sm">{item.name}</span>
              </label>
            )
          })}
        </div>
        <div className="flex justify-end gap-2 mt-3">
          <Button size="sm" variant="outline" onClick={() => setIsOpen(false)}>בטל</Button>
          <Button size="sm" onClick={() => { onSave(selected); setIsOpen(false); }}>שמור</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}


