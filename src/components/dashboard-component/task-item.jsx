import React from "react";
import { DropletIcon, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TimeLeftIndicator } from "./time-left-indicator";

export function TaskItem({ task }) {
  return (
    <div className="flex items-start p-3 border-b border-gray-100 last:border-b-0 rounded-md hover:bg-gray-50">
      {/* Icon */}
      <div className="mt-1 mr-3">
        {task.icon || <DropletIcon className="h-6 w-6 text-blue-500" />}
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-gray-900">{task.title}</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-gray-500 hover:text-blue-600"
            onClick={task.onEdit}
          >
            <CalendarPlus className="h-3.5 w-3.5 mr-1" />
            Edit Time
          </Button>
        </div>
        <p className="text-sm text-gray-600">{task.subtitle}</p>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">{task.date}</span>
          <TimeLeftIndicator timeLeft={task.timeLeft} />
        </div>
      </div>
    </div>
  );
}
