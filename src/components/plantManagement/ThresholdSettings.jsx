import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Droplets, Thermometer, Sun } from "lucide-react";

export function ThresholdSettings() {
  return (
    <>
      <div className="mb-20">
        <h2 className="text-2xl font-bold">Threshold Setting</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Threshold Settings</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Temperature Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-orange-500" />
                <Label htmlFor="temperature" className="font-medium">
                  Temperature
                </Label>
              </div>
              <span className="text-sm text-muted-foreground">22°C</span>
            </div>
            <div className="space-y-2">
              <Slider
                id="temperature"
                defaultValue={[22]}
                max={35}
                min={15}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Min: 18°C</span>
                <span>Max: 28°C</span>
              </div>
            </div>
          </div>

          {/* Humidity Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <Label htmlFor="humidity" className="font-medium">
                  Humidity
                </Label>
              </div>
              <span className="text-sm text-muted-foreground">65%</span>
            </div>
            <div className="space-y-2">
              <Slider
                id="humidity"
                defaultValue={[65]}
                max={100}
                min={20}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Min: 40%</span>
                <span>Max: 80%</span>
              </div>
            </div>
          </div>

          {/* Light Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-yellow-500" />
                <Label htmlFor="light" className="font-medium">
                  Light Exposure
                </Label>
              </div>
              <span className="text-sm text-muted-foreground">75%</span>
            </div>
            <div className="space-y-2">
              <Slider
                id="light"
                defaultValue={[75]}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
