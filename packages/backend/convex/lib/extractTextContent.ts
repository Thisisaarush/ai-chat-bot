import { google } from "@ai-sdk/google"
import { generateText } from "ai"
import type { StorageActionWriter } from "convex/server"
import { assert } from "convex-helpers"
import { Id } from "../_generated/dataModel"

const AI_MODELS = {
  image: google.chat("gemini-2.5-flash"),
  pdf: google.chat("gemini-2.5-flash"),
  html: google.chat("gemini-2.5-flash"),
} as const

const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const

const SYSTEM_PROMPTS = {
  image:
    "You turn images into text, If it is a photo of a document, transcribe it. If it is not a document, describe it.",
  pdf: "You transform PDF files into text",
  html: "You transform content into markdown",
} as const

export type ExtractTextContentArgs = {
  storageId: Id<"_storage">
  filename: string
  bytes?: ArrayBuffer
  mimeType: string
}

export async function extractTextContent(
  ctx: { storage: StorageActionWriter },
  args: ExtractTextContentArgs
): Promise<string> {
  const { storageId, filename, bytes, mimeType } = args

  const url = await ctx.storage.getUrl(storageId)
  assert(url, "Failed to get URL for stored file")

  if (SUPPORTED_IMAGE_TYPES.some((type) => type === mimeType)) {
    return extractImageText(url)
  }

  if (mimeType.toLowerCase().includes("pdf")) {
    return extractPdfText(url, mimeType, filename)
  }

  if (mimeType.toLowerCase().includes("text")) {
    return extractTextFileContent(ctx, storageId, bytes, mimeType)
  }

  throw new Error(`Unsupported mime type: ${mimeType}`)
}

async function extractImageText(url: string): Promise<string> {
  const result = await generateText({
    model: AI_MODELS.image,
    system: SYSTEM_PROMPTS.image,
    messages: [
      { role: "user", content: [{ type: "image", image: new URL(url) }] },
    ],
  })

  return result.text
}

async function extractPdfText(
  url: string,
  mimeType: string,
  filename: string
): Promise<string> {
  const result = await generateText({
    model: AI_MODELS.pdf,
    system: SYSTEM_PROMPTS.pdf,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "file",
            filename,
            data: new URL(url),
            mediaType: mimeType,
          },
          {
            type: "text",
            text: "Please extract the text from this HTML file and print it without explaining you'll do so.",
          },
        ],
      },
    ],
  })

  return result.text
}

async function extractTextFileContent(
  ctx: { storage: StorageActionWriter },
  storageId: Id<"_storage">,
  bytes: ArrayBuffer | undefined,
  mimeType: string
): Promise<string> {
  const arrayBuffer =
    bytes || (await (await ctx.storage.get(storageId))?.arrayBuffer())

  if (!arrayBuffer) {
    throw new Error("Failed to get array buffer")
  }

  const text = new TextDecoder().decode(arrayBuffer)

  if (mimeType.toLowerCase() !== "text/plain") {
    const result = await generateText({
      model: AI_MODELS.html,
      system: SYSTEM_PROMPTS.html,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text,
            },
            {
              type: "text",
              text: "Please extract the text from this HTML file and print it in a markdown format without explaining you'll do so.",
            },
          ],
        },
      ],
    })

    return result.text
  }

  return text
}
