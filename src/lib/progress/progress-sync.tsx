"use client";

import { useEffect } from "react";
import { createLocalStorageRepository } from "./repository";
import { useProgressStore } from "./store";

// Carica i progressi all'avvio e li salva a ogni modifica.
export function ProgressSync() {
  useEffect(() => {
    const repository = createLocalStorageRepository();
    let active = true;
    repository.load().then((progress) => {
      if (active) useProgressStore.getState().hydrate(progress);
    });
    const unsubscribe = useProgressStore.subscribe((state, previous) => {
      if (state.hydrated && state.progress !== previous.progress) {
        void repository.save(state.progress);
      }
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);
  return null;
}
