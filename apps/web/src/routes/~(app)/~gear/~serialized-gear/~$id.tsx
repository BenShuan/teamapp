"use client";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import RoutePending from "@/web/components/route-pending";
import queryClient from "@/web/lib/query-client";
import { serializedGearItemQueryOptions } from "@/web/services/serializedGear.api";
import SerializedGearForm from "./components/SerializedGearForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/web/components/ui/card";
import { useSerializedGear } from "@/web/hooks/useSerializedGear";

const SerializedGearEditPage = () => {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useSerializedGear(id);

  if (isLoading) return <div>טוען פריט...</div>;
  if (isError) return <div>שגיאה בטעינה: {(error as Error)?.message}</div>;

  return (
    <div className="mx-4 flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>עריכת ציוד סדרתי</CardTitle>
        </CardHeader>
        <CardContent>
          <SerializedGearForm gear={data as any} onCreated={() => navigate({to:".."})} />
        </CardContent>
      </Card>
    </div>
  );
};

export const Route = createFileRoute("/(app)/gear/serialized-gear/$id")({
  component: SerializedGearEditPage,
  loader: ({ params }) => queryClient.ensureQueryData(serializedGearItemQueryOptions(params.id)),
  pendingComponent: RoutePending,
});
