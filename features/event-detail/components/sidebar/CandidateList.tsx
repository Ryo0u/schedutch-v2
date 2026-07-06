"use client"

import { cn } from "@/lib/utils"
import { formatJSTDate } from "@/lib/datetime"
import type { Candidate } from "@/features/event-detail/types"

interface CandidateListProps {
  candidates: Candidate[]
  activeId: string
  onClickCandidate: (id: string) => void
}

export default function CandidateList({ candidates, activeId, onClickCandidate }: CandidateListProps) {
  return (
    <div className="mt-4 flex flex-col gap-3 pl-8 max-h-120 overflow-y-auto">
      {candidates.map((candidate) => {
        const candidateId = `candidate-${candidate.id}`
        const dateLabel = formatJSTDate(candidate.start_time, {
          month: "short",
          day: "numeric",
          weekday: "short",
        })
        return (
          <button
            key={candidateId}
            onClick={() => onClickCandidate(candidateId)}
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
  )
}
