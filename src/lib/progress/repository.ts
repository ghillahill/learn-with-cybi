import { emptyProgress, progressSchema, type Progress } from "./schema";

// Astrazione sul salvataggio: oggi localStorage, domani un backend,
// senza toccare i componenti (§6.3).
export interface ProgressRepository {
  load(): Promise<Progress>;
  save(progress: Progress): Promise<void>;
}

export const STORAGE_KEY = "lwc:progress:v1";

export function parseProgress(raw: unknown): Progress | null {
  const result = progressSchema.safeParse(raw);
  return result.success ? result.data : null;
}

export function createLocalStorageRepository(
  key: string = STORAGE_KEY,
): ProgressRepository {
  return {
    async load() {
      try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return emptyProgress();
        return parseProgress(JSON.parse(raw)) ?? emptyProgress();
      } catch {
        return emptyProgress();
      }
    },
    async save(progress) {
      try {
        window.localStorage.setItem(key, JSON.stringify(progress));
      } catch {
        // Storage non disponibile (navigazione privata, quota piena):
        // i progressi restano in memoria per questa sessione.
      }
    },
  };
}
