import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import AddPlantDialog from "./add-tree";
import ThresholdSettingsDialog from "./threshold-settings-dialog";

export function TitleSection() {
  const [showThresholdDialog, setShowThresholdDialog] = useState(false);

  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-2xl font-bold">Plant Fields</h2>
      <div>
        {/* Button that opens the dialog */}
        <Button
          variant="outline"
          className="mx-3"
          onClick={() => setShowThresholdDialog(true)}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Threshold Settings
        </Button>

        {/* Simplified dialog with just open state control */}
        <ThresholdSettingsDialog
          open={showThresholdDialog}
          onOpenChange={setShowThresholdDialog}
        />

        <AddPlantDialog />
      </div>
    </div>
  );
}
