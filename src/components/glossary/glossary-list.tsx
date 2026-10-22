"use client";

import { SearchIcon } from "lucide-react";
import { useState } from "react";
import type { GlossaryEntry } from "@/lib/content/schema";

export function GlossaryList({ entries }: { entries: GlossaryEntry[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const visible = entries
    .filter((e) => !q || e.term.toLowerCase().includes(q) || e.definition.toLowerCase().includes(q))
    .sort((a, b) => a.term.localeCompare(b.term, "it"));

  return (
    <div className="space-y-6">
      <label className="relative block">
        <span className="sr-only">Cerca nel glossario</span>
        <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca un termine…"
          className="border-input bg-background focus-visible:ring-ring/50 h-10 w-full rounded-lg border pr-3 pl-9 text-sm outline-none focus-visible:ring-3"
        />
      </label>
      {visible.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nessun termine trovato.</p>
      ) : (
        <dl className="divide-y rounded-xl border">
          {visible.map((entry) => (
            <div key={entry.id} id={entry.id} className="scroll-mt-24 px-4 py-4">
              <dt className="font-semibold">{entry.term}</dt>
              <dd className="mt-1 text-sm">{entry.definition}</dd>
              <dd className="text-muted-foreground mt-2 text-xs">
                Fonte:{" "}
                {entry.sources.map((s, i) => (
                  <span key={s.id}>
                    {i > 0 && "; "}
                    {s.url ? (
                      <a href={s.url} target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">
                        {s.title}
                      </a>
                    ) : (
                      s.title
                    )}{" "}
                    (livello {s.level})
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
