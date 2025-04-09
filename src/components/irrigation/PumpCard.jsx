import React from "react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarPlus } from "lucide-react";
import { getStatusInfo } from "@/utils/getStatusInfo";
import { useOutputDevice } from "@/hooks/useOutputDevice";
import { useCabinetContext } from "@/context/CabinetContext";

export function PumpCard({ pump, onUpdatePump, onOpenScheduleModal }) {
  const { firstCabinet } = useCabinetContext();
  const containerId = firstCabinet?.id;
  const { toggleDevice, isUpdating } = useOutputDevice(containerId);

  if (!pump) return null;

  const handleModeChange = (newMode) => {
    // Update local UI state
    onUpdatePump(pump.id, { mode: newMode });

    // TODO: If you want to save mode changes to RTDB, add that here
    // This would require a new function in your realtimeService.js
  };

  const handleManualToggle = async (isChecked) => {
    // Update UI immediately for responsive feel
    onUpdatePump(pump.id, { manualState: isChecked });

    // Update the actual device in RTDB
    try {
      const newStatus = await toggleDevice(pump.id);

      // If the update was unsuccessful, revert the UI
      if (newStatus === null) {
        // Revert the UI change
        onUpdatePump(pump.id, { manualState: !isChecked });
      } else {
        // Ensure UI state matches the actual state returned from the server
        onUpdatePump(pump.id, { manualState: newStatus === "active" });
      }
    } catch (error) {
      // On error, revert the UI change
      onUpdatePump(pump.id, { manualState: !isChecked });
      console.error("Failed to update device status:", error);
    }
  };

  const statusInfo = getStatusInfo(pump);

  return (
    <Card className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
      {/* Rest of your component stays the same */}
      {/* Pump Info */}
      <div>
        <CardTitle className="font-semibold text-gray-800">
          {pump.name}
        </CardTitle>
        <CardDescription className="text-sm text-gray-500 pump-status mt-2">
          Status:{" "}
          {pump.mode === "Manual"
            ? `${statusInfo.text} (Manual)`
            : `${statusInfo.text}${
                pump.schedule
                  ? ` (${pump.schedule.start} - ${pump.schedule.end})`
                  : " (No Schedule)"
              }`}
        </CardDescription>
      </div>

      {/* Controls Container */}
      <div className="flex flex-col items-start space-y-4 mx-8 mb-4">
        {/* Mode Selector */}
        <div className="w-full">
          <Label className="text-sm font-medium text-gray-600 mb-2 block">
            Mode:
          </Label>
          <RadioGroup
            defaultValue={pump.mode}
            onValueChange={handleModeChange}
            className="flex items-center space-x-2"
            aria-label={`Mode for ${pump.name}`}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="Manual"
                id={`${pump.id}-manual`}
                className="peer sr-only"
                disabled={isUpdating}
              />
              <Label
                htmlFor={`${pump.id}-manual`}
                className={`px-3 py-1 text-sm rounded-md cursor-pointer ${
                  isUpdating ? "opacity-50 " : ""
                }${
                  pump.mode === "Manual"
                    ? "bg-blue-500 text-white ring-2 ring-blue-500 ring-offset-1"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Manual
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="Auto"
                id={`${pump.id}-auto`}
                className="peer sr-only"
                disabled={isUpdating}
              />
              <Label
                htmlFor={`${pump.id}-auto`}
                className={`px-3 py-1 text-sm rounded-md cursor-pointer ${
                  isUpdating ? "opacity-50 " : ""
                }${
                  pump.mode === "Auto"
                    ? "bg-blue-500 text-white ring-2 ring-blue-500 ring-offset-1"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Auto
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Mode-specific Controls */}
        <div className="pump-controls w-full">
          {pump.mode === "Manual" ? (
            <div className="manual-controls flex items-center space-x-2 mt-1">
              <Label
                htmlFor={`toggle-${pump.id}`}
                className="text-sm font-medium text-gray-600"
              >
                State:
              </Label>
              <Switch
                id={`toggle-${pump.id}`}
                checked={pump.manualState}
                onCheckedChange={handleManualToggle}
                aria-label={`Toggle ${pump.name} manually`}
                disabled={isUpdating}
              />
              <span
                className={`manual-state-text text-sm font-medium ${
                  statusInfo.colorClass
                } ${isUpdating ? "opacity-50" : ""}`}
              >
                {isUpdating ? "" : statusInfo.text}
              </span>
            </div>
          ) : (
            <div className="auto-controls flex items-center space-x-2 mt-1">
              <span
                className="text-sm text-gray-600 schedule-display truncate"
                title={
                  pump.schedule
                    ? `ON ${pump.schedule.start} - ${pump.schedule.end}`
                    : "Not Set"
                }
              >
                {pump.schedule
                  ? `ON ${pump.schedule.start}-${pump.schedule.end}`
                  : "Schedule: Not Set"}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onOpenScheduleModal(pump.id)}
                className="px-2 py-1 text-sm rounded-md bg-green-500 text-white hover:bg-green-600 flex items-center"
                disabled={isUpdating}
              >
                <CalendarPlus className="mr-1 h-4 w-4" />
                Edit
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
