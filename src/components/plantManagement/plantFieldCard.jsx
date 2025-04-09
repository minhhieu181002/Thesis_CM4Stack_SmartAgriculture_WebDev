import { Card, CardContent } from "@/components/ui/card";
import { PlantFieldHeader } from "./plantFieldHeader";
import { PlantDetails } from "./plantDetails";
import { SwipeableButton } from "react-swipeable-button";

export function PlantFieldCard({ plantName, lastUpdated, status, image }) {
  const onSuccess = () => {
    console.log("Successfully Swiped!");
  };
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
        <div className="w-full max-w-md mx-auto px-0 py-2 bg-white">
          <SwipeableButton
            onSuccess={onSuccess} //callback function
            text="Slide to harvest" //string
            text_unlocked="yeee" //string
            color="#16362d" //css hex color
            width={200}
          />
        </div>
      </CardContent>
    </Card>
  );
}
