"use client"
import FighterItem from "./FighterItem";
import { Fighter } from "@teamapp/api/schema";
import { useFighters } from "@/web/hooks/useFighter";

const FightersList = () => {
  const { data, isLoading, isError, error } = useFighters();

  if (isLoading) return <div>Loading fighters…</div>;
  if (isError) return <div>Failed to load: {(error as Error)?.message}</div>;

  const items = (data ?? []) as Fighter[];

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="text-muted-foreground">לא נמצאו לוחמים.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((fighter) => (
            <FighterItem key={fighter.id} fighter={fighter} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FightersList;

