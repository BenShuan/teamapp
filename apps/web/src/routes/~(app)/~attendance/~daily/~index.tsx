"use client";

import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, ChevronUp } from "lucide-react";

import RoutePending from "@/web/components/route-pending";
import { Card, CardContent, CardHeader, CardTitle } from "@/web/components/ui/card";
import queryClient from "@/web/lib/query-client";
import { useAttendance } from "@/web/hooks/useAttendance";
import { useTeams } from "@/web/hooks/useTeams";
import { useFighters } from "@/web/hooks/useFighter";
import { attendanceQueryOptions } from "@/web/services/attendance.api";
import { teamQueryOptions } from "@/web/services/teams.api";
import { fighterQueryOptions } from "@/web/services/fighter.api";
import { attendnanceColorMap } from "../components/AttendanceCell";
import { fullName } from "@teamapp/shared";
import { StatusLocationEnum } from "@teamapp/api/schema";


const DailyAttendancePage = () => {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  const { data: attendance=[], isLoading: attendanceLoading } = useAttendance(startOfDay, endOfDay);
  const { data: teams = [], isLoading: teamsLoading } = useTeams();
  const { data: fighters = [], isLoading: fightersLoading } = useFighters();

  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

  const toggleTeam = (teamId: string) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeams(newExpanded);
  };

  const teamAttendance = useMemo(() => {
    const result: Record<string, Array<{ fighter: any; status: string | null }>> = {};

    Array.isArray(teams) && teams.forEach((team) => {
      result[team.id] = [];
    });

    // Count attendance per team for today
    const todayKey = today.toISOString().split('T')[0];
    const todayAttendance = attendance.flatMap((a) => {
      return a.attendances.filter((att)=> new Date(att.workDate).toISOString().split('T')[0] === todayKey)
    });

    for (const team of teams) {
      if (!Array.isArray(fighters)) {
        continue;
      };
      result[team.id] = fighters?.map((fighter) => {
        if (fighter.teamId !== team.id) {
          return null;
        }
        const fighterAttendance = todayAttendance.find((att) => att.fighterId === fighter.id)?.location;
        console.log('fighterAttendance', fighterAttendance);
        return {
          fighter,
          status: fighterAttendance ? fighterAttendance : null,
        };
      }).filter(Boolean) as Array<{ fighter: any; status: string | null }>;

    }


    Object.keys(result).forEach((teamId) => {
      result[teamId].sort((a, b) => {
        const nameA = fullName(a.fighter);
        const nameB = fullName(b.fighter);
        return nameA.localeCompare(nameB, "he");
      });
    });

    return result;
  }, [teams, fighters, attendance]);



  const loading = attendanceLoading || teamsLoading || fightersLoading;

  if (loading) {
    return <div className="text-center py-8">טוען נתונים...</div>;
  }

  return (
    <div className="mx-auto max-w-full flex flex-col gap-4 px-3 py-4 md:max-w-4xl">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">נוכחויות היום</h1>
        <p className="text-sm text-muted-foreground">
          {today.toLocaleDateString("he-IL", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="space-y-2">
        {Array.isArray(teams) && teams.length > 0 ? (
          teams.map((team) => {
            const teamMembers = teamAttendance[team.id] || [];
            const isExpanded = expandedTeams.has(team.id);
            const presentCount = teamMembers.filter((m) => m.status === StatusLocationEnum.מגיע || m.status === StatusLocationEnum.נוכח).length;
            const totalCount = teamMembers.length;

            return (
              <Card key={team.id} className="overflow-hidden">
                <button
                  onClick={() => toggleTeam(team.id)}
                  className="w-full text-left hover:bg-slate-50 transition-colors"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div>{isExpanded ? <ChevronUp /> : <ChevronDown />}</div>
                        <div>
                          <CardTitle className="text-lg">{team.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {presentCount}/{totalCount} נוכחים
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-lg">{presentCount}</div>
                        <div className="text-xs text-muted-foreground">נוכחים</div>
                      </div>
                    </div>
                  </CardHeader>
                </button>

                {isExpanded && (
                  <CardContent className="pt-3">
                    <div className="space-y-2">
                      {teamMembers.length > 0 ? (
                        teamMembers.map((member) => (
                          <div
                            key={member.fighter.id}
                            className="flex items-center justify-between rounded-lg p-3"
                          >
                            <div>
                              <p className="font-semibold">
                                {member.fighter.firstName} {member.fighter.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {member.fighter.rank || "ללא דרגה"}
                              </p>
                            </div>
                            <div>
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${member.status ? (attendnanceColorMap[member.status] || "bg-gray-100 text-gray-800") : "bg-gray-100 text-gray-800"
                                  }`}
                              >
                                {member.status || "לא רשום"}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center py-4 text-muted-foreground">אין לוחמים בצוות זה</p>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        ) : (
          <p className="text-center py-8 text-muted-foreground">אין צוותים זמינים</p>
        )}
      </div>
    </div>
  );
};

export const Route = createFileRoute("/(app)/attendance/daily/")({
  component: DailyAttendancePage,
  loader: () => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    return Promise.all([
      queryClient.ensureQueryData(attendanceQueryOptions(startOfDay, endOfDay)),
      queryClient.ensureQueryData(teamQueryOptions),
      queryClient.ensureQueryData(fighterQueryOptions),
    ]);
  },
  pendingComponent: RoutePending,
});
