import { Card, CardContent } from "@/components/ui/card";
import { AreaHeader } from "./AreaHeader";
import { AreaStats } from "./AreaStats";

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
