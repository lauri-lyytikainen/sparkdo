"use client";

import { useTaskContext } from "@/components/dashboard/task-provider";
import { Doc } from "@/convex/_generated/dataModel";
type Task = Doc<"tasks">;
import TaskComponent from "@/components/dashboard/task-component";
import NewTaskButton from "@/components/dashboard/new-task-button";

export default function Today() {
  const { todayTasks, isLoading } = useTaskContext();
  return (
    <div>
      <h1 className="text-2xl font-bold my-2">Today</h1>
      {!isLoading && (
        todayTasks?.map((task: Task) => (
          <TaskComponent task={task} key={task._id} />
        ))
      )}
      <NewTaskButton />
    </div>
  );
}
