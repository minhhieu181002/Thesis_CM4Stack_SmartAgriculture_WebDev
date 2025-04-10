import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PlantFieldHeader } from "./plant-field-header";
import { PlantDetails } from "./plant-details";
import { SwipeableButton } from "react-swipeable-button";

export function PlantFieldCard({ plantName, lastUpdated, status, image }) {
  const onSuccess = () => {
    console.log("Successfully Swiped!");
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
            onSuccess={onSuccess}
            text="Slide to harvest"
            text_unlocked="Harvested!"
            color="#16362d"
            width={buttonWidth} // Use dynamic width
          />
        </div>
      </CardContent>
    </Card>
  );
}
