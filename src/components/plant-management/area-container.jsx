import { useState } from "react";
import { AreaCard } from "./area-card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { PlantFieldContainer } from "./plant-field-container";
export function AreaContainer({ areas = [] }) {
  const [activeTab, setActiveTab] = useState(
    areas.length > 0 ? areas[0].id : ""
  );
  // Get the current active area
  const activeArea = areas.find((area) => area.id === activeTab) || {};
  if (areas.length === 0) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No areas available. Create a new area to get started.
          </p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Tabs
      defaultValue={activeTab}
      onValueChange={setActiveTab}
      className="mb-2 "
    >
      <TabsList className="mb-2 p-2">
        {areas.map((area) => (
          <TabsTrigger key={area.id} value={area.id} className="px-8 py-4">
            {area.title}
          </TabsTrigger>
        ))}
      </TabsList>

      {areas.map((area) => (
        <TabsContent key={area.id} value={area.id}>
          <div className="pt-4 ml-2  ">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center">
                <span className="font-medium">Plant Fields:</span>
                <span className="ml-2">{area.fields}</span>
              </div>
              <div className="text-muted-foreground">|</div>
              <div className="flex items-center">
                <span className="font-medium">Devices:</span>
                <span className="ml-2">{area.devices}</span>
              </div>
              <div className="text-muted-foreground">|</div>
              <div className="flex items-center">
                <span className="font-medium">Sensors:</span>
                <span className="ml-2">{area.sensors}</span>
              </div>
            </div>
          </div>
        </TabsContent>
      ))}
      <PlantFieldContainer plantIds={activeArea.plantIds || []} />
    </Tabs>
  );
}
