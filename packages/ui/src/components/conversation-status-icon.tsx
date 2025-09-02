import { ArrowRightIcon, ArrowUpIcon, CheckIcon } from "lucide-react"

interface ConversationStatusIconProps {
  status: "unresolved" | "escalated" | "resolved"
}

const statusConfig = {
  resolved: {
    icon: CheckIcon,
    bgColor: "bg-green-500",
  },
  unresolved: {
    icon: ArrowRightIcon,
    bgColor: "bg-destructive",
  },
  escalated: {
    icon: ArrowUpIcon,
    bgColor: "bg-yellow-500",
  },
} as const

export const ConversationStatusIcon = ({
  status,
}: ConversationStatusIconProps) => {
  const { icon: Icon, bgColor } = statusConfig[status]

  return (
    <div
      className={`flex h-6 w-6 p-1 items-center justify-center rounded-full ${bgColor}`}
    >
      <Icon className="h-4 w-4 text-white" />
    </div>
  )
}
