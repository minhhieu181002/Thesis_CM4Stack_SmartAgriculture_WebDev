import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateSchedulerComplete } from "@/services/firestore-services";
import { useCabinetContext } from "@/context/cabinet-context";
export function ScheduleModal({ isOpen, onClose, pumpToEdit, onSaveSchedule }) {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [date, setDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { firstCabinet } = useCabinetContext();
  // Reset form when pump changes
  useEffect(() => {
    if (pumpToEdit?.schedule) {
      // Extract existing schedule data
      setStartTime(pumpToEdit.schedule.start || "");
      setEndTime(pumpToEdit.schedule.end || "");

      // If the schedule has a date, use it, otherwise default to today
      if (pumpToEdit.schedule.date) {
        setDate(new Date(pumpToEdit.schedule.date));
      } else {
        setDate(new Date());
      }
    } else {
      // Default values for new schedule
      setStartTime("");
      setEndTime("");
      setDate(new Date());
    }
  }, [pumpToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pumpToEdit || !startTime || !endTime) return;

    if (endTime <= startTime) {
      alert("End time must be after start time.");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Format the date as ISO string for storage
      const formattedDate = format(date, "yyyy-MM-dd");

      // Prepare schedule data
      const scheduleData = {
        startTime, // Keep original format for database (HH:MM)
        endTime, // Keep original format for database (HH:MM)
        date: formattedDate,
      };

      // Get the scheduler ID (if it exists)
      const schedulerId = pumpToEdit.schedulerId || `schedule_${pumpToEdit.id}`;
      const deviceId = pumpToEdit.id;
      const containerId = firstCabinet?.id;

      if (!containerId) {
        throw new Error("No cabinet selected");
      }
      console.log(scheduleData);
      // Update both databases using our combined method
      const success = await updateSchedulerComplete(
        containerId,
        schedulerId,
        deviceId,
        scheduleData
      );

      if (success) {
        // Pass formatted data to the parent component for UI update
        onSaveSchedule(pumpToEdit.id, {
          startTime: formatTimeDisplay(startTime),
          endTime: formatTimeDisplay(endTime),
          date: formattedDate,
          schedulerId: schedulerId,
        });

        // Close the modal
        onClose();
      } else {
        alert("Failed to update schedule. Please try again.");
      }
    } catch (error) {
      console.error("Error updating schedule:", error);
      alert("Error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDateSelect = (newDate) => {
    console.log("Date Selected: ", newDate);
    if (newDate) {
      setDate(newDate);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Edit Schedule for {pumpToEdit?.name || "Pump"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* Date Selector */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <div className="col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    initialFocus
                    disabled={{ before: new Date() }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Start Time */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startTime" className="text-right">
              Start Time
            </Label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="col-span-3"
              required
            />
          </div>

          {/* End Time */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endTime" className="text-right">
              End Time
            </Label>
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="col-span-3"
              required
            />
          </div>

          {/* Schedule Summary */}
          <div className="bg-blue-50 p-3 rounded-md mt-2">
            <p className="text-sm text-center text-blue-700">
              {date && startTime && endTime ? (
                <>
                  Irrigation scheduled for {format(date, "PPP")}
                  <br />
                  from {formatTimeDisplay(startTime)} to{" "}
                  {formatTimeDisplay(endTime)}
                </>
              ) : (
                "Please select date and time to see schedule summary"
              )}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Schedule</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to display time in a more readable format
function formatTimeDisplay(timeString) {
  if (!timeString) return "";

  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours, 10);

  if (hour === 0) {
    return `12:${minutes} AM`;
  } else if (hour < 12) {
    return `${hour}:${minutes} AM`;
  } else if (hour === 12) {
    return `12:${minutes} PM`;
  } else {
    return `${hour - 12}:${minutes} PM`;
  }
}
