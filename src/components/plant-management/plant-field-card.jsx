import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PlantFieldHeader } from "./plant-field-header";
import { PlantDetails } from "./plant-details";
import { SwipeableButton } from "react-swipeable-button";
import { toast } from "sonner";
import { deletePlant } from "@/services/firestore-services";
export function PlantFieldCard({
  id,
  plantName,
  lastUpdated,
  status,
  image,
  onDeleted,
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const handleSwipeSuccess = async () => {
    try {
      setIsDeleting(true);
      const success = await deletePlant(id);
      if (success && onDeleted) {
        // Only call onDeleted if deletion was successful
        onDeleted(id);
        toast.success(`${plantName} has been deleted`);
      }
    } catch (error) {
      toast.error("Failed to delete plant: " + error.message);
      console.error("Error deleting plant:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // console.log("Image: ", image);
  const containerRef = useRef(null);
  const [buttonWidth, setButtonWidth] = useState("100%");

  // Set button width based on container width
  useEffect(() => {
    if (containerRef.current) {
      // Update width when component mounts and on window resize
      const updateWidth = () => {
        const containerWidth = containerRef.current.offsetWidth;
        setButtonWidth(containerWidth); // Use container's width
      };

      updateWidth(); // Initial calculation

      window.addEventListener("resize", updateWidth);
      return () => window.removeEventListener("resize", updateWidth);
    }
  }, []);
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          {/* <div className="bg-green-50 p-2 rounded-full">{icon}</div> */}
          <PlantFieldHeader
            plantName={plantName}
            status={status}
            image={image}
          />
        </div>
        <PlantDetails lastUpdated={lastUpdated} />
        <div ref={containerRef} className="w-full px-0 py-2 bg-white">
          <SwipeableButton
            onSuccess={handleSwipeSuccess}
            text="Slide to harvest"
            text_unlocked="Harvested!"
            color="#e11d48"
            width={buttonWidth} // Use dynamic width
            disabled={isDeleting}
          />
        </div>
      </CardContent>
    </Card>
  );
}
