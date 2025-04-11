// src/components/AddPlantDialog.jsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose, // Import DialogClose for the Cancel button
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { addPlant } from "@/services/firestore-services"; // Import your Firestore service
import { cn } from "@/lib/utils"; // For conditional classes
import { addDays, format } from "date-fns";
import { toast } from "sonner";
import { PlusCircle, Calendar as CalendarIcon, Loader2 } from "lucide-react";

// --- Mock Data ---
// Replace with your actual list of areas, fetched from context or props
// const availableAreas = [
//   { id: "area_01", name: "Mango Area" },
//   { id: "area_02", name: "Greenhouse Section A" },
//   { id: "area_03", name: "Herb Garden Bed 1" },
// ];

const plantCategories = [
  "Vegetable",
  "Fruit",
  "Herb",
  "Food Crop",
  "Industrial Tree",
];
// --- End Mock Data ---

/**
 * A dialog component for adding a new plant to a specific area.
 *
 * Props:
 * onPlantAdded: function(newPlantData) - Optional callback after successful addition.
 */
function AddPlantDialog({
  availableAreas = [],
  currentAreaId = "",
  onPlantAdded,
}) {
  // const { toast } = useToast();s
  const [open, setOpen] = useState(false); // Control dialog open state
  const [areaId, setAreaId] = useState(currentAreaId || ""); // Default to current area ID);
  const [plantName, setPlantName] = useState("Tomato");
  const [category, setCategory] = useState("vegetable");
  const [date, setDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({}); // For field validation errors
  const [datePopoverOpen, setDatePopoverOpen] = useState(false); // For date picker popover
  useEffect(() => {
    if (open && currentAreaId) {
      setAreaId(currentAreaId);
    }
  }, [open, currentAreaId]);
  // Reset form state when dialog closes
  useEffect(() => {
    if (!open) {
      setAreaId("");
      setPlantName("");
      setCategory("");
      setDate(new Date());
      setErrors({});
      setIsLoading(false);
    }
  }, [open]);

  // Basic Validation
  const validateForm = () => {
    const newErrors = {};
    if (!areaId) newErrors.areaId = "Please select an area.";
    if (!plantName.trim()) newErrors.plantName = "Plant name is required.";
    if (!category) newErrors.category = "Please select a category.";
    if (!date) newErrors.plantDate = "Please select a planting date.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      return; // Stop submission if validation fails
    }

    try {
      const newPlantData = {
        areaId,
        plantName: plantName.trim(),
        category,
        date,
      };
      // call the firestore service
      const plantId = await addPlant(newPlantData);

      if (onPlantAdded) {
        onPlantAdded(newPlantData); // Optional: Callback for parent component
      }
      toast.success(`${plantName} has been added to the selected area.`, {
        description: "Your plant was successfully created",
        duration: 5000,
      });

      // Callback for parent if needed
      if (onPlantAdded) {
        onPlantAdded({
          ...newPlantData,
          id: plantId,
        });
      }
      setOpen(false); // Close the dialog on success
    } catch (error) {
      console.error("Failed to add plant:", error);
      toast.error("Error adding plant", {
        description: error.message || "There was a problem adding the plant.",
        duration: 5000,
      });
      setIsLoading(false); // Ensure loading is stopped on error
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* This is the button provided in the prompt */}
        <Button variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Plant Field
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        {" "}
        {/* Adjust width if needed */}
        <DialogHeader>
          <DialogTitle>Add New Plant</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new plant to a designated area.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Area Selection */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="area" className="text-right">
                Area*
              </Label>
              <div className="col-span-3">
                <Select
                  value={areaId}
                  onValueChange={setAreaId}
                  disabled={isLoading}
                >
                  <SelectTrigger id="area">
                    <SelectValue placeholder="Select an area" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAreas.map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.areaId && (
                  <p className="text-sm text-red-500 mt-1">{errors.areaId}</p>
                )}
              </div>
            </div>

            {/* Plant Name Input */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="plantName" className="text-right">
                Plant Name*
              </Label>
              <div className="col-span-3">
                <Input
                  id="plantName"
                  value={plantName}
                  onChange={(e) => setPlantName(e.target.value)}
                  placeholder="e.g., Cherry Tomato"
                  disabled={isLoading}
                  className={errors.plantName ? "border-red-500" : ""}
                />
                {errors.plantName && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.plantName}
                  </p>
                )}
              </div>
            </div>

            {/* Category Selection */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category*
              </Label>
              <div className="col-span-3">
                <Select
                  value={category}
                  onValueChange={setCategory}
                  disabled={isLoading}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {plantCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500 mt-1">{errors.category}</p>
                )}
              </div>
            </div>

            {/* Date Planted Input */}
            {/* <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="plantDate" className="text-right">
                Date Planted*
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground",
                        errors.date && "border-red-500" // Highlight if error
                      )}
                      disabled={isLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Select
                      onValueChange={(value) =>
                        setDate(addDays(new Date(), parseInt(value)))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="0">Today</SelectItem>
                        <SelectItem value="1">Tomorrow</SelectItem>
                        <SelectItem value="3">In 3 days</SelectItem>
                        <SelectItem value="7">In a week</SelectItem>
                      </SelectContent>
                    </Select>
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={isLoading} // Also disable calendar when loading
                    />
                    {console.log(!date ? date : "no day is choosen")}
                  </PopoverContent>
                </Popover>
                {errors.plantDate && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.plantDate}
                  </p>
                )}
              </div>
            </div> */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="plantDate" className="text-right">
                Date Planted*
              </Label>
              <div className="col-span-3">
                <Popover
                  open={datePopoverOpen}
                  onOpenChange={setDatePopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground",
                        errors.date && "border-red-500" // Match error field name
                      )}
                      disabled={isLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Select
                      onValueChange={(value) => {
                        const newDate = addDays(new Date(), parseInt(value));
                        console.log("Setting date from quick select:", newDate);
                        setDate(newDate);
                        setDatePopoverOpen(false); // Close after selection
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="0">Today</SelectItem>
                        <SelectItem value="1">Tomorrow</SelectItem>
                        <SelectItem value="3">In 3 days</SelectItem>
                        <SelectItem value="7">In a week</SelectItem>
                      </SelectContent>
                    </Select>
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(newDate) => {
                        console.log("Calendar date selected:", newDate);
                        setDate(newDate);
                        setDatePopoverOpen(false); // Close popover after selection
                      }}
                      initialFocus
                      disabled={isLoading}
                    />
                  </PopoverContent>
                </Popover>
                {errors.date && ( // Match error field name
                  <p className="text-sm text-red-500 mt-1">{errors.date}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            {/* Add a Cancel button */}
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Plant"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddPlantDialog;
