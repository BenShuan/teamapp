"use client";

import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/web/components/ui/card";
import { Button } from "@/web/components/ui/button";
import type { StatusLocation, Team } from "@teamapp/api/schema";
import { cn } from "@/web/lib/utils";
import { attendnanceColorMap } from "../~attendance/components/AttendanceCell";

interface TeamCardProps {
  team: Team;
  attendance: Record<StatusLocation, number>;
  serializedGear: number;
  logisticQuantity: number;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  attendance,
  serializedGear,
}) => {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">{team.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <div className="space-y-2 text-sm">
          <div className="text-muted-foreground">נוכחויות היום</div>
          <ul className="space-y-1">
            {attendance && Object.entries(attendance).length > 0 ? (
              Object.entries(attendance).map(([status, count]) => (
                <li key={status} className={cn("flex px-4 py-1 rounded-2xl items-center justify-between ", attendnanceColorMap[status as StatusLocation])}>
                  <span>{status}</span>
                  <span className="font-semibold">{count}</span>
                </li>
              ))
            ) : (
              <li className="text-muted-foreground">אין נתונים</li>
            )}
          </ul>
          <div className="border-t my-2" />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">צל"ם צוותי</span>
            <span className="font-semibold">{serializedGear}</span>
          </div>

        </div>
        <div className="flex gap-2 pt-2">
          <Button asChild size="sm" variant="outline" className="flex-1">
            <Link href={`/teams/${team.id}`}>לצוות</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamCard;
