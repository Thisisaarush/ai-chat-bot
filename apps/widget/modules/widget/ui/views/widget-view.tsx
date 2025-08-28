"use client"

import WidgetFooter from "../components/widget-footer"
import { WidgetAuthScreen } from "../screens/widget-auth-screen"

interface WidgetViewProps {
  organizationId: string
}

const WidgetView: React.FC<WidgetViewProps> = ({ organizationId }) => {
  return (
    <main className="min-h-screen min-w-screen flex h-full w-full flex-col overflow-hidden rounded-xl border bg-muted">
      <WidgetAuthScreen />
      {/* <WidgetFooter /> */}
    </main>
  )
}

export default WidgetView
