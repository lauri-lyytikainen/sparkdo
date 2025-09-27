import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useMemo } from "react";
import { useEffect, useState } from "react";
type Task = Doc<"tasks">;

interface UseTasksResult {
  unscheduledTasks: Task[] | undefined;
  overdueTasks: Task[] | undefined;
  todayTasks: Task[] | undefined;
  upcomingTasks: Task[] | undefined;
  completedTasks: Task[] | undefined; // Maybe limited to a few
  unscheduledTaskCount: number | undefined;
  todayTaskCount: number | undefined;
  upcomingTaskCount: number | undefined;
  isLoading: boolean;
}

export function useTasks(): UseTasksResult {
  // Consider taking the project or team id as param?

  const now = useMemo(() => {
    const date = new Date();
    return date.toISOString();
  }, []);

  const endOfLocalDay = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 1);
    return date.toISOString();
  }, []);

  const unscheduledTasks = useQuery(api.tasks.getUnscheduledTasks);
  const todayAndOverdueTasks = useQuery(api.tasks.getTodayAndOverdueTasks, { endOfLocalDay: endOfLocalDay });
  const upcomingTasks = useQuery(api.tasks.getUpcomingTasks, { endOfLocalDay: endOfLocalDay });
  const completedTasks = useQuery(api.tasks.getCompletedTasks, { limit: 100 });


  // Update 'now' every minute
  // TODO: Figure out why this minute differs from system clock in linux
  const [nowMinute, setNowMinute] = useState(() => {
    const date = new Date();
    date.setSeconds(0, 0);
    return date.toISOString();
  });
  useEffect(() => {
    const interval = setInterval(() => {
      const date = new Date();
      date.setSeconds(0, 0);
      setNowMinute(date.toISOString());
    }, 60 * 1000); // every minute
    return () => clearInterval(interval);
  }, []);

  const todayTasks = useMemo(() => {
    if (!todayAndOverdueTasks) return undefined;
    return todayAndOverdueTasks.filter(task => {
      if (task.hasDueTime) {
        return task.dueDate && task.dueDate >= nowMinute;
      }
      return false;
    });
  }, [todayAndOverdueTasks, nowMinute]);

  const overdueTasks = useMemo(() => {
    if (!todayAndOverdueTasks) return undefined;
    return todayAndOverdueTasks.filter(task => {
      if (!task.dueDate) return false;
      return task.dueDate < nowMinute;
    });
  }, [todayAndOverdueTasks, nowMinute]);

  const isLoading =
    overdueTasks === undefined ||
    todayTasks === undefined ||
    upcomingTasks === undefined ||
    completedTasks === undefined;

  return {
    unscheduledTasks,
    overdueTasks,
    todayTasks,
    upcomingTasks,
    completedTasks,
    unscheduledTaskCount: unscheduledTasks?.length || 0,
    todayTaskCount: (todayTasks?.length || 0) + (overdueTasks?.length || 0),
    upcomingTaskCount: upcomingTasks?.length || 0,
    isLoading,
  };
}
