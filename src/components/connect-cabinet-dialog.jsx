import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import ConnectCabinetForm from "@/components/ui/connect-cabinet-form";

export function ConnectCabinetDialog({ open, onOpenChange, onSuccess }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Connect a Cabinet</DialogTitle>
        </DialogHeader>
        <ConnectCabinetForm
          onSuccess={(containerId) => {
            onSuccess(containerId);
            onOpenChange(false); // Close the dialog on success
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
