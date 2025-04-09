import { Card, CardContent } from "@/components/ui/card";
import { AreaHeader } from "./area-header";
import { AreaStats } from "./area-stats";

export function AreaCard({ title, fields, devices, sensors }) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="py-0 px-5">
        <AreaHeader title={title} />
        <AreaStats fields={fields} devices={devices} sensors={sensors} />
      </CardContent>
    </Card>
  );
}
