"use client";

import { useTaskContext } from "@/components/dashboard/task-provider";
import { Doc } from "@/convex/_generated/dataModel";
type Task = Doc<"tasks">;
import TaskComponent from "@/components/dashboard/task-component";

export default function Completed() {
  const { completedTasks, isLoading } = useTaskContext();
  return (
    <div>
      <h1 className="text-2xl font-bold my-2">Completed</h1>
      {!isLoading && (
        completedTasks?.map((task: Task) => (
          <TaskComponent task={task} key={task._id} />
        ))
      )}
    </div>
  );
}
