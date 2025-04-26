import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskItem } from "./task-item";
import { useScheduledTasks } from "@/hooks/useScheduledTasks";

function UpcomingTasks() {
  const { tasks, loading, error } = useScheduledTasks();

  return (
    <>
      <Card>
        <CardContent className="p-4">
          {loading && <p className="text-muted-foreground">Loading tasks...</p>}

          {error && (
            <p className="text-red-500">Error loading tasks: {error.message}</p>
          )}

          {!loading && !error && tasks.length === 0 && (
            <p className="text-muted-foreground">No upcoming tasks</p>
          )}

          {!loading && !error && tasks.length > 0 && (
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default UpcomingTasks;
