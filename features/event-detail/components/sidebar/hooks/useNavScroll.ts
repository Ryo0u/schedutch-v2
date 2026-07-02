import { useEffect, useState } from "react"
import type { Candidate } from "@/features/event-detail/types"

const MAIN_NAV_IDS = ["event-info", "users-info", "responses-info", "extract-responses"]
const HEADER_HEIGHT = 100

export function useNavScroll(candidates: Candidate[] | undefined) {
  const [activeId, setActiveId] = useState("event-info")

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

      const activeMain = MAIN_NAV_IDS
        .map((id) => {
          const top = getSectionTop(id)
          return top !== null ? { id, top } : null
        })
        .filter((s): s is { id: string; top: number } => s !== null)
        .filter((s) => s.top <= scrollY)
        .at(-1)

      if (!activeMain) return

      if (activeMain.id === "responses-info" && candidates?.length) {
        const activeCandidate = candidates
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
  }, [candidates])

  return { activeId }
}
