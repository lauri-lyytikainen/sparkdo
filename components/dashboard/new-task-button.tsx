import { useState } from "react";
import { NewTaskForm } from "./new-task-form";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
export default function NewTaskButton({ todayPrefill }: { todayPrefill?: boolean }) {
  const [formShown, setFormShown] = useState(false);

  return (<div className="w-full flex">
    {!formShown && (
      <Button className="flex-1 justify-start" variant={"ghost"} onClick={() => setFormShown(true)}><Plus />Add task</Button>
    )}
    {formShown && (
      <NewTaskForm onCancel={() => setFormShown(false)} todayPrefill={todayPrefill} />
    )}
  </div>)

}
