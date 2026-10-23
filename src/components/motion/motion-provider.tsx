"use client";

import { MotionConfig } from "motion/react";

// Con "user" Motion rispetta prefers-reduced-motion: le animazioni di
// trasformazione (spostamento, scala, rotazione) diventano istantanee.
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
