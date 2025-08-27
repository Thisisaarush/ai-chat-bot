import { cn } from "@workspace/ui/lib/utils"

export default function WidgetHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <header className={cn("bg-primary p-4 text-primary-foreground", className)}>
      {children}
    </header>
  )
}
