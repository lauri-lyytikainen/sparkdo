import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlarmClock, Calendar, Flag } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface NewTaskFormProps {
  onCancel: () => void;
}

export function NewTaskForm({ onCancel }: NewTaskFormProps) {
  return (
    <div className="flex flex-1 flex-col bg-card rounded-xl border p-2 gap-2 pt-0">
      <div className="">
        <Input
          className="p-0 border-none shadow-none font-semibold focus:border-transparent focus:ring-0 focus:outline-none focus-visible:border-transparent focus-visible:ring-0 focus-visible:outline-none"
          placeholder="Check notes before meeting Friday"
          autoFocus
        />
        <Input
          className="p-0 border-none shadow-none font-light focus:border-transparent focus:ring-0 focus:outline-none focus-visible:border-transparent focus-visible:ring-0 focus-visible:outline-none"
          placeholder="Description"
        />
      </div>
      <div className="flex justify-between">
        <div className="flex justify-start gap-2">
          <Button size={"sm"} variant={"outline"} className="text-muted-foreground"><Calendar />Date</Button>
          <Select defaultValue="priority4">
            <SelectTrigger size={"sm"}>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority1">
                <Flag fill="red" color="red" className="fill-red-500 text-red-500" />Priority 1
              </SelectItem>
              <SelectItem value="priority2"><Flag className="fill-amber-500 text-amber-500" />Priority 2</SelectItem>
              <SelectItem value="priority3"><Flag className="fill-blue-500 text-blue-500" />Priority 3</SelectItem>
              <SelectItem value="priority4"><Flag />Priority 4</SelectItem>
            </SelectContent>
          </Select>
          <Button size={"sm"} variant={"outline"} className="text-muted-foreground"><AlarmClock />Reminders</Button>
        </div>
        <div className="flex gap-2">
          <Button size={"sm"} variant={"outline"} onClick={() => onCancel()}>Cancel</Button>
          <Button size={"sm"}>Add task</Button>
        </div>
      </div>
    </div>
  );
}

