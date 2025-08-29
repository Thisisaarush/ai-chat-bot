import { mutation, query } from "../_generated/server"
import { ConvexError, v } from "convex/values"
import { supportAgent } from "../system/ai/agents/supportAgent"

export const getOne = query({
  args: {
    conversationId: v.id("conversations"),
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.contactSessionId)
    if (!session) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Session not found",
      })
    }
    const conversation = await ctx.db.get(args.conversationId)
    if (!conversation) return null

    if (conversation.contactSessionId !== session._id) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "You do not have access to this conversation",
      })
    }

    return {
      _id: conversation._id,
      status: conversation.status,
      threadId: conversation.threadId,
    }
  },
})

export const create = mutation({
  args: {
    organizationId: v.string(),
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.contactSessionId)

    if (!session || (session.expiresAt && session.expiresAt < Date.now())) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid or expired session",
      })
    }

    const { threadId } = await supportAgent.createThread(ctx, {
      userId: args.organizationId,
    })

    const conversationId = await ctx.db.insert("conversations", {
      organizationId: args.organizationId,
      contactSessionId: session._id,
      status: "unresolved",
      threadId,
    })
    return conversationId
  },
})
