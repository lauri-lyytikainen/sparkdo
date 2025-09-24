import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
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

  const { timeZone } = Intl.DateTimeFormat().resolvedOptions();

  const unscheduledTasks = useQuery(api.tasks.getUnscheduledTasks);
  const overdueTasks = useQuery(api.tasks.getOverdueTasks, { timeZone });
  const todayTasks = useQuery(api.tasks.getTodayTasks, { timeZone });
  const upcomingTasks = useQuery(api.tasks.getUpcomingTasks, { timeZone });
  const completedTasks = useQuery(api.tasks.getCompletedTasks, { limit: 100 }); // Example: limit for dashboard overview


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
