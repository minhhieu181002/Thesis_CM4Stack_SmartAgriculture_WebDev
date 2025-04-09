import React from "react";
import { BarChart3, Droplets, Gauge, Sprout } from "lucide-react";
import { CabinetOverviewCard } from "@/components/ui/cabinet-overview-card";
import { SensorsDisplay } from "@/components/ui/sensors-display";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useUserCabinetStats } from "@/hooks/useUserCabinetStats";
function Dashboard() {
  const { stats, loading, error } = useUserCabinetStats();
  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        Loading cabinet data...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-64">
        Error: {error}
      </div>
    );
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Cabinet</h1>

      {/* Cabinet Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <CabinetOverviewCard
          title="Areas"
          icon={<BarChart3 className="h-8 w-8 text-primary" />}
          number={stats.numOfArea}
        />
        <CabinetOverviewCard
          title="Sensors"
          icon={<Gauge className="h-8 w-8 text-primary" />}
          number={stats.numOfSensor}
        />
        <CabinetOverviewCard
          title="Devices"
          icon={<Droplets className="h-8 w-8 text-primary" />}
          number={stats.numOfDevice}
        />
        <CabinetOverviewCard
          title="Plants"
          icon={<Sprout className="h-8 w-8 text-primary" />}
          number={stats.numOfPlant}
        />
      </div>

      {/* Sensors and Tasks Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sensors component (2/3 width on large screens) */}
        <div className="w-full lg:w-3/5">
          <SensorsDisplay />
        </div>

        {/* Upcoming Tasks component (1/3 width on large screens) */}
        <div className="w-full lg:w-2/5">
          <h2 className="text-2xl font-bold mb-4">Upcoming Tasks</h2>
          <Card>
            <CardContent>
              <p className="text-muted-foreground">No upcoming tasks</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
