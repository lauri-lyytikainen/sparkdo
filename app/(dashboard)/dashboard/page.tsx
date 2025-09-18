"use client";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useState } from "react";

import { useTaskContext } from "@/components/dashboard/task-provider";

export default function Dashboard() {
  const addTask = useMutation(api.tasks.addTask);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { todayTasks, isLoading } = useTaskContext();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      setSubmitting(true);
      await addTask({
        title: title.trim(),
        description: description.trim(),
        dueDate: undefined,
        dueTime: undefined,
      });
      setTitle("");
      setDescription("");
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <div>
      <h1 className="text-2xl font-bold">Today</h1>
      {isLoading ? (
        <p>Loading…</p>
      ) : todayTasks?.length === 0 ? (
        <p>No tasks</p>
      ) : (
        <ul>
          {todayTasks?.map((task) => (
            <li key={task._id}>{task.title}</li>
          ))}
        </ul>
      )}
      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-2">
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border rounded px-2 py-1"
          required
          disabled={submitting}
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border rounded px-2 py-1"
          rows={3}
          disabled={submitting}
        />
        <button
          type="submit"
          className="bg-black text-white rounded px-3 py-1 w-fit disabled:opacity-50"
          disabled={submitting}
        >
          {submitting ? "Adding…" : "Add task"}
        </button>
      </form>
    </div>
  );
}
