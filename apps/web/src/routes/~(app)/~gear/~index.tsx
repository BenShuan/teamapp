"use client";

import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";

import RoutePending from "@/web/components/route-pending";
import { Card, CardContent, CardHeader, CardTitle } from "@/web/components/ui/card";
import queryClient from "@/web/lib/query-client";
import { useGearCatalog, useSerializedGear } from "@/web/hooks/useSerializedGear";
import { useLogisticGear } from "@/web/hooks/useLogisticGear";
import { useTeams } from "@/web/hooks/useTeams";
import { useFighters } from "@/web/hooks/useFighter";
import {
  gearCatalogQueryOptions,
  serializedGearQueryOptions,
} from "@/web/services/serializedGear.api";
import { logisticGearQueryOptions } from "@/web/services/logisticGear.api";
import type { LogisticGear, SerializedGearFighter } from "@teamapp/api/schema";

const GearOverviewPage = () => {
  const { data: serialized = [], isLoading: serializedLoading, isError: serializedError, error: serializedErr } = useSerializedGear();
  const { data: logistic = [], isLoading: logisticLoading, isError: logisticError, error: logisticErr } = useLogisticGear();
  const { catalogMap } = useGearCatalog();
  const { fightersMap } = useFighters();
  const { teamsMap } = useTeams();

  const serializedByCatalog = useMemo(() => {
    const counts: Record<string, Record<string, number>> = {};
    (serialized as SerializedGearFighter[]).forEach((item) => {
      const fighter = fightersMap[item.fighterId]?.value;
      const teamId = fighter?.teamId;
      const catalogId = (item as any).serializedGearId;
      if (!catalogId || !teamId) return;
      if (!counts[teamId]) counts[teamId] = {};
      const key = `${catalogId}`;
      counts[teamId][key] = (counts[teamId][key] ?? 0) + 1;
    });
    return Object.entries(counts).map(([teamId, catalogs]) => ({
      teamLabel: teamsMap[teamId]?.label ?? "לא ידוע",
      items: Object.entries(catalogs).map(([catalogId, count]) => ({
        label: catalogMap[catalogId]?.label ?? "לא ידוע",
        count,
      })),
    }));
  }, [serialized, catalogMap, fightersMap, teamsMap]);

  const serializedByTeam = useMemo(() => {
    const counts: Record<string, number> = {};
    (serialized as SerializedGearFighter[]).forEach((item) => {
      const fighter = fightersMap[item.fighterId]?.value;
      const teamId = fighter?.teamId;
      if (!teamId) return;
      counts[teamId] = (counts[teamId] ?? 0) + 1;
    });
    return Object.entries(counts).map(([teamId, count]) => ({
      label: teamsMap[teamId]?.label ?? "לא ידוע",
      count,
    }));
  }, [serialized, fightersMap, teamsMap]);

  const logisticByTeam = useMemo(() => {
    const counts: Record<string, number> = {};
    (logistic as LogisticGear[]).forEach((item) => {
      counts[item.teamId] = (counts[item.teamId] ?? 0) + (item.quantity ?? 0);
    });
    return Object.entries(counts).map(([teamId, count]) => ({
      label: teamsMap[teamId]?.label ?? "לא ידוע",
      count,
    }));
  }, [logistic, teamsMap]);

  const totalSerialized = (serialized as SerializedGearFighter[]).length;
  const totalLogisticItems = (logistic as LogisticGear[]).length;
  const totalLogisticQuantity = (logistic as LogisticGear[]).reduce((sum, item) => sum + (item.quantity ?? 0), 0);

  if (serializedLoading || logisticLoading) {
    return <div>טוען נתוני ציוד...</div>;
  }

  if (serializedError) {
    return <div>שגיאה בטעינת ציוד סדרתי: {(serializedErr as Error)?.message}</div>;
  }

  if (logisticError) {
    return <div>שגיאה בטעינת ציוד לוגיסטי: {(logisticErr as Error)?.message}</div>;
  }

  return (
    <div className="mx-4 flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>סיכום ציוד סדרתי</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-lg font-semibold">סה"כ פריטים משויכים: {totalSerialized}</div>
            <div className="space-y-2">
              <div className="text-sm font-semibold">סיכום לפי קטלוג וצוות</div>
              <div className="space-y-2">
                {serializedByCatalog.length === 0 ? (
                  <p className="text-muted-foreground text-sm">אין נתונים</p>
                ) : (
                  serializedByCatalog.map((teamRow) => (
                    <div key={teamRow.teamLabel} className="pl-2 border-l">
                      <div className="font-semibold text-sm">{teamRow.teamLabel}</div>
                      <ul className="space-y-1 text-sm pl-2">
                        {teamRow.items.map((item) => (
                          <li key={item.label} className="flex justify-between">
                            <span>{item.label}</span>
                            <span className="font-semibold">{item.count}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-semibold">סיכום לפי צוות</div>
              <ul className="space-y-1 text-sm">
                {serializedByTeam.length === 0 ? (
                  <li className="text-muted-foreground">אין נתונים</li>
                ) : (
                  serializedByTeam.map((row) => (
                    <li key={row.label} className="flex justify-between">
                      <span>{row.label}</span>
                      <span className="font-semibold">{row.count}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>סיכום ציוד לוגיסטי</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-lg font-semibold">סה"כ רשומות: {totalLogisticItems}</div>
            <div className="text-sm">סה"כ כמות מדווחת: {totalLogisticQuantity}</div>
            <div className="space-y-2">
              <div className="text-sm font-semibold">סיכום לפי צוות</div>
              <ul className="space-y-1 text-sm">
                {logisticByTeam.length === 0 ? (
                  <li className="text-muted-foreground">אין נתונים</li>
                ) : (
                  logisticByTeam.map((row) => (
                    <li key={row.label} className="flex justify-between">
                      <span>{row.label}</span>
                      <span className="font-semibold">{row.count}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export const Route = createFileRoute("/(app)/gear/")({
  component: GearOverviewPage,
  loader: () =>
    Promise.all([
      queryClient.ensureQueryData(serializedGearQueryOptions),
      queryClient.ensureQueryData(gearCatalogQueryOptions),
      queryClient.ensureQueryData(logisticGearQueryOptions),
    ]),
  pendingComponent: RoutePending,
});
