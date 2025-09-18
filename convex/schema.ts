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
    dueTime: v.optional(v.string()),
  }).index("by_author", ["author"]),
});
