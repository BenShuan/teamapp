import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/web/components/ui/button";
import { Card } from "@/web/components/ui/card";
import { Badge } from "@/web/components/ui/badge";
import { Plus, Trash2, ChevronLeft } from "lucide-react";
import { platoonsQueryOptions, createPlatoon, deletePlatoon } from "@/web/services/platoons.api";
import { teamsQueryOptions } from "@/web/services/users.api";
import { createTeam, deleteTeam } from "@/web/services/teams.api";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/web/components/ui/dialog";
import { PlatoonForm, TeamForm } from "@/web/components/platoon-team-forms";

type Platoon = {
  id: string;
  name: string;
  codeName: string;
  description: string | null;
};

type Team = {
  id: string;
  name: string;
  teamNumber: string;
  description: string | null;
  platoonId: string | null;
};

export function AdminPlatoonsTeamsManager() {
  const queryClient = useQueryClient();
  const [selectedPlatoonId, setSelectedPlatoonId] = useState<string | null>(null);

  const { data: platoons = [] } = useQuery(platoonsQueryOptions());
  const { data: allTeams = [] } = useQuery(teamsQueryOptions());

  const createPlatoonMutation = useMutation({
    mutationFn: createPlatoon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platoons"] });
    },
  });

  const deletePlatoonMutation = useMutation({
    mutationFn: deletePlatoon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platoons"] });
      setSelectedPlatoonId(null);
    },
  });

  const createTeamMutation = useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });

  const deleteTeamMutation = useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });

  const selectedPlatoon = platoons.find((p: Platoon) => p.id === selectedPlatoonId);
  const selectedPlatoonTeams = allTeams.filter((t: Team) => t.platoonId === selectedPlatoonId);
  const unassignedTeams = allTeams.filter((t: Team) => !t.platoonId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Master: Platoons List */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">ניהול פלוגות</h3>
          <AddPlatoonDialog onAdd={createPlatoonMutation.mutate} />
        </div>
        <div className="space-y-2">
          {platoons.map((platoon: Platoon) => (
            <button
              key={platoon.id}
              onClick={() => setSelectedPlatoonId(prev => prev===platoon.id ? null : platoon.id)}
              className={`w-full text-left p-3 rounded border transition-colors flex items-center justify-between ${selectedPlatoonId === platoon.id
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-muted border-border"
                }`}
            >
              <div>
                <div className="font-medium">{platoon.name}</div>
                <div className="text-sm opacity-80">{platoon.codeName}</div>
              </div>
              <ChevronLeft className="h-4 w-4" />
            </button>
          ))}
          {platoons.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              אין פלוגות זמינות. הוסף פלוגה חדשה כדי להתחיל.
            </p>
          )}
        </div>
      </Card>

      {/* Detail: Teams in Selected Platoon */}
      <Card className="p-4">
        {selectedPlatoon ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{selectedPlatoon.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedPlatoon.codeName}</p>
              </div>
              <div className="flex gap-2">
                <AddTeamDialog platoonId={selectedPlatoon.id} onAdd={createTeamMutation.mutate} />
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (confirm(`מחק פלוגה "${selectedPlatoon.name}"? פעולה זו תשחרר את כל הצוותים המשויכים.`)) {
                      deletePlatoonMutation.mutate(selectedPlatoon.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium mb-2"> צוותים ({selectedPlatoonTeams.length})</h4>
              {selectedPlatoonTeams.map((team: Team) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between p-2 rounded border bg-card"
                >
                  <div>
                    <div className="font-medium text-sm">{team.name}</div>
                    <div className="text-xs text-muted-foreground">#{team.teamNumber}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`מחק צוות "${team.name}"?`)) {
                        deleteTeamMutation.mutate(team.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {selectedPlatoonTeams.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  אין צוותים בפלוגה זו. הוסף צוות חדש כדי להתחיל.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-sm">בחר פלוגה כדי לצפות ולנהל צוותים</p>
          </div>
        )}
      </Card>

      {/* Unassigned Teams Section */}
      {unassignedTeams.length > 0 && (
        <Card className="p-4 md:col-span-2">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            צוותים ללא פלוגה
            <Badge variant="secondary">{unassignedTeams.length}</Badge>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {unassignedTeams.map((team: Team) => (
              <div
                key={team.id}
                className="flex items-center justify-between p-2 rounded border bg-card"
              >
                <div>
                  <div className="font-medium text-sm">{team.name}</div>
                  <div className="text-xs text-muted-foreground">#{team.teamNumber}</div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (confirm(`מחק צוות "${team.name}"?`)) {
                      deleteTeamMutation.mutate(team.id);
                    }
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function AddPlatoonDialog({ onAdd }: { onAdd: (platoon: { name: string; codeName: string; description?: string }) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" /> הוסף פלוגה
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>הוסף פלוגה חדשה</DialogTitle>
        </DialogHeader>
        <PlatoonForm onSubmit={(values) => { onAdd(values); setOpen(false); }} />
      </DialogContent>
    </Dialog>
  );
}

function AddTeamDialog({ platoonId, onAdd }: { platoonId: string; onAdd: (team: { name: string; teamNumber: string; description?: string; platoonId?: string }) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" /> הוסף צוות
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>הוסף צוות חדש</DialogTitle>
        </DialogHeader>
        <TeamForm platoonId={platoonId} onSubmit={(values) => { onAdd(values); setOpen(false); }} />
      </DialogContent>
    </Dialog>
  );
}
