import { useState } from "react";
import { NewTaskForm } from "@/components/dashboard/new-task-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTaskContext } from "./task-provider";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DialogDescription } from "@radix-ui/react-dialog";

export default function NewTaskDialogButton({ todayPrefill }: { todayPrefill?: boolean }) {
    const [formShown, setFormShown] = useState(false);
    const { stopEditing } = useTaskContext();

    function handleShowForm() {
        stopEditing(); // Close any editing task
        setFormShown(true);
    }

    return (<div className="w-full flex">
        <Dialog open={formShown} onOpenChange={setFormShown} modal={false}>
            <DialogTrigger asChild>
                <Button className="flex-1 justify-start mx-1" variant={"ghost"} onClick={handleShowForm}><Plus />Add task</Button>
            </DialogTrigger>
            <DialogContent className="p-0 border-none rounded-xl">
                <VisuallyHidden>
                    <DialogTitle>Add New Task</DialogTitle>
                    <DialogDescription>Fill the form to add a new task</DialogDescription>
                </VisuallyHidden>
                <NewTaskForm onCancel={() => setFormShown(false)} todayPrefill={todayPrefill} isModal />
            </DialogContent>
        </Dialog>
    </div>)

}
