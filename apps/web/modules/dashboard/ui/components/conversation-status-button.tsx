import { Doc } from "@workspace/backend/convex/_generated/dataModel"
import { Button } from "@workspace/ui/components/button"
import { Hint } from "@workspace/ui/components/hint"
import { ArrowRightIcon, ArrowUpIcon, CheckIcon } from "lucide-react"

export const ConversationStatusButton = ({
  status,
  onClick,
  disabled,
}: {
  status: Doc<"conversations">["status"]
  onClick: () => void
  disabled?: boolean
}) => {
  if (status === "resolved") {
    return (
      <Hint text="Mark as unresolved">
        <Button
          onClick={onClick}
          size="sm"
          variant="outline"
          disabled={disabled}
        >
          <CheckIcon className="bg-green-400 rounded-full text-white" />
          Resolved
        </Button>
      </Hint>
    )
  }
  if (status === "escalated") {
    return (
      <Hint text="Mark as resolved">
        <Button
          onClick={onClick}
          size="sm"
          variant="outline"
          disabled={disabled}
        >
          <ArrowUpIcon className="bg-yellow-500 rounded-full text-white" />
          Escalated
        </Button>
      </Hint>
    )
  }

  return (
    <Hint text="Mark as escalated">
      <Button onClick={onClick} size="sm" variant="outline" disabled={disabled}>
        <ArrowRightIcon className="bg-red-400 rounded-full text-white" />
        Unresolved
      </Button>
    </Hint>
  )
}
