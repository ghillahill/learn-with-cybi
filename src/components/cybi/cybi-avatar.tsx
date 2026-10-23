"use client";

import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { CybiMood } from "./moods";

export type { CybiMood } from "./moods";

const glow = "stroke-cybi-glow";
const eye = "fill-cybi-glow";

function Face({ mood }: { mood: CybiMood }) {
  const line = {
    className: glow,
    strokeWidth: 3.5,
    strokeLinecap: "round" as const,
    fill: "none",
  };
  switch (mood) {
    case "felice":
      return (
        <>
          <path d="M42 61 q6 -8 12 0" {...line} />
          <path d="M66 61 q6 -8 12 0" {...line} />
          <path d="M52 70 q8 7 16 0" {...line} />
        </>
      );
    case "pensieroso":
      return (
        <>
          <circle cx="50" cy="56" r="3.5" className={eye} />
          <circle cx="74" cy="56" r="3.5" className={eye} />
          <path d="M54 72 h12" {...line} />
        </>
      );
    case "sorpreso":
      return (
        <>
          <circle cx="48" cy="58" r="5.5" className={eye} />
          <circle cx="72" cy="58" r="5.5" className={eye} />
          <circle cx="60" cy="73" r="3.5" {...line} strokeWidth={3} />
        </>
      );
    case "preoccupato":
      return (
        <>
          <path d="M42 51 L52 48" {...line} strokeWidth={3} />
          <path d="M78 51 L68 48" {...line} strokeWidth={3} />
          <circle cx="48" cy="59" r="4" className={eye} />
          <circle cx="72" cy="59" r="4" className={eye} />
          <path d="M51 74 q4.5 -4 9 0 q4.5 4 9 0" {...line} strokeWidth={3} />
        </>
      );
    case "fiero":
      return (
        <>
          <path d="M42 60 q6 -8 12 0" {...line} />
          <path d="M66 60 q6 -8 12 0" {...line} />
          <path d="M49 68 q11 11 22 0" {...line} />
        </>
      );
    case "detective":
      return (
        <>
          <circle cx="48" cy="58" r="4" className={eye} />
          <circle cx="72" cy="58" r="3.5" className={eye} />
          <circle cx="72" cy="58" r="8.5" {...line} strokeWidth={2.5} />
          <path d="M78 64 l7 7" {...line} strokeWidth={2.5} />
          <path d="M53 73 q6 3 11 0" {...line} strokeWidth={3} />
        </>
      );
  }
}

// Trasformazioni dei gruppi SVG calcolate sul loro riquadro, non sull'intero disegno.
const fillBox = { transformBox: "fill-box", transformOrigin: "50% 50%" } as const;

// Cybi: robottino con l'antenna a forma di arco di lucchetto (§4.1).
// Con `idle` l'antenna oscilla e lo schermo "sbatte le palpebre"; il cambio di
// umore è sempre animato. Il primo disegno è statico, come quello del server.
export function CybiAvatar({
  mood = "felice",
  idle = false,
  className,
  title,
}: {
  mood?: CybiMood;
  idle?: boolean;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={cn("size-14 shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <motion.path
        d="M47 32 V23 a13 13 0 0 1 26 0 V32"
        className="stroke-cybi"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        animate={idle ? { y: [0, -2, 0] } : undefined}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <circle cx="17" cy="64" r="7" className="fill-cybi opacity-70" />
      <circle cx="103" cy="64" r="7" className="fill-cybi opacity-70" />
      <rect x="18" y="30" width="84" height="72" rx="26" className="fill-cybi" />
      <rect x="29" y="42" width="62" height="44" rx="15" className="fill-cybi-screen" />
      <motion.g
        style={fillBox}
        animate={idle ? { scaleY: [1, 0.1, 1] } : undefined}
        transition={{ duration: 0.25, delay: 2, repeat: Infinity, repeatDelay: 4.5 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.g
            key={mood}
            style={fillBox}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.18 }}
          >
            <Face mood={mood} />
          </motion.g>
        </AnimatePresence>
      </motion.g>
      <AnimatePresence initial={false}>
        {mood === "fiero" && (
          <motion.path
            key="scintilla"
            d="M101 18 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z"
            className="fill-warning"
            style={fillBox}
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          />
        )}
      </AnimatePresence>
    </svg>
  );
}
