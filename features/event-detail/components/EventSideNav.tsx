"use client"

import { useEffect, useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn, formatJSTDate } from "@/lib/utils"
import { useEvent } from "@/features/event-detail/hooks/useEvent"

const MAIN_NAV = [
  { id: "event-info", label: "イベント情報" },
  { id: "users-info", label: "参加者" },
  { id: "responses-info", label: "予定一覧" },
  { id: "extract-responses", label: "集計・抽出" },
]

const HEADER_HEIGHT = 100

export default function EventSideNav({ eventId }: { eventId: string }) {
  const { data } = useEvent(eventId)
  const [activeId, setActiveId] = useState("event-info")
  const [isResponsesOpen, setIsResponsesOpen] = useState(false)

  const candidateIds = data?.candidates.map((c) => `candidate-${c.id}`) ?? []
  const isResponsesActive =
    activeId === "responses-info" || candidateIds.includes(activeId)

  useEffect(() => {
    const getSectionTop = (id: string) => {
      const el = document.getElementById(id)
      return el ? el.getBoundingClientRect().top + window.scrollY : null
    }

    const handleScroll = () => {
      const isAtBottom =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2

      if (isAtBottom) {
        setActiveId("extract-responses")
        return
      }

      const scrollY = window.scrollY + HEADER_HEIGHT

      const activeMain = MAIN_NAV
        .map(({ id }) => {
          const top = getSectionTop(id)
          return top !== null ? { id, top } : null
        })
        .filter((s): s is { id: string; top: number } => s !== null)
        .filter((s) => s.top <= scrollY)
        .at(-1)

      if (!activeMain) return

      if (activeMain.id === "responses-info" && data?.candidates.length) {
        const activeCandidate = data.candidates
          .map((c) => {
            const top = getSectionTop(`candidate-${c.id}`)
            return top !== null ? { id: `candidate-${c.id}`, top } : null
          })
          .filter((s): s is { id: string; top: number } => s !== null)
          .filter((s) => s.top <= scrollY)
          .at(-1)

        if (activeCandidate) {
          setActiveId(activeCandidate.id)
          return
        }
      }

      setActiveId(activeMain.id)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [data])

  const handleClick = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <nav className="fixed top-24 left-6 w-44 py-2 flex flex-col">
      {MAIN_NAV.map(({ id, label }) => {
        const isActive = activeId === id || (id === "responses-info" && isResponsesActive)
        return (
        <div
          key={id}
          className={cn(
            "border-l-2 pl-5 py-3 transition-colors",
            isActive ? "border-primary" : "border-border"
          )}
        >
          <div className={cn(
            "flex items-center",
            id === "responses-info" && "justify-between gap-1"
          )}>
            <button
              onClick={() => handleClick(id)}
              className={cn(
                "text-left text-base transition-colors cursor-pointer",
                activeId === id || (id === "responses-info" && isResponsesActive)
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>

            {id === "responses-info" && (
              <button
                onClick={() => setIsResponsesOpen((prev) => !prev)}
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <ChevronDown className={cn("h-4 w-4 transition-transform", isResponsesOpen && "rotate-180")} />
              </button>
            )}
          </div>

          {id === "responses-info" && isResponsesOpen && data && (
            <div className="mt-4 flex flex-col gap-3 pl-8 max-h-120 overflow-y-auto">
                {data.candidates.map((candidate) => {
                  const candidateId = `candidate-${candidate.id}`
                  const dateLabel = formatJSTDate(candidate.start_time, {
                    month: "short",
                    day: "numeric",
                    weekday: "short",
                  })
                  return (
                    <button
                      key={candidateId}
                      onClick={() => handleClick(candidateId)}
                      className={cn(
                        "text-left text-sm transition-colors cursor-pointer",
                        activeId === candidateId
                          ? "text-primary font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {dateLabel}
                    </button>
                  )
                })}
            </div>
          )}
        </div>
        )
      })}
    </nav>
  )
}
