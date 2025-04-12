import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { ConnectCabinetDialog } from "@/components/connect-cabinet-dialog";
import { UserAuth } from "@/context/auth-context";
export function EmptyDashboard() {
  // create state to manage the dialog open state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  //   const [userProfile, setUserProfile] = UserAuth();

  // handle successful connection of a cabinet
  const handleCabinetConnected = async (containerId) => {
    console.log(`Cabinet connected with ID: ${containerId}`);
    window.location.reload();
  };
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] p-8">
      <div className="text-center max-w-md mx-auto space-y-6">
        <div className="bg-gray-100 rounded-full p-4 mx-auto w-20 h-20 flex items-center justify-center">
          <PlusCircle className="w-10 h-10 text-gray-400" />
        </div>

        <h2 className="text-2xl font-semibold text-gray-800">
          Welcome to Your Green Farm
        </h2>

        <p className="text-gray-600">
          Get started by adding your first container to monitor and control your
          plants.
        </p>

        <Button
          onClick={() => setIsDialogOpen(true)}
          variant="outline"
          className="text-black px-6 py-2 rounded-md flex items-center gap-2 mx-auto"
          size="lg"
        >
          <PlusCircle className="w-5 h-5" />
          Add Your First Container
        </Button>

        <p className="text-sm text-gray-500">
          Adding a container allows you to manage areas, monitor plants, and
          control devices.
        </p>
      </div>
      <ConnectCabinetDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={handleCabinetConnected}
      />
    </div>
  );
}
