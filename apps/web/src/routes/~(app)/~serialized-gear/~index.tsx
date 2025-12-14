import { createFileRoute } from "@tanstack/react-router";

import RoutePending from "@/web/components/route-pending";
import queryClient from "@/web/lib/query-client";
import { serializedGearQueryOptions } from "../../../services/serializedGear.api";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/web/components/ui/dialog";
import SerializedGearTable from "./components/SerializedGearTable";
import SerializedGearForm from "./components/SerializedGearForm";
import { Button } from "@/web/components/ui/button";
import { useState } from "react";

const SerializedGearPage = () => {
  const [openForm, setOpenForm] = useState(false)
  return (
    <div className="mx-4 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">ציוד סדרתי</h1>
        <Dialog open={openForm} onOpenChange={setOpenForm}>
          <DialogTrigger asChild>
            <Button>הוסף ציוד</Button>
          </DialogTrigger>
          <DialogContent
            dir="rtl"
            className="w-5/6 max-w-[800px] max-h-[80vh] overflow-y-scroll flex flex-col text-right"
          >
            <DialogTitle>הוסף ציוד</DialogTitle>
            <SerializedGearForm onCreated={() => setOpenForm(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <SerializedGearTable />
    </div>
  );
};

export default SerializedGearPage;

export const Route = createFileRoute("/(app)/serialized-gear/")({
  component: SerializedGearPage,
  loader: () => queryClient.ensureQueryData(serializedGearQueryOptions),
  pendingComponent: RoutePending,
});
