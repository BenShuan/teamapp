"use client";

import { useMemo } from "react";
import { createFileRoute, Link, LinkComponentProps } from "@tanstack/react-router";

import RoutePending from "@/web/components/route-pending";
import queryClient from "@/web/lib/query-client";
import { useFighters } from "@/web/hooks/useFighter";
import { useLogisticGear } from "@/web/hooks/useLogisticGear";
import { useSerializedGear } from "@/web/hooks/useSerializedGear";
import { useTeams } from "@/web/hooks/useTeams";
import { useAttendance } from "@/web/hooks/useAttendance";
import { fighterQueryOptions } from "@/web/services/fighter.api";
import { logisticGearQueryOptions } from "@/web/services/logisticGear.api";
import { serializedGearQueryOptions } from "@/web/services/serializedGear.api";
import { teamQueryOptions } from "@/web/services/teams.api";
import { attendanceQueryOptions } from "@/web/services/attendance.api";
import TeamCard from "./~home/TeamCard";
import { type SerializedGearFighter, type LogisticGear, statusLocations, StatusLocationEnum, StatusLocation } from "@teamapp/api/schema";

const HomePage = () => {
  const { data: fighters = [], isLoading: fightersLoading, fightersMap } = useFighters();
  const { data: teams = [], isLoading: teamsLoading } = useTeams();
  const { data: serialized = [], isLoading: serializedLoading } = useSerializedGear();
  const { data: logistic = [], isLoading: logisticLoading } = useLogisticGear();

  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const { attendanceMapByDate, isLoading: attendanceLoading } = useAttendance(startOfDay, endOfDay);

  const totalFighters = Array.isArray(fighters) ? fighters.length : 0;
  const totalTeams = Array.isArray(teams) ? teams.length : 0;
  const totalSerialized = Array.isArray(serialized) ? serialized.length : 0;
  const totalLogistic = Array.isArray(logistic) ? logistic.length : 0;

  const teamStats = useMemo(() => {
    const stats: Record<string, { attendance: Record<StatusLocation, number>; serialized: number; logisticQty: number }> = {};

    // Initialize stats for all teams
    Array.isArray(teams) && teams.forEach((team) => {
      stats[team.id] = { attendance: { [StatusLocationEnum.נוכח]: 0, [StatusLocationEnum.בבית]: 0, [StatusLocationEnum.יוצא]: 0, [StatusLocationEnum.מגיע]: 0 }, serialized: 0, logisticQty: 0 };
    });

    // Count serialized gear per team
    Array.isArray(serialized) && serialized.forEach((item: SerializedGearFighter) => {
      const fighter = fightersMap[item.fighterId]?.value;
      if (fighter?.teamId && stats[fighter.teamId]) {
        stats[fighter.teamId].serialized += 1;
      }
    });

    // Sum logistic gear quantity per team
    Array.isArray(logistic) && logistic.forEach((item: LogisticGear) => {
      if (stats[item.teamId]) {
        stats[item.teamId].logisticQty += item.quantity ?? 0;
      }
    });

    // Count attendance per team for today
    const todayKey = today.toISOString().split('T')[0];
    const todayAttendance = attendanceMapByDate[todayKey]?.value || {};

    for (const team of teams) {
      stats[team.id].attendance = statusLocations.reduce((acc, loc) => {
        acc[loc] = todayAttendance[loc]?.filter(att=>fightersMap[att.fighterId]?.value.teamId === team.id).length;
        return acc;
      }, {} as Record<StatusLocation, number>);

    }

    return stats;
  }, [teams, attendanceMapByDate, serialized, logistic, fightersMap]);

  const loading = fightersLoading || teamsLoading || serializedLoading || logisticLoading || attendanceLoading;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6">
      <section className="relative overflow-hidden rounded-2xl bg-linear-to-r from-slate-900 via-slate-800 to-slate-700 p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-wide text-slate-200">ברוך הבא</p>
            <p className="max-w-2xl text-slate-100/90">
              ניהול ציוד, צוותים ולוחמים במקום אחד. קפוץ ישר לאזורים הקריטיים או עיין במספרים המרכזיים לפני קבלת החלטות.
            </p>

          </div>
          <div className="grid grid-cols-2 gap-3 rounded-xl bg-white/10 p-4 text-sm text-white md:w-80">
            <StatMini label="לוחמים" value={totalFighters} loading={loading} to="/fighter" />
            <StatMini label="צוותים" value={totalTeams} loading={loading} to="/fighter" />
            <StatMini label='צל"ם' value={totalSerialized} loading={loading} to="/gear/serialized-gear" />
            <StatMini label="ציוד לוגיסטי" value={totalLogistic} loading={loading} to="/gear/logistic-gear" />
          </div>
        </div>
        <div className="absolute right-6 top-6 h-24 w-24 rounded-full bg-white/10 blur-3xl" />
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="mb-4 text-2xl font-bold">צוותים</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.isArray(teams) && teams.length > 0 ? (
              teams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  attendance={teamStats[team.id]?.attendance ?? 0}
                  serializedGear={teamStats[team.id]?.serialized ?? 0}
                  logisticQuantity={teamStats[team.id]?.logisticQty ?? 0}
                />
              ))
            ) : (
              <p className="text-muted-foreground">אין צוותים זמינים</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

const StatMini = ({ label, value, loading, to }: { label: string; value: number; loading: boolean } & LinkComponentProps) => (
  <Link className="rounded-lg bg-white/10 p-3" to={to}>
    <div className="text-xs text-slate-200">{label}</div>
    <div className="text-xl font-semibold">{loading ? "..." : value}</div>
  </Link>
);

export const Route = createFileRoute("/(app)/home")({
  component: HomePage,
  loader: () => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    return Promise.all([
      queryClient.ensureQueryData(fighterQueryOptions),
      queryClient.ensureQueryData(teamQueryOptions),
      queryClient.ensureQueryData(serializedGearQueryOptions),
      queryClient.ensureQueryData(logisticGearQueryOptions),
      queryClient.ensureQueryData(attendanceQueryOptions(startOfDay, endOfDay)),
    ]);
  },
  pendingComponent: RoutePending,
});
