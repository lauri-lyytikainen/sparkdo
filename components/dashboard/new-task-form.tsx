"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Flag } from "lucide-react";
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
import { useEffect, useState, useRef } from "react";
import { formatTaskDateAndTime } from "@/utils/date-utils";
import { Doc } from "@/convex/_generated/dataModel";

type Task = Doc<"tasks">;

function getTimeExpressions(text: string, referenceDate: Date) {
  const results = parse(text, referenceDate, { forwardDate: true });
  return results.map(result => ({
    start: result.index,
    end: result.index + result.text.length,
    text: result.text
  }));
}

function handleEnterKeySubmit(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key === "Enter") {
    e.preventDefault();
    const formElement = e.currentTarget.form;
    if (formElement) {
      formElement.requestSubmit();
    }
  }
}

function StyledTitleInput({
  value,
  onChange,
  timeExpressions,
  ...props
}: {
  value: string;
  onChange: (value: string) => void;
  timeExpressions: Array<{ start: number; end: number; text: string }>;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const createStyledSegments = () => {
    if (!value || timeExpressions.length === 0) {
      return [{ text: value || '', isTime: false }];
    }

    const segments = [];
    let currentIndex = 0;

    const sortedExpressions = [...timeExpressions].sort((a, b) => a.start - b.start);

    sortedExpressions.forEach(expr => {
      if (currentIndex < expr.start) {
        segments.push({
          text: value.substring(currentIndex, expr.start),
          isTime: false
        });
      }

      segments.push({
        text: expr.text,
        isTime: true
      });

      currentIndex = expr.end;
    });

    if (currentIndex < value.length) {
      segments.push({
        text: value.substring(currentIndex),
        isTime: false
      });
    }

    return segments;
  };

  const segments = createStyledSegments();

  return (
    <div className="relative">
      {/* Styled display overlay - always visible when there are time expressions */}
      {value && timeExpressions.length > 0 && (
        <div
          className={`${props.className} absolute inset-0 flex items-center pointer-events-none`}
        >
          {segments.map((segment, index) => (
            <span
              key={index}
              className={segment.isTime ? 'text-secondary-foreground bg-secondary px-1 p-0 rounded-sm font-medium' : 'text-current'}
            >
              {segment.text}
            </span>
          ))}
        </div>
      )}

      {/* Actual input - transparent background to show styled overlay underneath */}
      <input
        {...props}
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsEditing(true)}
        onBlur={() => setIsEditing(false)}
        className={`${props.className} relative z-10 ${timeExpressions.length > 0 ? 'text-transparent' : ''}`}
        style={{
          caretColor: 'black'
        }}
        onKeyDown={handleEnterKeySubmit}
      />

      {/* Clickable overlay when not editing */}
      {!isEditing && value && timeExpressions.length > 0 && (
        <div
          className="absolute inset-0 cursor-text"
          onClick={() => {
            if (inputRef.current) {
              inputRef.current.focus();
              setIsEditing(true);
            }
          }}
        />
      )}
    </div>
  );
}

interface NewTaskFormProps {
  onCancel: () => void;
  todayPrefill?: boolean;
  editTask?: Task;
  isEditing?: boolean;
  isModal?: boolean;
}

