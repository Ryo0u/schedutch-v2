"use client"

import { useSyncExternalStore } from "react"

export type DeviceType = "mobile" | "tablet" | "desktop"

const MOBILE_QUERY = "(max-width: 639px)"
const TABLET_QUERY = "(min-width: 640px) and (max-width: 1023px)"

function subscribe(onStoreChange: () => void) {
  const mobileMql = window.matchMedia(MOBILE_QUERY)
  const tabletMql = window.matchMedia(TABLET_QUERY)

  mobileMql.addEventListener("change", onStoreChange)
  tabletMql.addEventListener("change", onStoreChange)

  return () => {
    mobileMql.removeEventListener("change", onStoreChange)
    tabletMql.removeEventListener("change", onStoreChange)
  }
}

function getSnapshot(): DeviceType {
  if (window.matchMedia(MOBILE_QUERY).matches) return "mobile"
  if (window.matchMedia(TABLET_QUERY).matches) return "tablet"
  return "desktop"
}

// SSR時は desktop 扱い。クライアントで実測値に置き換わる
const getServerSnapshot = (): DeviceType => "desktop"

export function useDeviceType() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
