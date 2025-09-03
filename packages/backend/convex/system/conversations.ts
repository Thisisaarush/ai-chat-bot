import { internalMutation, internalQuery } from "../_generated/server"
import { ConvexError, v } from "convex/values"

export const escalate = internalMutation({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
      .unique()

    if (!conversation) {
      throw new ConvexError({
        message: "Conversation not found",
        code: "NOT_FOUND",
      })
    }

    await ctx.db.patch(conversation._id, {
      status: "escalated",
    })
  },
})

export const resolve = internalMutation({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
      .unique()

    if (!conversation) {
      throw new ConvexError({
        message: "Conversation not found",
        code: "NOT_FOUND",
      })
    }

    await ctx.db.patch(conversation._id, {
      status: "resolved",
    })
  },
})

export const getByThreadId = internalQuery({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
      .unique()
    return conversation
  },
})
