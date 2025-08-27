"use client"

import WidgetView from "@/modules/widget/ui/views/widget-view"
import { use } from "react"

interface PageProps {
  searchParams: Promise<{
    organizationId: string
  }>
}

export default function Page({ searchParams }: PageProps) {
  const { organizationId } = use(searchParams)

  return <WidgetView organizationId={organizationId} />
}
