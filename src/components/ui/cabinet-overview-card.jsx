import React from "react"; // Add this import
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function CabinetOverviewCard({ title, icon, number, className }) {
  return (
    <Card
      className={cn(
        "overflow-hidden transition-all hover:shadow-md",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        {/* Title - now larger and on the left */}
        <h3 className="font-medium text-xl">{title}</h3>

        {/* Icon - moved to the right and larger */}
        <div className="flex h-10 w-10 items-center justify-center rounded-md">
          {/* Use the icon directly without cloneElement */}
          {icon &&
            React.cloneElement(icon, { className: "h-8 w-8 text-primary" })}
        </div>
      </CardHeader>

      <CardContent>
        {/* Number display */}
        <div className="text-5xl font-bold">{number}</div>
      </CardContent>
    </Card>
  );
}
