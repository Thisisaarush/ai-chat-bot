"use client"

import { ScrollArea } from "@workspace/ui/components/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { usePaginatedQuery } from "convex/react"
import {
  ListIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckIcon,
  CornerUpLeftIcon,
} from "lucide-react"
import { api } from "@workspace/backend/convex/_generated/api"
import { getCountryFlagUrl, getCountryFromTimezone } from "@/lib/country-utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@workspace/ui/lib/utils"
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar"
import { formatDistanceToNow } from "date-fns"
import { ConversationStatusIcon } from "@workspace/ui/components/conversation-status-icon"
import { useAtomValue, useSetAtom } from "jotai/react"
import { statusFilterAtom } from "../../atoms"
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger"
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll"

export const ConversationsPanel = () => {
  const pathname = usePathname()

  const statusFilter = useAtomValue(statusFilterAtom)
  const setStatusFilter = useSetAtom(statusFilterAtom)

  const conversations = usePaginatedQuery(
    api.private.conversations.getMany,
    {
      status: statusFilter === "all" ? undefined : statusFilter,
    },
    {
      initialNumItems: 10,
    }
  )

  const {
    canLoadMore,
    handleLoadMore,
    isLoadingFirstPage,
    isLoadingMore,
    topElementRef,
  } = useInfiniteScroll({
    status: conversations.status,
    loadMore: conversations.loadMore,
    loadSize: 10,
  })

  return (
    <div className="flex h-full w-full flex-col bg-background text-sidebar-foreground">
      <div className="flex flex-col gap-4 border-b p-2">
        <Select
          defaultValue="all"
          onValueChange={(value) => {
            setStatusFilter(
              value as "unresolved" | "escalated" | "resolved" | "all"
            )
          }}
          value={statusFilter}
        >
          <SelectTrigger className="h-8 border-none px-2 shadow-none ring-0 hover:bg-accent hover:text-accent-foreground focus-visible:ring-0">
            <SelectValue placeholder="Filter">
              <div className="flex items-center gap-2">
                <ListIcon className="size-4" />
                <span>{statusFilter}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <ListIcon className="size-4" />
                <span>All</span>
              </div>
            </SelectItem>
            <SelectItem value="escalated">
              <div className="flex items-center gap-2">
                <ArrowUpIcon className="size-4" />
                <span>Escalated</span>
              </div>
            </SelectItem>
            <SelectItem value="unresolved">
              <div className="flex items-center gap-2">
                <ArrowRightIcon className="size-4" />
                <span>Unresolved</span>
              </div>
            </SelectItem>
            <SelectItem value="resolved">
              <div className="flex items-center gap-2">
                <CheckIcon className="size-4" />
                <span>Resolved</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isLoadingFirstPage ? (
        <SkeletonConversations />
      ) : (
        <ScrollArea className="max-h-[calc(100vh-53px)]">
          <div className="flex w-full flex-1 flex-col text-sm">
            {conversations.results.map((conversation) => {
              const isLastMessageFromOperator =
                conversation?.lastMessage?.message &&
                conversation?.lastMessage?.message.role !== "user"

              const country = getCountryFromTimezone(
                conversation.contactSession.metadata?.timezone
              )

              const countryFlagUrl = country?.code
                ? getCountryFlagUrl(country.code)
                : undefined

              return (
                <Link
                  href={`/conversations/${conversation._id}`}
                  key={conversation._id}
                  className={cn(
                    "flex relative cursor-pointer items-start gap-3 border-b p-4 py-5 text-sm leading-tight hover:bg-accent hover:text-accent-foreground",
                    pathname === `/conversations/${conversation._id}` &&
                      "bg-accent text-accent-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "-translate-y-1/2 absolute top-1/2 left-0 h-[64%] w-1 rounded-r-full bg-neutral-300 opacity-0 transition-opacity",
                      pathname === `/conversations/${conversation._id}` &&
                        "opacity-100"
                    )}
                  />

                  <DicebearAvatar
                    seed={conversation.contactSession._id}
                    badgeImageUrl={countryFlagUrl}
                    size={40}
                    className="shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex w-full items-center gap-2">
                      <span className="truncate font-bold">
                        {conversation.contactSession?.name}
                      </span>
                      <span className="ml-auto shrink-0 text-muted-foreground text-xs">
                        {formatDistanceToNow(conversation._creationTime)}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between gap-2">
                      <div className="flex w-0 grow items-center gap-1">
                        {isLastMessageFromOperator && (
                          <CornerUpLeftIcon className="size-3 shrink-0 text-muted-foreground" />
                        )}
                        <span
                          className={cn(
                            "line-clamp-1 text-muted-foreground text-xs",
                            !isLastMessageFromOperator && "font-bold text-black"
                          )}
                        >
                          {conversation.lastMessage?.text}
                        </span>
                      </div>
                      <ConversationStatusIcon status={conversation.status} />
                    </div>
                  </div>
                </Link>
              )
            })}
            <InfiniteScrollTrigger
              canLoadMore={canLoadMore}
              isLoadingMore={isLoadingMore}
              onLoadMore={handleLoadMore}
              ref={topElementRef}
            />
          </div>
        </ScrollArea>
      )}
    </div>
  )
}

export const SkeletonConversations = () => {
  return (
    <div className="flex w-full flex-col">
      {Array.from({ length: 10 }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center gap-3 border-b p-4 py-5"
        >
          <div className="h-10 w-10 rounded-full bg-neutral-300" />
          <div className="flex-1">
            <div className="h-4 w-1/2 rounded bg-neutral-300" />
            <div className="mt-1 h-3 w-full rounded bg-neutral-300" />
          </div>
        </div>
      ))}
    </div>
  )
}
