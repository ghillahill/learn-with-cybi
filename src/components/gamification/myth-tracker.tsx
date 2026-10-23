"use client";

import { useEffect, useRef } from "react";
import { mythId } from "@/lib/gamification/badges";
import { useProgressStore } from "@/lib/progress/store";

// Segna come letto un blocco Mito vs Realtà quando resta visibile per un
// attimo (badge "Cacciatore di miti", §8.4).
export function MythTracker({
  lessonKey,
  myth,
  children,
}: {
  lessonKey: string;
  myth: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const hydrated = useProgressStore((s) => s.hydrated);

  useEffect(() => {
    const element = ref.current;
    if (!hydrated || !element) return;
    const id = mythId(lessonKey, myth);
    if (useProgressStore.getState().progress.mythsSeen.includes(id)) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        clearTimeout(timer);
        if (!entry.isIntersecting) return;
        timer = setTimeout(() => {
          useProgressStore.getState().markMythSeen(id);
          observer.disconnect();
        }, 1500);
      },
      { threshold: 0.6 },
    );
    observer.observe(element);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [hydrated, lessonKey, myth]);

  return (
    <div ref={ref} data-myth={mythId(lessonKey, myth)}>
      {children}
    </div>
  );
}
