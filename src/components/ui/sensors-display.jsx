import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Thermometer, Droplets, Leaf } from "lucide-react";
/**
 * Status indicator component showing a colored dot and status text
 */
function ActiveIndicator({ status }) {
  // Define color based on status
  const isActive = status.toLowerCase() === "active";

  return (
    <div className="flex items-center gap-2">
      {/* Colored dot indicator */}
      <div
        className={cn(
          "w-2.5 h-2.5 rounded-full",
          isActive ? "bg-green-500" : "bg-red-500"
        )}
      />

      {/* Status text */}
      <span
        className={cn(
          "text-sm font-medium",
          isActive ? "text-green-600" : "text-red-600"
        )}
      ></span>
    </div>
  );
}
function StatusIndicator({ status }) {
  const isNormal = status.toLowerCase() === "normal";

  return (
    <div className="flex items-center gap-2">
      <div className={cn(isNormal ? "bg-green-500" : "bg-red-500")} />
      <span className={cn(isNormal ? "text-green-600" : "text-red-600")}>
        {status}
      </span>
    </div>
  );
}
/**
 * Air Temperature section component
 */
function AirTempSection() {
  return (
    <Card className="bg-yellow-50 border-yellow-100">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Thermometer className="h-12 w-12" />
          <h3 className="font-medium text-lg">Air Temp</h3>
        </div>
        <ActiveIndicator status="active" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold ml-1">40°C</div>
        <div className="mt-1.5 italic">
          <StatusIndicator status="Warning" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Humidity section component
 */
function HumiditySection() {
  return (
    <Card className="bg-blue-50 border-blue-100">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Droplets className="h-12 w-12" />
          <h3 className="font-medium text-lg">Humidity</h3>
        </div>
        <ActiveIndicator status="active" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold mb ml-1">80%</div>
        <div className="mt-1.5 italic">
          <StatusIndicator status="normal" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Soil section component showing nutrient values
 */
function SoilSection() {
  return (
    <Card className="bg-green-50 border-green-100">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Leaf className="h-12 w-12 " />
          <h3 className="font-medium text-lg">Soil</h3>
        </div>
        <ActiveIndicator status="inactive" />
      </CardHeader>
      <CardContent>
        {/* Nutrient values with left alignment */}
        <div className="space-y-0.5">
          <div className="flex items-center">
            <div className="w-20">
              <div className="font-semibold text-gray-600">Nito</div>
            </div>
            <div className="text-2xl font-bold">10 PPM</div>
          </div>

          <div className="flex items-center">
            <div className="w-20">
              <div className="font-semibold text-gray-600">Kali</div>
            </div>
            <div className="text-2xl font-bold">15 PPM</div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20">
                <div className="font-semibold text-gray-600">Phospho</div>
              </div>
              <div className="text-2xl font-bold">9 PPM</div>
            </div>
            <div className="ml-4 italic">
              <StatusIndicator status="normal" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Area filter component using regular HTML select
 */
function AreaFilter() {
  return (
    <div className="flex items-center gap-3">
      <Label htmlFor="area-select" className="font-medium">
        Area:
      </Label>
      <select
        id="area-select"
        className="border rounded-md bg-background px-3 py-1.5"
        defaultValue="cabinet-1"
      >
        <option value="cabinet-1">Cabinet 1</option>
        <option value="cabinet-2">Cabinet 2</option>
        <option value="greenhouse-1">Greenhouse 1</option>
        <option value="outdoor">Outdoor</option>
      </select>
    </div>
  );
}

/**
 * Main Sensors component displaying Air Temp, Humidity, and Soil sections
 * in a two-column layout with an Area filter
 */
export function SensorsDisplay() {
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
        <h2 className="text-2xl font-bold">Sensors</h2>
        <AreaFilter />
      </div>
      <div className="bg-gray-100 border border-gray-300 rounded-lg p-6">
        {/* Two-column grid layout for sensor cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Row 1, Column 1: Air Temp */}
          <AirTempSection />

          {/* Row 1, Column 2: Humidity */}
          <HumiditySection />

          {/* Row 2, Column 1: Soil (spans only one column) */}
          <SoilSection />

          {/* Row 2, Column 2: Empty or could be used for another component */}
          {/* Left empty as per requirements */}
        </div>
      </div>
    </>
  );
}
