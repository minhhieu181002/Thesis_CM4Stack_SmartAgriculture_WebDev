import React, { useState } from "react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarPlus } from "lucide-react";
import { getStatusInfo } from "@/utils/getStatusInfo";
import { useOutputDevice } from "@/hooks/useOutputDevice";
import { useCabinetContext } from "@/context/cabinet-context";
import {
  updateOutputDeviceStatus,
  updateOutputDeviceControlMethod,
} from "@/services/firestore-services";

export function PumpCard({ pump, onUpdatePump, onOpenScheduleModal }) {
  const { firstCabinet } = useCabinetContext();
  const containerId = firstCabinet?.id;
  const { toggleDevice, isUpdating } = useOutputDevice(containerId);
  const [localIsUpdating, setLocalIsUpdating] = useState(false);

  // Don't render without pump data
  if (!pump) return null;

  // Use the current value directly from props
  const actualMode = pump.mode || "Manual";
  const statusInfo = getStatusInfo(pump);

  // Combined loading state to prevent multiple toggles
  const isDisabled = isUpdating || localIsUpdating;

  const handleModeChange = async (newMode) => {
    if (newMode === actualMode || isDisabled) return;

    setLocalIsUpdating(true);

    try {
      // First update the UI for responsiveness
      onUpdatePump(pump.id, { mode: newMode });

      // Then update Firestore
      await updateOutputDeviceControlMethod(pump.id, newMode);
    } catch (error) {
      console.error("Error updating control method:", error);
      // Revert UI on error
      onUpdatePump(pump.id, { mode: actualMode });
    } finally {
      setLocalIsUpdating(false);
    }
  };

  const handleManualToggle = async (isChecked) => {
    if (isDisabled) return;

    setLocalIsUpdating(true);

    // Store current values to revert if needed
    const originalMode = pump.mode;
    const originalState = pump.manualState;

    try {
      // 1. First ensure we're in Manual mode and update UI
      if (originalMode !== "Manual") {
        onUpdatePump(pump.id, {
          mode: "Manual",
          manualState: isChecked,
        });

        // Update the control method in Firestore
        await updateOutputDeviceControlMethod(pump.id, "Manual");
      } else {
        // Just update the manual state if already in Manual mode
        onUpdatePump(pump.id, { manualState: isChecked });
      }

      // 2. Now toggle the device in RTDB
      const newStatus = await toggleDevice(pump.id);

      // 3. Update Firestore to match RTDB
      if (newStatus !== null) {
        await updateOutputDeviceStatus(pump.id, newStatus);

        // 4. Final UI update with the actual status from server
        onUpdatePump(pump.id, {
          mode: "Manual", // Ensure we stay in Manual mode
          manualState: newStatus === "active",
        });
      }
    } catch (error) {
      console.error("Failed to update device status:", error);

      // Revert to original state on error
      onUpdatePump(pump.id, {
        mode: originalMode,
        manualState: originalState,
      });
    } finally {
      setLocalIsUpdating(false);
    }
  };

  return (
    <Card className="bg-gray-50 border border-gray-200 rounded-lg p-8">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="">
          <CardTitle className="font-semibold text-gray-800">
            {pump.name}
          </CardTitle>
          <CardDescription className="text-base text-gray-500 pump-status mt-2">
            Status:{" "}
            {pump.mode === "Manual" ? (
              `${statusInfo.text} (Manual)`
            ) : pump.schedule ? (
              <>
                {`${statusInfo.text} (Auto)`}
                {/* <span className="block mt-1">
                  <span className="ml-2">ON: {statusInfo.startTime}</span>
                  <br />
                  <span className="ml-2">OFF: {statusInfo.endTime}</span>
                </span> */}
              </>
            ) : (
              `${statusInfo.text}`
            )}
          </CardDescription>
        </div>

        <div className="">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="sm:w-1/2">
              <Label className="text-base font-medium text-gray-600 mb-2 block">
                Mode:
              </Label>
              <RadioGroup
                value={actualMode}
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

            {/* Horizontal Divider for mobile, Vertical for larger screens */}
            <div className="sm:hidden border-t border-gray-200 my-2"></div>
            <div className="hidden sm:block border-l border-gray-200 mx-2"></div>

            {/* Right Controls Column: Mode-specific Controls */}
            <div className="sm:w-1/2">
              <Label className="text-base font-medium text-gray-600 mb-2 block">
                {pump.mode === "Manual" ? (
                  <>
                    State:{" "}
                    <span
                      className={`manual-state-text text-2xl font-medium px-1.5 ${
                        statusInfo.colorClass
                      } ${isUpdating ? "opacity-50" : ""}`}
                    >
                      {isUpdating ? "" : statusInfo.text}
                    </span>
                  </>
                ) : (
                  "Schedule:"
                )}
              </Label>

              {pump.mode === "Manual" ? (
                <div className="manual-controls flex items-center space-x-2 py-8 px-2">
                  <Switch
                    id={`toggle-${pump.id}`}
                    checked={
                      pump.manualState === undefined ? false : pump.manualState
                    }
                    onCheckedChange={handleManualToggle}
                    aria-label={`Toggle ${pump.name} manually`}
                    disabled={isUpdating}
                    className="data-[state=checked]:bg-blue-500 h-16 w-32"
                    thumbClassName="h-8 w-8"
                  />
                </div>
              ) : (
                <>
                  <div className="auto-controls flex flex-col sm:flex-row items-start sm:items-center gap-3 py-3">
                    <div className="text-base text-gray-600 schedule-display flex-1">
                      {pump.schedule ? (
                        <div className="space-y-1">
                          <div className="font-medium flex items-center">
                            <span className="w-12 inline-block text-gray-500">
                              ON:
                            </span>
                            <span className="text-blue-600">
                              {pump.schedule.startTime}
                            </span>
                          </div>
                          <div className="font-medium flex items-center">
                            <span className="w-12 inline-block text-gray-500">
                              OFF:
                            </span>
                            <span className="text-blue-600">
                              {pump.schedule.endTime}
                            </span>
                          </div>
                          {pump.schedule.date && (
                            <div className="text-xs text-gray-500 mt-1">
                              Scheduled for {pump.schedule.date}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="italic text-gray-400">
                          No schedule set
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onOpenScheduleModal(pump.id)}
                    className="shrink-0 px-3 py-1 text-sm rounded-md bg-green-500 text-white hover:bg-green-600 flex items-center self-end sm:self-center"
                    disabled={isDisabled}
                  >
                    <CalendarPlus className="mr-1.5 h-4 w-4" />
                    {pump.schedule ? "Edit" : "Set"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
