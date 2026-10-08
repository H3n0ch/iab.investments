'use client'

import { useEffect } from 'react'
import { track } from '@/lib/track'

/** Fires one Plausible event when a server-rendered page is shown (e.g. the DOI confirmation) */
export function TrackOnMount({ event, props }: { event: string; props?: Record<string, string> }) {
  const key = JSON.stringify(props ?? {})
  useEffect(() => {
    track(event, JSON.parse(key))
  }, [event, key])
  return null
}
