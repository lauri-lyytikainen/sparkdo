import { Doc } from "@/convex/_generated/dataModel";
import { Checkbox } from "../ui/checkbox";
type Task = Doc<"tasks">;
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Calendar } from "lucide-react";
import { formatTaskDateAndTime } from "@/utils/date-utils";

export default function TaskComponent({ task }: { task: Task }) {
  const completeTaskMutation = useMutation(api.tasks.completeTask);
  const uncompleteTaskMutation = useMutation(api.tasks.uncompleteTask);

  function handleCheckboxChange() {
    if (task.isCompleted) {
      uncompleteTaskMutation({ taskId: task._id });
    } else {
      completeTaskMutation({ taskId: task._id });
    }
  }
  return (
    <div className="rounded p-2 my-2 flex gap-4 items-center border-b">
      <Checkbox checked={task.isCompleted} onClick={handleCheckboxChange} />
      <div className="flex-col justify-between items-center">
        <h2 className="text-lg font-semibold">
          {task.title}
        </h2>
        <p className="text-sm">
          {task.description}
        </p>
        {task.dueDate && (
          <div className="flex gap-1 items-center">
            <Calendar className="w-4" />
            <p className="text-sm">
              {formatTaskDateAndTime(task.dueDate, task.dueTime)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
