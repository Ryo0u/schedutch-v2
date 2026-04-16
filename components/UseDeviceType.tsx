"use client"

import { useState, useEffect } from "react"

export type DeviceType = "mobile" | "tablet" | "desktop"

export function useDeviceType() {
  const [device, setDevice] = useState<DeviceType>("desktop")

  useEffect(() => {
    const mobileMql = window.matchMedia("(max-width: 639px)")
    const tabletMql = window.matchMedia("(min-width: 640px) and (max-width: 1023px)")

    const getDeviceType = (): DeviceType => {
      if (mobileMql.matches) return "mobile"
      if (tabletMql.matches) return "tablet"
      return "desktop"
    }

    // 初回実行
    setDevice(getDeviceType())

    const handler = () => setDevice(getDeviceType())

    mobileMql.addEventListener("change", handler)
    tabletMql.addEventListener("change", handler)

    return () => {
      mobileMql.removeEventListener("change", handler)
      tabletMql.removeEventListener("change", handler)
    }
  }, [])

  return device
}