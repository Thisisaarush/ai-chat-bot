import { action, mutation } from "../_generated/server"
import { ConvexError, v } from "convex/values"
import {
  contentHashFromArrayBuffer,
  guessMimeTypeFromContents,
  guessMimeTypeFromExtension,
  vEntryId,
} from "@convex-dev/rag"
import { extractTextContent } from "../lib/extractTextContent"
import rag from "../system/ai/rag"
import { ar } from "zod/v4/locales"
import { Id } from "../_generated/dataModel"

const guessMimeType = (filename: string, bytes: ArrayBuffer): string => {
  return (
    guessMimeTypeFromExtension(filename) ||
    guessMimeTypeFromContents(bytes) ||
    "application/octet-stream"
  )
}

export const addFile = action({
  args: {
    filename: v.string(),
    mimeType: v.string(),
    bytes: v.bytes(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      })
    }

    const orgId = identity.orgId as string
    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "User not authorized",
      })
    }

    const { bytes, filename, category } = args
    const mimeType = args.mimeType || guessMimeType(filename, bytes)
    const blob = new Blob([bytes], { type: mimeType })

    const storageId = await ctx.storage.store(blob)

    const text = await extractTextContent(ctx, {
      storageId,
      filename,
      bytes,
      mimeType,
    })

    const { entryId, created } = await rag.add(ctx, {
      namespace: orgId,
      text,
      key: filename,
      metadata: {
        storageId,
        uploadedBy: orgId,
        filename,
        category: category ?? null,
      },
      contentHash: await contentHashFromArrayBuffer(bytes),
    })

    if (!created) {
      console.debug("Entry already exists, skipping upload metadata")
      await ctx.storage.delete(storageId)
    }

    return {
      url: await ctx.storage.getUrl(storageId),
      entryId,
    }
  },
})

export const deleteFile = mutation({
  args: {
    entryId: vEntryId,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      })
    }

    const orgId = identity.orgId as string
    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "User not authorized",
      })
    }

    const namespace = await rag.getNamespace(ctx, {
      namespace: orgId,
    })

    if (!namespace) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Namespace not found",
      })
    }

    const entry = await rag.getEntry(ctx, {
      entryId: args.entryId,
    })

    if (!entry) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Entry not found",
      })
    }

    if (entry.metadata?.uploadedBy !== orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "User not authorized to delete this entry",
      })
    }

    if (entry.metadata?.storageId) {
      await ctx.storage.delete(entry.metadata.storageId as Id<"_storage">)
    }

    await rag.deleteAsync(ctx, {
      entryId: args.entryId,
    })
  },
})
