import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { CSSProperties } from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Reveal transition for the recall answer panel (height + opacity). */
export function motionSafeFlip(open: boolean): CSSProperties {
  return {
    maxHeight: open ? 600 : 0,
    opacity: open ? 1 : 0,
    transform: open ? "none" : "translateY(-4px)",
  }
}
