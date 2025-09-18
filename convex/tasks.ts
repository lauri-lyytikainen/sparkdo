import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

export const addTask = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    dueDate: v.optional(v.string()),
    dueTime: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw Error("Not signed in");
    }

    const id = await ctx.db.insert("tasks", {
      author: identity.tokenIdentifier,
      title: args.title,
      description: args.description,
      isCompleted: false,
      dueDate: args.dueDate,
      dueTime: args.dueTime,
    });

    console.log("Added new task with id:", id);
    // Optionally, return a value from your mutation.
    // return id;
  },
});

export const getOverdueTasks = query({
  args: {
    timeZone: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw Error("Not signed in");
    }
    const tz = args.timeZone ?? "UTC";
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date()); // YYYY-MM-DD in the provided time zone

    const tasks = await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("author"), identity.tokenIdentifier))
      .filter((q) => q.lt(q.field("dueDate"), today))
      .filter((q) => q.eq(q.field("isCompleted"), false))
      // Ordered by _creationTime, return most recent
      .order("desc")
      .collect();
    return tasks;
  },
});

export const getTodayTasks = query({
  args: {
    timeZone: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw Error("Not signed in");
    }
    const tz = args.timeZone ?? "UTC";
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date()); // YYYY-MM-DD in the provided time zone

    const tasks = await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("author"), identity.tokenIdentifier))
      .filter((q) => q.eq(q.field("dueDate"), today))
      // Ordered by _creationTime, return most recent
      .order("desc")
      .collect();
    return tasks;
  },
});

export const getUpcomingTasks = query({
  args: {
    timeZone: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw Error("Not signed in");
    }

    const tz = args.timeZone ?? "UTC";
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date()); // YYYY-MM-DD in provided time zone

    const tasks = await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("author"), identity.tokenIdentifier))
      // Only tasks with a dueDate strictly later than today
      .filter((q) => q.gt(q.field("dueDate"), today))
      .filter((q) => q.eq(q.field("isCompleted"), false))
      // Show soonest first
      .order("asc")
      .collect();
    return tasks;
  },
});

export const getCompletedTasks = query({
  args: {
    limit: v.number(),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw Error("Not signed in");
    }
    const tasks = await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("author"), identity.tokenIdentifier))
      .filter((q) => q.eq(q.field("isCompleted"), true))
      // Ordered by _creationTime, return most recent
      .order("desc")
      .take(args.limit);
    return tasks;
  },
});
