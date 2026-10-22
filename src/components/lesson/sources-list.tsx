import { Badge } from "@/components/ui/badge";
import type { Source } from "@/lib/content/schema";
import { sourceAnchor } from "./cite";

const levelLabel = { A: "Fonte primaria", B: "Fonte autorevole", C: "Fonte secondaria" };

export function SourcesList({ sources }: { sources: Source[] }) {
  if (sources.length === 0) return null;
  return (
    <section aria-labelledby="fonti" className="mt-10">
      <h2 id="fonti" className="text-lg font-semibold">
        Fonti
      </h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Ogni fatto della lezione viene da queste fonti. Verificarle è già un
        esercizio di sicurezza.
      </p>
      <ol className="mt-4 space-y-3 text-sm">
        {sources.map((s, i) => (
          <li key={s.id} id={sourceAnchor(s.id)} className="flex scroll-mt-24 gap-3">
            <span className="text-muted-foreground w-6 shrink-0 text-right">
              {i + 1}.
            </span>
            <div className="min-w-0">
              {s.url ? (
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium break-words underline-offset-4 hover:underline"
                >
                  {s.title}
                </a>
              ) : (
                <span className="font-medium">{s.title}</span>
              )}
              <span className="text-muted-foreground">
                {[s.author, s.publisher, s.year].filter(Boolean).length > 0 &&
                  ` — ${[s.author, s.publisher, s.year].filter(Boolean).join(", ")}`}
              </span>
              {s.note && <p className="text-muted-foreground mt-0.5">{s.note}</p>}
              <Badge variant="outline" className="mt-1" title={levelLabel[s.level]}>
                Livello {s.level}
              </Badge>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
