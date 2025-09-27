"use client";

import { useTaskContext } from "@/components/dashboard/task-provider";
import { Doc } from "@/convex/_generated/dataModel";
type Task = Doc<"tasks">;
import TaskComponent from "@/components/dashboard/task-component";
import NewTaskButton from "@/components/dashboard/new-task-button";

export default function Unscheduled() {
  const { unscheduledTasks, isLoading } = useTaskContext();
  return (
    <div>
      <h1 className="text-2xl font-bold my-2">Unscheduled</h1>
      {!isLoading && (
        unscheduledTasks?.map((task: Task) => (
          <TaskComponent task={task} key={task._id} />
        ))
      )}
      {unscheduledTasks && unscheduledTasks.length === 0 && !isLoading && (
        <p className="my-4 text-gray-500">No unscheduled tasks!</p>
      )}
      <NewTaskButton />
    </div>
  );
}
