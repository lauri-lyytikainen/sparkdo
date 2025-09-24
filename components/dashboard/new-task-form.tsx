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
import { useEffect, useState, useRef } from "react";
import { formatTaskDateAndTime } from "@/utils/date-utils";

function getTimeExpressions(text: string, referenceDate: Date) {
  const results = parse(text, referenceDate, { forwardDate: true });
  return results.map(result => ({
    start: result.index,
    end: result.index + result.text.length,
    text: result.text
  }));
}

function StyledTitleInput({ value, onChange, timeExpressions, ...props }: {
  value: string;
  onChange: (value: string) => void;
  timeExpressions: Array<{ start: number; end: number; text: string }>;
  [key: string]: any;
}) {
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
              className={segment.isTime ? 'text-blue-600 bg-blue-100 px-1 p-0 rounded-sm font-medium' : 'text-current'}
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
}

export function NewTaskForm({ onCancel, todayPrefill }: NewTaskFormProps) {
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
      dueDate: todayPrefill ? today : undefined,
      dueTime: undefined,
    },
  });

  const title = useWatch({ control: form.control, name: "title" });
  const [dateFromTitle, setDateFromTitle] = useState<boolean>(false);
  const [localTimeString, setLocalTimeString] = useState<string | undefined>(
    undefined,
  );
  const [cleanTitle, setCleanTitle] = useState<string>("");

  useEffect(() => {
    if (title) {
      const results = parse(title, today, { forwardDate: true });
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
          const hour = bestResult.start.get("hour");
          const minute = bestResult.start.get("minute") || 0;
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
        setCleanTitle("");
      }
    }
    if (!title && dateFromTitle) {
      form.setValue("dueDate", undefined);
      form.setValue("dueTime", undefined);
      setDateFromTitle(false);
      setCleanTitle("");
    }
  }, [title]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const dateString = values.dueDate
      ? values.dueDate.toISOString().split("T")[0]
      : undefined;
    const timeString = values.dueTime
      ? values.dueTime.toISOString().split("T")[1]
      : undefined;

    const finalTitle = cleanTitle || values.title;

    addTask({
      title: finalTitle,
      description: values.description,
      dueDate: dateString,
      dueTime: timeString,
    });
    form.reset();
    setCleanTitle("");
    if (todayPrefill) {
      form.setValue("dueDate", today);
    }
  }

  function setDateToParsedDate(text: string) {
    const parsedDate = parseDate(text, today, { forwardDate: true });
    if (parsedDate) {
      form.setValue("dueDate", parsedDate);
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
                  <StyledTitleInput
                    className="p-0 border-none shadow-none font-semibold focus:border-transparent focus:ring-0 focus:outline-none focus-visible:border-transparent focus-visible:ring-0 focus-visible:outline-none w-full"
                    placeholder="Check notes before meeting Friday"
                    autoFocus
                    value={field.value}
                    onChange={field.onChange}
                    timeExpressions={getTimeExpressions(field.value, today)}
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
                    ? `${formatTaskDateAndTime(
                      form.watch("dueDate")?.toISOString().split("T")[0],
                      form.watch("dueTime") ? localTimeString : undefined
                    )}`
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
            <Button size={"sm"} variant={"outline"} onClick={() => {
              onCancel();
              setCleanTitle("");
            }}>
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
