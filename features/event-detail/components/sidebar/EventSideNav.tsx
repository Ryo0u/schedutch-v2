"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEvent } from "@/features/event-detail/hooks/useEvent"
import { useNavScroll } from "./hooks/useNavScroll"
import CandidateList from "./CandidateList"
import { SECTION_IDS, candidateAnchorId } from "@/features/event-detail/lib/anchors"

const MAIN_NAV = [
  { id: SECTION_IDS.eventInfo, label: "イベント情報" },
  { id: SECTION_IDS.usersInfo, label: "参加者" },
  { id: SECTION_IDS.responsesInfo, label: "予定一覧" },
  { id: SECTION_IDS.extractResponses, label: "集計・抽出" },
]

export default function EventSideNav({ eventId }: { eventId: string }) {
  const { data } = useEvent(eventId)
  const { activeId } = useNavScroll(data?.candidates)
  const [isResponsesOpen, setIsResponsesOpen] = useState(false)

  const candidateIds = data?.candidates.map((c) => candidateAnchorId(c.id)) ?? []
  const isResponsesActive =
    activeId === SECTION_IDS.responsesInfo || candidateIds.includes(activeId)

  const handleClick = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <nav className="fixed top-24 left-6 w-44 py-2 flex flex-col">
      {MAIN_NAV.map(({ id, label }) => {
        const isActive = activeId === id || (id === SECTION_IDS.responsesInfo && isResponsesActive)
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
              id === SECTION_IDS.responsesInfo && "justify-between gap-1"
            )}>
              <button
                onClick={() => handleClick(id)}
                className={cn(
                  "text-left text-base transition-colors cursor-pointer",
                  isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>

              {id === SECTION_IDS.responsesInfo && (
                <button
                  onClick={() => setIsResponsesOpen((prev) => !prev)}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <ChevronDown className={cn("h-4 w-4 transition-transform", isResponsesOpen && "rotate-180")} />
                </button>
              )}
            </div>

            {id === SECTION_IDS.responsesInfo && isResponsesOpen && data && (
              <CandidateList
                candidates={data.candidates}
                activeId={activeId}
                onClickCandidate={handleClick}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
