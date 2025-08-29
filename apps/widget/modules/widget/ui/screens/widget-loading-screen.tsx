"use client"

import { useAtomValue, useSetAtom } from "jotai"
import {
  errorMessageAtom,
  loadingMessageAtom,
  organizationIdAtom,
  screenAtom,
  contactSessionIdAtomFamily,
} from "../../atoms/widget-atoms"
import WidgetHeader from "../components/widget-header"
import { LoaderIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useAction, useMutation } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api"

type InitStep = "org" | "session" | "settings" | "vapi" | "done"

export const WidgetLoadingScreen = ({
  organizationId,
}: {
  organizationId: string | null
}) => {
  const [step, setStep] = useState<InitStep>("org")
  const [sessionValid, setSessionValid] = useState<boolean>(false)

  const loadingMessage = useAtomValue(loadingMessageAtom)
  const setOrganizationId = useSetAtom(organizationIdAtom)
  const setLoadingMessage = useSetAtom(loadingMessageAtom)
  const setErrorMessage = useSetAtom(errorMessageAtom)
  const setScreen = useSetAtom(screenAtom)

  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || "")
  )

  // 1. Validate Organization
  const validateOrganization = useAction(api.public.organizations.validate)
  useEffect(() => {
    if (step !== "org") return

    setLoadingMessage("Validating organization...")

    if (!organizationId) {
      setErrorMessage("Organization ID is missing.")
      setScreen("error")
      return
    }

    setLoadingMessage("Verifying organization...")

    validateOrganization({ organizationId })
      .then((result) => {
        if (result.valid) {
          setOrganizationId(organizationId)
          setStep("session")
        } else {
          setErrorMessage(result.reason || "Invalid organization.")
          setScreen("error")
        }
      })
      .catch((error) => {
        setErrorMessage(error.message || "Unable to validate organization.")
        setScreen("error")
      })
  }, [
    step,
    organizationId,
    setErrorMessage,
    setScreen,
    setOrganizationId,
    setStep,
    validateOrganization,
    setLoadingMessage,
  ])

  // 2. Validate Session
  const validateContactSession = useMutation(
    api.public.contactSessions.validate
  )
  useEffect(() => {
    if (step !== "session") return

    setLoadingMessage("Looking for contact session...")

    if (!contactSessionId) {
      setSessionValid(false)
      setStep("done")
      return
    }

    setLoadingMessage("Validating session...")

    validateContactSession({
      contactSessionId,
    })
      .then((result) => {
        setSessionValid(result.valid)
        setStep("done")
      })
      .catch((error) => {
        setSessionValid(false)
        setStep("done")
      })
  }, [step, contactSessionId, validateContactSession, setLoadingMessage])

  useEffect(() => {
    if (step !== "done") return

    const hasValidSession = contactSessionId && sessionValid
    setScreen(hasValidSession ? "selection" : "auth")
  }, [step, contactSessionId, sessionValid, setScreen])

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
          <p className="text-3xl">Hi there! 👋</p>
          <p className="text-lg">Let&apos;s get you started.</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col items-center justify-center gap-y-4 p-4 text-muted-foreground">
        <LoaderIcon className="animate-spin" />
        <p className="text-sm">{loadingMessage || "Loading..."} </p>
      </div>
    </>
  )
}
