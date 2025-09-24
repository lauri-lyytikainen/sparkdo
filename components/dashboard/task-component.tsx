import { Doc } from "@/convex/_generated/dataModel";
import { Checkbox } from "@/components/ui/checkbox";
type Task = Doc<"tasks">;
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Calendar, Pen, Sun, Trash } from "lucide-react";
import { formatTaskDateAndTime } from "@/utils/date-utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTaskContext } from "@/components/dashboard/task-provider";
import { NewTaskForm } from "@/components/dashboard/new-task-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function TaskComponent({ task, overdue }: { task: Task, overdue?: boolean }) {
  const completeTaskMutation = useMutation(api.tasks.completeTask);
  const uncompleteTaskMutation = useMutation(api.tasks.uncompleteTask);
  const { startEditing, stopEditing, isEditing } = useTaskContext();
  const deleteTaskMutation = useMutation(api.tasks.deleteTask);


  function handleCheckboxChange() {
    if (task.isCompleted) {
      uncompleteTaskMutation({ taskId: task._id });
    } else {
      completeTaskMutation({ taskId: task._id });
    }
  }

  function handleEditClick() {
    startEditing(task._id);
  }

  function handleCancelEdit() {
    stopEditing();
  }

  // If this task is being edited, show the form instead
  if (isEditing(task._id)) {
    return (
      <div className="my-2">
        <NewTaskForm
          editTask={task}
          isEditing={true}
          onCancel={handleCancelEdit}
        />
      </div>
    );
  }

  return (
    <div className="rounded p-2 my-2 flex gap-4 items-stretch border-b group">
      <Checkbox checked={task.isCompleted} onClick={handleCheckboxChange} className="mt-2" />
      <div className="flex-col justify-between items-center flex-1">
        <h2 className={`text-lg font-semibold ${overdue ? "text-red-500" : ""}`}>
          {task.title}
        </h2>
        <p className="text-sm">
          {task.description}
        </p>
        {task.dueDate && (
          <div className="flex gap-1 items-center">
            <Calendar className={`w-4 ${overdue ? "text-red-500" : ""}`} />
            <p className={`text-sm ${overdue ? "text-red-500" : ""}`}>
              {formatTaskDateAndTime(task.dueDate, task.dueTime)}
            </p>
          </div>
        )}
      </div>
      <div className="flex items-start h-full opacity-0 group-hover:opacity-100 transition-opacity">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size={"icon"} variant={"ghost"} onClick={handleEditClick}>
              <Pen />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Edit Task
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size={"icon"} variant={"ghost"}>
              <Sun />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Set Due Date
          </TooltipContent>
        </Tooltip>
        <AlertDialog>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertDialogTrigger asChild>
                <Button size={"icon"} variant={"ghost"}>
                  <Trash />
                </Button>
              </AlertDialogTrigger>
            </TooltipTrigger>
            <TooltipContent>
              Delete Task
            </TooltipContent>
          </Tooltip>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to delete &quot;{task.title}&quot; task?
              </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                deleteTaskMutation({ taskId: task._id });
              }}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
