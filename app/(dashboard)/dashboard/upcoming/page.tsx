"use client";

import { useTaskContext } from "@/components/dashboard/task-provider";
import { Doc } from "@/convex/_generated/dataModel";
type Task = Doc<"tasks">;
import TaskComponent from "@/components/dashboard/task-component";
import NewTaskButton from "@/components/dashboard/new-task-button";

export default function Upcoming() {
  const { upcomingTasks, isLoading } = useTaskContext();
  return (
    <div>
      <h1 className="text-2xl font-bold my-2">Upcoming</h1>
      {!isLoading && (
        upcomingTasks?.map((task: Task) => (
          <TaskComponent task={task} key={task._id} />
        ))
      )}
      <NewTaskButton />
    </div>
  );
}
