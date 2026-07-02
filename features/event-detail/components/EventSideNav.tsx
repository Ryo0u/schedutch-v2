"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { id: "event-info", label: "イベント情報" },
  { id: "users-info", label: "参加者" },
  { id: "responses-info", label: "予定一覧" },
  { id: "extract-responses", label: "集計・抽出" },
]

const HEADER_HEIGHT = 100

export default function EventSideNav() {
  const [activeId, setActiveId] = useState("event-info")

  useEffect(() => {
    const handleScroll = () => {
      const isAtBottom =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2

      if (isAtBottom) {
        const last = NAV_ITEMS.at(-1)
        if (last) {
          setActiveId(last.id)
          return
        }
      }

      const scrollY = window.scrollY + HEADER_HEIGHT

      const sections = NAV_ITEMS
        .map(({ id }) => {
          const el = document.getElementById(id)
          return el ? { id, top: el.offsetTop } : null
        })
        .filter((s): s is { id: string; top: number } => s !== null)

      const current = sections
        .filter((s) => s.top <= scrollY)
        .at(-1)

      if (current) setActiveId(current.id)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleClick = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <nav className="fixed top-24 left-6 w-44 border-l-2 border-border pl-5 py-2 flex flex-col gap-6">
      {NAV_ITEMS.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => handleClick(id)}
          className={cn(
            "text-left text-base transition-colors cursor-pointer",
            activeId === id
              ? "text-primary font-semibold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {label}
        </button>
      ))}
    </nav>
  )
}
