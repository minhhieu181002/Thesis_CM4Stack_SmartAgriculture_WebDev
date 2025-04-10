import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Thermometer, Droplets, SunMedium, Leaf } from "lucide-react";

// Mock sensors for display purposes
const mockSensors = [
  {
    type: "Temperature",
    unit: "°C",
    icon: Thermometer,
    currentAvg: 24.5,
  },
  {
    type: "Humidity",
    unit: "%",
    icon: Droplets,
    currentAvg: 65,
  },
  {
    type: "Soil Nutrients",
    unit: "ppm",
    icon: Leaf,
    currentAvg: { kali: 45, nito: 30, phospho: 25 },
  },
];

function ThresholdSettingsDialog({ open, onOpenChange }) {
  // Function to render sensor icon
  const getSensorIcon = (SensorIconComponent) => {
    if (SensorIconComponent) {
      return (
        <SensorIconComponent className="h-5 w-5 mr-2 text-muted-foreground" />
      );
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="lg:max-w-lg">
        <DialogHeader>
          <DialogTitle>Threshold Settings</DialogTitle>
          <DialogDescription>
            Configure the desired sensor ranges for this area.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto p-1 pr-4 space-y-6">
          {mockSensors.map((sensor) => {
            const SensorIcon = sensor.icon;

            return (
              <div
                key={sensor.type}
                className="border p-4 rounded-lg bg-background shadow-sm"
              >
                <div className="flex items-center mb-3">
                  {getSensorIcon(SensorIcon)}
                  <h3 className="text-lg font-medium">{sensor.type}</h3>
                </div>

                {/* Current reading display */}
                {sensor.currentAvg !== undefined &&
                  typeof sensor.currentAvg !== "object" && (
                    <p className="text-sm text-muted-foreground mb-3">
                      Current Average Reading: {sensor.currentAvg} {sensor.unit}
                    </p>
                  )}

                {/* Soil nutrient display */}
                {sensor.type === "Soil Nutrients" && (
                  <p className="text-sm text-muted-foreground mb-3">
                    Current Avg: K: {sensor.currentAvg.kali}
                    {sensor.unit}, N: {sensor.currentAvg.nito}
                    {sensor.unit}, P: {sensor.currentAvg.phospho}
                    {sensor.unit}
                  </p>
                )}

                {/* Regular sensor inputs */}
                {sensor.type !== "Soil Nutrients" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                    <div className="space-y-1">
                      <Label htmlFor={`${sensor.type}-min`}>
                        Min ({sensor.unit})
                      </Label>
                      <Input
                        id={`${sensor.type}-min`}
                        type="number"
                        step="any"
                        placeholder="Enter minimum value"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`${sensor.type}-max`}>
                        Max ({sensor.unit})
                      </Label>
                      <Input
                        id={`${sensor.type}-max`}
                        type="number"
                        step="any"
                        placeholder="Enter maximum value"
                      />
                    </div>
                  </div>
                )}

                {/* Soil nutrient inputs */}
                {sensor.type === "Soil Nutrients" && (
                  <div className="space-y-4 mt-2 pl-2 border-l-2">
                    {Object.entries({
                      Kali: "kali",
                      Nito: "nito",
                      Phospho: "phospho",
                    }).map(([nutrientName, nutrientKey]) => (
                      <div key={nutrientKey} className="mb-3">
                        <Label className="font-medium text-sm mb-2 block">
                          {nutrientName} ({sensor.unit})
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label
                              htmlFor={`${sensor.type}-${nutrientKey}-min`}
                              className="text-xs"
                            >
                              Min
                            </Label>
                            <Input
                              id={`${sensor.type}-${nutrientKey}-min`}
                              type="number"
                              step="any"
                              placeholder="Enter minimum"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label
                              htmlFor={`${sensor.type}-${nutrientKey}-max`}
                              className="text-xs"
                            >
                              Max
                            </Label>
                            <Input
                              id={`${sensor.type}-${nutrientKey}-max`}
                              type="number"
                              step="any"
                              placeholder="Enter maximum"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <DialogFooter className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ThresholdSettingsDialog;
