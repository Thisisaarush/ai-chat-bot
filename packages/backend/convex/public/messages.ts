import { components, internal } from "../_generated/api"
import { action, query } from "../_generated/server"
import { ConvexError, v } from "convex/values"
import { supportAgent } from "../system/ai/agents/supportAgent"
import { paginationOptsValidator } from "convex/server"
import { resolveConversation } from "../system/ai/tools/resolveConversation"
import { escalateConversation } from "../system/ai/tools/escalateConversation"
import { saveMessage } from "@convex-dev/agent"
import { search } from "../system/ai/tools/search"

export const create = action({
  args: {
    prompt: v.string(),
    threadId: v.string(),
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    const contactSession = await ctx.runQuery(
      internal.system.contactSessions.getOne,
      {
        contactSessionId: args.contactSessionId,
      }
    )

    if (
      !contactSession ||
      (contactSession.expiresAt && contactSession.expiresAt < Date.now())
    ) {
      throw new ConvexError({
        message: "Invalid contact session",
        code: "INVALID_CONTACT_SESSION",
      })
    }

    const conversation = await ctx.runQuery(
      internal.system.conversations.getByThreadId,
      {
        threadId: args.threadId,
      }
    )

    if (!conversation) {
      throw new ConvexError({
        message: "Conversation not found",
        code: "INVALID_CONVERSATION",
      })
    }

    if (conversation.status === "resolved") {
      throw new ConvexError({
        message: "Conversation already resolved",
        code: "CONVERSATION_RESOLVED",
      })
    }

    // todo: implement subscription checks

    const shouldTriggerAgent = conversation.status === "unresolved"

    if (shouldTriggerAgent) {
      await supportAgent.generateText(
        ctx,
        {
          threadId: args.threadId,
        },
        {
          prompt: args.prompt,
          tools: { escalateConversation, resolveConversation, search },
        }
      )
    } else {
      await saveMessage(ctx, components.agent, {
        threadId: args.threadId,
        prompt: args.prompt,
      })
    }
  },
})

export const getMany = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    const contactSession = await ctx.db.get(args.contactSessionId)

    if (
      !contactSession ||
      (contactSession.expiresAt && contactSession.expiresAt < Date.now())
    ) {
      throw new ConvexError({
        message: "Invalid contact session",
        code: "INVALID_CONTACT_SESSION",
      })
    }

    const paginated = await supportAgent.listMessages(ctx, {
      threadId: args.threadId,
      paginationOpts: args.paginationOpts,
    })

    return paginated
  },
})
