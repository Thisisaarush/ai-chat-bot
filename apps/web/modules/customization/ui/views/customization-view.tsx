"use client"

import { api } from "@workspace/backend/convex/_generated/api"
import { useQuery } from "convex/react"
import { Loader2Icon } from "lucide-react"
import { CustomizationForm } from "../components/customization-form"

export const CustomizationView = () => {
  const widgetSettings = useQuery(api.private.widgetSettings.getOne)

  if (widgetSettings === undefined) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-y-2 bg-muted p-8">
        <Loader2Icon className="text-muted-foreground animate-spin" />
        <p className="text-muted-foreground text-sm">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted p-8">
      <div className="max-w-screen mx-auto w-full">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-4xl">Widget Customization</h1>
          <p className="text-muted-foreground">
            Customization how your chat widget looks and behaves for your
            customers
          </p>
        </div>

        <div className="mt-8">
          <CustomizationForm initialData={widgetSettings} />
        </div>
      </div>
    </div>
  )
}
