import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export function AddAreaButton() {
  return (
    <Button variant="outline">
      <PlusCircle className="mr-2 h-4 w-4" />
      Add Area
    </Button>
  );
}
