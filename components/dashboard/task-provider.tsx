"use client";

import { createContext, useContext } from "react";
import { useTasks } from "@/hooks/use-tasks";

type TaskContextValue = ReturnType<typeof useTasks>;

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const value = useTasks();
  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTaskContext(): TaskContextValue {
  const ctx = useContext(TaskContext);
  if (!ctx) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return ctx;
}
