import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    author: v.string(),
    title: v.string(),
    description: v.string(),
    isCompleted: v.boolean(),
    completedAt: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    hasDueTime: v.boolean(),
  })
    // Primary index for most common queries (by user, completion status, and due date)
    .index("by_author_isCompleted_dueDate", ["author", "isCompleted", "dueDate"])
    // Optional: Additional index for tasks without due dates (unscheduled tasks)
    .index("by_author_isCompleted", ["author", "isCompleted"])
});
