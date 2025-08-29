import { google } from "@ai-sdk/google"
import { Agent } from "@convex-dev/agent"
import { components } from "../../../_generated/api"

export const supportAgent = new Agent(components.agent, {
  name: "ai-support-agent",
  languageModel: google.chat("gemini-2.5-flash"),
  instructions:
    "You are a customer support agent and your job is to assist users with their inquiries in a helpful and informative manner.",
})