export function NewTaskForm({ onCancel, todayPrefill, editTask, isEditing, isModal }: NewTaskFormProps) {
  const addTask = useMutation(api.tasks.addTask);
  const updateTask = useMutation(api.tasks.updateTask);

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
    dueTime: z.string(),
    hasDueTime: z.boolean(),
    priority: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: editTask?.title || "",
      description: editTask?.description || "",
      dueDate: editTask?.dueDate ? new Date(editTask.dueDate) : (todayPrefill ? new Date() : undefined),
      dueTime: editTask?.hasDueTime && editTask.dueDate ? new Date(editTask.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : "",
      hasDueTime: editTask?.hasDueTime || false,
      priority: editTask?.priority !== undefined ? editTask.priority : 4,
    },
  });

  const title = useWatch({ control: form.control, name: "title" });
  const [dateFromTitle, setDateFromTitle] = useState<boolean>(false);

  const [cleanTitle, setCleanTitle] = useState<string>("");

  useEffect(() => {
    if (title) {
      const results = parse(title, new Date(), { forwardDate: true });
      // If we found a date, set it as dueDate
      if (results.length > 0) {
        // Create clean title by removing time expressions
        let titleWithoutTime = title;

        // Loop through all results to remove all time expressions
        results.forEach(result => {
          const timeText = title.substring(result.index, result.index + result.text.length);
          titleWithoutTime = titleWithoutTime.replace(timeText, '').trim();
        });

        // Clean up extra spaces
        titleWithoutTime = titleWithoutTime.replace(/\s+/g, ' ').trim();
        setCleanTitle(titleWithoutTime);

        // Find the most complete result (with most date/time information)
        const bestResult = results.reduce((best, current) => {
          // Prefer results with time information
          if (current.start.isCertain("hour") && !best.start.isCertain("hour")) {
            return current;
          }
          // If both or neither have time, prefer the first one (usually most complete)
          return best;
        });

        const date = bestResult.start.date();
        form.setValue("dueDate", date);

        // If time is present, set dueTime as well
        if (bestResult.start.isCertain("hour")) {
          form.setValue("hasDueTime", true);
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          form.setValue("dueTime", `${hours}:${minutes}`);
        } else {
          form.setValue("hasDueTime", false);
          form.setValue("dueTime", "");
        }
        setDateFromTitle(true);
      } else if (dateFromTitle) {
        form.setValue("dueDate", undefined);
        form.setValue("hasDueTime", false);
        form.setValue("dueTime", "");
        setDateFromTitle(false);
        setCleanTitle("");
      }
    }
    if (!title && dateFromTitle) {
      form.setValue("dueDate", undefined);
      form.setValue("hasDueTime", false);
      form.setValue("dueTime", "");
      setDateFromTitle(false);
      setCleanTitle("");
    }
  }, [title, dateFromTitle, form]);

  useEffect(() => {
    if (!isEditing) return;

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCancel();
      }
    }
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isEditing, onCancel]);

  function onSubmit(values: z.infer<typeof formSchema>) {

    const finalTitle = cleanTitle || values.title;

    if (isEditing && editTask) {
      updateTask({
        taskId: editTask._id,
        title: finalTitle,
        description: values.description,
        dueDate: values.dueDate?.toISOString(),
        hasDueTime: values.dueDate ? values.hasDueTime : false,
        priority: values.priority,
      });
      onCancel();
    } else {
      addTask({
        title: finalTitle,
        description: values.description,
        dueDate: values.dueDate?.toISOString(),
        hasDueTime: values.dueDate ? values.hasDueTime : false,
        priority: values.priority,
      });
      form.reset();
      setCleanTitle("");
      if (todayPrefill) {
        form.setValue("dueDate", new Date());
      }
    }
    if (isModal) {
      onCancel();
    }
  }

  function setDateToParsedDate(text: string) {
    const parsedDate = parseDate(text, new Date(), { forwardDate: true });
    if (parsedDate) {
      form.setValue("dueDate", parsedDate);
      form.setValue("hasDueTime", false);
      form.setValue("dueTime", "");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-1 flex-col bg-card rounded-xl border p-3 gap-1"
      >
        <div className={isModal ? "pr-10" : ""}>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <StyledTitleInput
                    className="p-0 border-none shadow-none font-semibold focus:border-transparent focus:ring-0 focus:outline-none focus-visible:border-transparent focus-visible:ring-0 focus-visible:outline-none w-full"
                    placeholder="Check notes before meeting Friday"
                    autoFocus
                    value={field.value}
                    onChange={field.onChange}
                    timeExpressions={getTimeExpressions(field.value, new Date())}
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
                    onKeyDown={handleEnterKeySubmit}
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
                    ? `${formatTaskDateAndTime(form.watch("dueDate"), form.watch("hasDueTime"))}`
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
                            timeZone="UTC"
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
                            value={field.value || ""}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              if (!form.watch("dueDate")) {
                                form.setValue("dueDate", new Date());
                              }
                              form.setValue("hasDueTime", e.target.value !== "");
                              const dueDate = form.watch("dueDate");
                              if (dueDate && e.target.value) {
                                const [hours, minutes] = e.target.value.split(":").map(Number);
                                const updatedDate = new Date(dueDate);
                                updatedDate.setHours(hours);
                                updatedDate.setMinutes(minutes);
                                updatedDate.setSeconds(0);
                                updatedDate.setMilliseconds(0);
                                form.setValue("dueDate", updatedDate);
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
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (

                <FormItem>
                  <FormControl>
                    <Select defaultValue="priority4"
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <SelectTrigger size={"sm"}>
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">
                          <Flag
                            fill="red"
                            color="red"
                            className="fill-red-500 text-red-500"
                          />
                          Priority 1
                        </SelectItem>
                        <SelectItem value="2">
                          <Flag className="fill-amber-500 text-amber-500" />
                          Priority 2
                        </SelectItem>
                        <SelectItem value="3">
                          <Flag className="fill-blue-500 text-blue-500" />
                          Priority 3
                        </SelectItem>
                        <SelectItem value="4">
                          <Flag />
                          Priority 4
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


          </div>
          <div className="flex gap-2">
            <Button
              size={"sm"}
              variant={"outline"}
              type="button"
              onClick={() => {
                onCancel();
                setCleanTitle("");
              }}
            >
              Cancel
            </Button>
            <Button size={"sm"} type={"submit"}>
              {isEditing ? "Update task" : "Add task"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
