"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { Doc } from "@/convex/_generated/dataModel";

interface TaskContextValue extends ReturnType<typeof useTasks> {
  editingTaskId: string | null;
  startEditing: (taskId: string) => void;
  stopEditing: () => void;
  isEditing: (taskId: string) => boolean;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const taskData = useTasks();
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const startEditing = useCallback((taskId: string) => {
    setEditingTaskId(taskId);
  }, []);

  const stopEditing = useCallback(() => {
    setEditingTaskId(null);
  }, []);

  const isEditing = useCallback((taskId: string) => {
    return editingTaskId === taskId;
  }, [editingTaskId]);

  const value: TaskContextValue = {
    ...taskData,
    editingTaskId,
    startEditing,
    stopEditing,
    isEditing,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTaskContext(): TaskContextValue {
  const ctx = useContext(TaskContext);
  if (!ctx) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return ctx;
}
