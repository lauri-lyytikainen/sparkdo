"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlarmClock, Calendar as CalendarIcon, Flag } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { parseDate, parse } from "chrono-node";
import { useEffect, useState } from "react";

interface NewTaskFormProps {
  onCancel: () => void;
}

export function NewTaskForm({ onCancel }: NewTaskFormProps) {
  const addTask = useMutation(api.tasks.addTask);
  const today = new Date();

  const formSchema = z.object({
    title: z
      .string()
      .min(1, {
        message: "Title must be at least 1 character",
      })
      .max(50, {
        message: "Title must be less than 50 characters",
      }),
    description: z.string().max(50, {
      message: "Description must be less than 50 characters",
    }),
    dueDate: z.date().optional(),
    dueTime: z.date().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: undefined,
      dueTime: undefined,
    },
  });

  const title = useWatch({ control: form.control, name: "title" });
  const [dateFromTitle, setDateFromTitle] = useState<boolean>(false);
  const [localTimeString, setLocalTimeString] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    if (title) {
      const results = parse(title, today, { forwardDate: true });
      console.log("Parsing results:", results);
      // If we found a date, set it as dueDate
      if (results.length > 0) {
        const date = results[0].start.date();
        form.setValue("dueDate", date);
        // If time is present, set dueTime as well
        if (results[0].start.isCertain("hour")) {
          const hour = results[0].start.get("hour");
          const minute = results[0].start.get("minute") || 0;
          setLocalTimeString(
            hour!.toString().padStart(2, "0") +
              ":" +
              minute.toString().padStart(2, "0"),
          );
          const localDate = new Date();
          localDate.setHours(hour!, minute, 0, 0);
          form.setValue("dueTime", localDate);
        } else {
          form.setValue("dueTime", undefined);
        }
        setDateFromTitle(true);
      } else if (dateFromTitle) {
        form.setValue("dueDate", undefined);
        form.setValue("dueTime", undefined);
        setDateFromTitle(false);
      }
    }
    if (!title && dateFromTitle) {
      form.setValue("dueDate", undefined);
      form.setValue("dueTime", undefined);
      setDateFromTitle(false);
    }
  }, [title]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const dateString = values.dueDate
      ? values.dueDate.toISOString().split("T")[0]
      : undefined;
    const timeString = values.dueTime
      ? values.dueTime.toISOString().split("T")[1]
      : undefined;
    addTask({
      title: values.title,
      description: values.description,
      dueDate: dateString,
      dueTime: timeString,
    });
    form.reset();
  }

  function setDateToParsedDate(text: string) {
    const parsedDate = parseDate(text, today, { forwardDate: true });
    if (parsedDate) {
      form.setValue("dueDate", parsedDate);
      console.log("Parsed date:", parsedDate);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-1 flex-col bg-card rounded-xl border p-2 gap-2 pt-0"
      >
        <div>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    className="p-0 border-none shadow-none font-semibold focus:border-transparent focus:ring-0 focus:outline-none focus-visible:border-transparent focus-visible:ring-0 focus-visible:outline-none"
                    placeholder="Check notes before meeting Friday"
                    autoFocus
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    className="p-0 border-none shadow-none font-light focus:border-transparent focus:ring-0 focus:outline-none focus-visible:border-transparent focus-visible:ring-0 focus-visible:outline-none"
                    placeholder="Description"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-between">
          <div className="flex justify-start gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size={"sm"}
                  variant={"outline"}
                  className={
                    form.watch("dueDate") ? undefined : "text-muted-foreground"
                  }
                >
                  <CalendarIcon />
                  {form.watch("dueDate")
                    ? `${form.watch("dueDate")?.toLocaleDateString()}${
                        form.watch("dueTime") ? ` at ${localTimeString}` : ""
                      }`
                    : "Date"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right">
                <DropdownMenuItem onClick={() => setDateToParsedDate("today")}>
                  Today
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDateToParsedDate("tomorrow")}
                >
                  Tomorrow
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDateToParsedDate("next monday")}
                >
                  Next Monday
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="p-0">
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Calendar
                            weekStartsOn={1}
                            buttonVariant={"outline"}
                            mode="single"
                            // className="rounded-lg border"
                            selected={field.value}
                            onSelect={field.onChange}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </DropdownMenuLabel>
                <DropdownMenuLabel>
                  <FormField
                    control={form.control}
                    name="dueTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="time"
                            id="time-picker"
                            step="60"
                            value={
                              field.value instanceof Date
                                ? field.value.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                  })
                                : ""
                            }
                            onChange={(e) => {
                              setLocalTimeString(e.target.value);
                              if (!form.watch("dueDate")) {
                                form.setValue("dueDate", new Date());
                              }
                              const [hourStr, minuteStr] =
                                e.target.value.split(":");
                              const hour = parseInt(hourStr, 10);
                              const minute = parseInt(minuteStr, 10);
                              if (!isNaN(hour) && !isNaN(minute)) {
                                // Create a Date object in local time
                                const localDate = new Date();
                                localDate.setHours(hour, minute, 0, 0);
                                field.onChange(localDate);
                              } else {
                                field.onChange(undefined);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </DropdownMenuLabel>
              </DropdownMenuContent>
            </DropdownMenu>

            <Select defaultValue="priority4">
              <SelectTrigger size={"sm"}>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="priority1">
                  <Flag
                    fill="red"
                    color="red"
                    className="fill-red-500 text-red-500"
                  />
                  Priority 1
                </SelectItem>
                <SelectItem value="priority2">
                  <Flag className="fill-amber-500 text-amber-500" />
                  Priority 2
                </SelectItem>
                <SelectItem value="priority3">
                  <Flag className="fill-blue-500 text-blue-500" />
                  Priority 3
                </SelectItem>
                <SelectItem value="priority4">
                  <Flag />
                  Priority 4
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              size={"sm"}
              variant={"outline"}
              className="text-muted-foreground"
              disabled
            >
              <AlarmClock />
              Reminders
            </Button>
          </div>
          <div className="flex gap-2">
            <Button size={"sm"} variant={"outline"} onClick={() => onCancel()}>
              Cancel
            </Button>
            <Button size={"sm"} type={"submit"}>
              Add task
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
