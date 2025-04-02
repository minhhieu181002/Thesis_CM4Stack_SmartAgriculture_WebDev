import { Clock } from "lucide-react";

export function PlantDetails({ lastUpdated }) {
  return (
    <div className="flex items-center gap-1 text-sm text-muted-foreground">
      <Clock className="h-3.5 w-3.5" />
      <span>Last updated {lastUpdated}</span>
    </div>
  );
}
