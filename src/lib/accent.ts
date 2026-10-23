"use client";

import { useSyncExternalStore } from "react";
import { ACCENTS, ACCENT_KEY, DEFAULT_ACCENT, type Accent } from "./accent-script";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-accent"],
  });
  return () => observer.disconnect();
}

function getSnapshot(): Accent {
  const value = document.documentElement.dataset.accent;
  return ACCENTS.some((a) => a.id === value) ? (value as Accent) : DEFAULT_ACCENT;
}

export function useAccent(): [Accent, (accent: Accent) => void] {
  const accent = useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_ACCENT);
  const setAccent = (next: Accent) => {
    document.documentElement.dataset.accent = next;
    try {
      localStorage.setItem(ACCENT_KEY, next);
    } catch {
      // Storage non disponibile: l'accento vale solo per questa sessione.
    }
  };
  return [accent, setAccent];
}
