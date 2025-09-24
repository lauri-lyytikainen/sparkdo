import { useState } from "react";
import { NewTaskForm } from "@/components/dashboard/new-task-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTaskContext } from "./task-provider";

export default function NewTaskButton({ todayPrefill }: { todayPrefill?: boolean }) {
  const [formShown, setFormShown] = useState(false);
  const { stopEditing } = useTaskContext();

  function handleShowForm() {
    stopEditing(); // Close any editing task
    setFormShown(true);
  }

  return (<div className="w-full flex">
    {!formShown && (
      <Button className="flex-1 justify-start" variant={"ghost"} onClick={handleShowForm}><Plus />Add task</Button>
    )}
    {formShown && (
      <NewTaskForm onCancel={() => setFormShown(false)} todayPrefill={todayPrefill} />
    )}
  </div>)

}
