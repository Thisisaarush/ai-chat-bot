"use client"

import { ChevronRightIcon, MessageSquareTextIcon } from "lucide-react"
import WidgetHeader from "../components/widget-header"
import { Button } from "@workspace/ui/components/button"
import { useAtomValue, useSetAtom } from "jotai"
import {
  organizationIdAtom,
  screenAtom,
  contactSessionIdAtomFamily,
  errorMessageAtom,
  conversationIdAtom,
} from "../../atoms/widget-atoms"
import { useMutation } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api"
import { useState } from "react"

export const WidgetSelectionScreen = () => {
  const setScreen = useSetAtom(screenAtom)
  const setErrorMessage = useSetAtom(errorMessageAtom)
  const setConversationId = useSetAtom(conversationIdAtom)

  const organizationId = useAtomValue(organizationIdAtom)
  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || "")
  )

  const createConverzations = useMutation(api.public.conversations.create)
  const [isPending, setIsPending] = useState(false)

  const handleNewConversations = async () => {
    if (!contactSessionId) {
      setScreen("auth")
      return
    }
    if (!organizationId) {
      setScreen("error")
      setErrorMessage("Missing Organization ID")
      return
    }

    setIsPending(true)

    try {
      const conversationId = await createConverzations({
        contactSessionId,
        organizationId,
      })
      setConversationId(conversationId)
      setScreen("chat")
    } catch (error) {
      setScreen("auth")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
          <p className="text-3xl">Hi there! 👋</p>
          <p className="text-lg">Let&apos;s get you started.</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col overflow-y-auto gap-y-4 p-4 ">
        <Button
          className="h-16 w-full justify-between"
          variant="outline"
          onClick={handleNewConversations}
          disabled={isPending}
        >
          <div className="flex items-center gap-x-2">
            <MessageSquareTextIcon className="size-4" />
            <span>Start Chat</span>
          </div>
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>
    </>
  )
}
