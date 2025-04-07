import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PumpCard } from "./PumpCard";

export function AreaView({
  areaName,
  pumpsInArea,
  onUpdatePump,
  onOpenScheduleModal,
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        {areaName} Pumps
      </h2>
      {pumpsInArea.length > 0 ? (
        pumpsInArea.map((pump) => (
          <PumpCard
            key={pump.id}
            pump={pump}
            onUpdatePump={onUpdatePump}
            onOpenScheduleModal={onOpenScheduleModal}
          />
        ))
      ) : (
        <Card className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <CardContent>
            <p className="text-gray-500">
              No pumps configured for this area yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
