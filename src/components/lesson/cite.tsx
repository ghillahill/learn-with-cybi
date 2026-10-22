import type { Source } from "@/lib/content/schema";

export function sourceAnchor(id: string): string {
  return `fonte-${id}`;
}

// Rimando numerato a una fonte della lezione: il numero è la posizione
// della fonte nell'elenco del frontmatter.
export function Cite({ id, sources }: { id: string; sources: Source[] }) {
  const index = sources.findIndex((s) => s.id === id);
  if (index === -1) return null;
  return (
    <sup className="not-prose ml-0.5">
      <a
        href={`#${sourceAnchor(id)}`}
        className="text-cybi font-medium no-underline hover:underline"
        aria-label={`Fonte ${index + 1}: ${sources[index].title}`}
      >
        [{index + 1}]
      </a>
    </sup>
  );
}
