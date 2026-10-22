"use client";

import { DownloadIcon, RotateCcwIcon, UploadIcon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { parseProgress } from "@/lib/progress/repository";
import type { Progress } from "@/lib/progress/schema";
import { useProgressStore } from "@/lib/progress/store";

type Pending = { kind: "import"; progress: Progress } | { kind: "reset" } | null;

export function ProgressSettings({ totalLessons }: { totalLessons: number }) {
  const { progress, hydrated, setFreeMode, replace, reset } = useProgressStore();
  const fileInput = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending>(null);

  if (!hydrated) return null;

  const completed = Object.values(progress.lessons).filter((l) => l.status === "completed").length;

  function exportProgress() {
    const blob = new Blob([JSON.stringify(progress, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `learnwithcybi-progressi-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    try {
      const parsed = parseProgress(JSON.parse(await file.text()));
      if (!parsed) throw new Error("formato non valido");
      setPending({ kind: "import", progress: parsed });
    } catch {
      toast.error("Il file non contiene progressi validi di LearnWithCybi.");
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function confirm() {
    if (pending?.kind === "import") {
      replace(pending.progress);
      toast.success("Progressi importati.");
    } else if (pending?.kind === "reset") {
      reset();
      toast.success("Progressi azzerati.");
    }
    setPending(null);
  }

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border p-4">
          <p className="text-muted-foreground text-sm">Lezioni completate</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {completed}
            <span className="text-muted-foreground text-base font-normal"> / {totalLessons}</span>
          </p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-muted-foreground text-sm">Punti esperienza</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{progress.xp} XP</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Modalità libera</h2>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm">
          <Checkbox
            checked={progress.settings.freeMode}
            onCheckedChange={(on) => setFreeMode(on === true)}
            className="mt-0.5"
          />
          <span>
            Sblocca tutti i moduli, senza seguire l&apos;ordine del percorso.
          </span>
        </label>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Backup dei progressi</h2>
        <p className="text-muted-foreground text-sm">
          I progressi sono salvati solo in questo browser. Esportali in un file per
          non perderli se cancelli i dati del browser o cambi dispositivo.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={exportProgress}>
            <DownloadIcon /> Esporta progressi
          </Button>
          <Button variant="outline" onClick={() => fileInput.current?.click()}>
            <UploadIcon /> Importa progressi
          </Button>
          <Button variant="destructive" onClick={() => setPending({ kind: "reset" })}>
            <RotateCcwIcon /> Azzera
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </div>
      </section>

      <Dialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pending?.kind === "reset" ? "Azzerare i progressi?" : "Importare i progressi?"}
            </DialogTitle>
            <DialogDescription>
              {pending?.kind === "reset"
                ? "Tutte le lezioni completate e i punti XP verranno cancellati da questo browser. Non si può annullare: esporta prima un backup se vuoi conservarli."
                : "I progressi attuali verranno sostituiti da quelli del file."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Annulla</DialogClose>
            <Button
              variant={pending?.kind === "reset" ? "destructive" : "default"}
              onClick={confirm}
            >
              {pending?.kind === "reset" ? "Azzera" : "Importa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
