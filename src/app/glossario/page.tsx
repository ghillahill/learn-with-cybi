import type { Metadata } from "next";
import { GlossaryList } from "@/components/glossary/glossary-list";
import { getGlossary } from "@/lib/content/loader";

export const metadata: Metadata = { title: "Glossario" };

export default function GlossaryPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Glossario</h1>
        <p className="text-muted-foreground">
          Tutti i termini tecnici del corso, ognuno con la sua fonte.
        </p>
      </header>
      <GlossaryList entries={getGlossary()} />
    </div>
  );
}
