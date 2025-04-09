import { Sprout, Cpu, Gauge } from "lucide-react";

export function AreaStats({ fields, devices, sensors }) {
  return (
    <div className="space-y-0.5 mt-1 mr-3">
      <div className="flex items-center gap-3 justify-between">
        <div className="flex items-center gap-2 p-2 rounded-md">
          <Sprout className="h-5 w-5" />
          <p className="text-sm text-muted-foreground">Plant Fields</p>
        </div>
        <div>
          <p className="text-xl font-bold">{fields}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 justify-between">
        <div className="flex items-center gap-2 p-2 rounded-md">
          <Cpu className="h-5 w-5" />
          <p className="text-sm text-muted-foreground">Devices</p>
        </div>
        <div>
          <p className="text-xl font-bold">{devices}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 justify-between">
        <div className="flex items-center gap-2 p-2 rounded-md">
          <Gauge className="h-5 w-5" />
          <p className="text-sm text-muted-foreground">Sensors</p>
        </div>
        <div>
          <p className="text-xl font-bold">{sensors}</p>
        </div>
      </div>
    </div>
  );
}
