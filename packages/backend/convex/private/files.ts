import { action } from "../_generated/server"
import { ConvexError, v } from "convex/values"
import {
  contentHashFromArrayBuffer,
  guessMimeTypeFromContents,
  guessMimeTypeFromExtension,
} from "@convex-dev/rag"
import { extractTextContent } from "../lib/extractTextContent"
import rag from "../system/ai/rag"

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

    const {} = await rag.add(ctx, {
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
  },
})
