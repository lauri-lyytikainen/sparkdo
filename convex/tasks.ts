import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const addTask = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    dueDate: v.optional(v.string()),
    hasDueTime: v.boolean(),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw Error("Not signed in");
    }

    await ctx.db.insert("tasks", {
      author: identity.tokenIdentifier,
      title: args.title,
      description: args.description,
      isCompleted: false,
      dueDate: args.dueDate,
      hasDueTime: args.hasDueTime,
    });

  },
});

export const getTodayAndOverdueTasks = query({
  args: {
    endOfLocalDay: v.string(),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw Error("Not signed in");
    }

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_author_isCompleted_dueDate", (q) =>
        q.eq("author", identity.tokenIdentifier)
          .eq("isCompleted", false)
          .lt("dueDate", args.endOfLocalDay))
      // Ordered by dueTime if available, then by creation time
      .order("asc")
      .collect();
    return tasks;
  },
});

export const getUpcomingTasks = query({
  args: {
    endOfLocalDay: v.string(),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw Error("Not signed in");
    }


    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_author_isCompleted_dueDate", (q) =>
        q.eq("author", identity.tokenIdentifier)
          .eq("isCompleted", false)
          .gte("dueDate", args.endOfLocalDay))
      // Filter out tasks without a dueDate (they should be in unscheduled)
      .filter((q) => q.neq(q.field("dueDate"), undefined))
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
      .withIndex("by_author_isCompleted_dueDate", (q) =>
        q.eq("author", identity.tokenIdentifier)
          .eq("isCompleted", true))
      // Ordered by _creationTime, return most recent
      .order("desc")
      .take(args.limit);
    return tasks;
  },
});

// Add this new query for unscheduled tasks (tasks without a due date)
export const getUnscheduledTasks = query({
  args: {},

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw Error("Not signed in");
    }

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_author_isCompleted", (q) =>
        q.eq("author", identity.tokenIdentifier)
          .eq("isCompleted", false))
      .filter((q) => q.eq(q.field("dueDate"), undefined))
      // Ordered by creation time, most recent first
      .order("desc")
      .collect();
    return tasks;
  },
});

export const completeTask = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw Error("Not signed in");
    }

    // First, verify the task exists and belongs to the user
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    if (task.author !== identity.tokenIdentifier) {
      throw new Error("Unauthorized: Task does not belong to user");
    }

    // Update the task to mark it as completed
    await ctx.db.patch(args.taskId, {
      isCompleted: true,
      completedAt: new Date().toISOString(),
    });

    return null;
  },
});

export const uncompleteTask = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw Error("Not signed in");
    }

    // First, verify the task exists and belongs to the user
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    if (task.author !== identity.tokenIdentifier) {
      throw new Error("Unauthorized: Task does not belong to user");
    }

    // Update the task to mark it as not completed
    await ctx.db.patch(args.taskId, {
      isCompleted: false,
      completedAt: undefined,
    });

    return null;
  },
});

export const updateTask = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.string(),
    description: v.string(),
    dueDate: v.optional(v.string()),
    hasDueTime: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw Error("Not signed in");
    }

    // First, verify the task exists and belongs to the user
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    if (task.author !== identity.tokenIdentifier) {
      throw new Error("Unauthorized: Task does not belong to user");
    }

    // Update the task with new values
    await ctx.db.patch(args.taskId, {
      title: args.title,
      description: args.description,
      dueDate: args.dueDate,
      hasDueTime: args.hasDueTime,
    });

    return null;
  },
});

export const deleteTask = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw Error("Not signed in");
    }

    // First, verify the task exists and belongs to the user
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    if (task.author !== identity.tokenIdentifier) {
      throw new Error("Unauthorized: Task does not belong to user");
    }

    await ctx.db.delete(args.taskId);

    return null;
  }
});

export const moveTaskToToday = mutation({
  args: {
    taskId: v.id("tasks"),
    startOfLocalDay: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw Error("Not signed in");
    }

    // First, verify the task exists and belongs to the user
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    if (task.author !== identity.tokenIdentifier) {
      throw new Error("Unauthorized: Task does not belong to user");
    }

    // Update the task's dueDate to the provided startOfLocalDay
    await ctx.db.patch(args.taskId, {
      dueDate: args.startOfLocalDay,
      hasDueTime: false, // Since we're moving to "Today", we set hasDueTime to false
    });

    return null;
  }
});