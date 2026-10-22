import path from "node:path";
import { LESSON_COMPONENTS } from "./keys";
import type { Content } from "./loader";
import type { Source } from "./schema";

export type CheckIssue = { file: string; message: string };

const CITE = /<Cite\s+id="([^"]+)"/g;
const TERM = /<Term\s+id="([^"]+)"/g;
const MYTH_SOURCE = /<MythVsFact[^>]*\bsource="([^"]+)"/g;
const COMPONENT = /<([A-Z][A-Za-z0-9]*)/g;

function idsFrom(body: string, pattern: RegExp): string[] {
  return [...body.matchAll(pattern)].map((m) => m[1]);
}

function onlyLevelC(sources: Source[]): boolean {
  return sources.length > 0 && sources.every((s) => s.level === "C");
}

// Controlli oltre allo schema Zod (§7.5): riferimenti incrociati,
// stato di verifica, livello delle fonti, sintassi MDX.
export async function checkContent(content: Content): Promise<CheckIssue[]> {
  // Import dinamico: @mdx-js/mdx è solo ESM e lo script gira anche fuori da Next.
  const { compile } = await import("@mdx-js/mdx");
  const issues: CheckIssue[] = [];
  const glossaryIds = new Set(content.glossary.map((e) => e.id));
  const allowed = new Set<string>(LESSON_COMPONENTS);

  for (const entry of content.glossary) {
    if (onlyLevelC(entry.sources)) {
      issues.push({
        file: "content/glossary.yaml",
        message: `voce "${entry.id}": solo fonti di livello C`,
      });
    }
  }

  for (const mod of content.modules) {
    for (const lesson of mod.lessons) {
      const file = path.relative(process.cwd(), lesson.file);
      const report = (message: string) => issues.push({ file, message });
      const sourceIds = new Set(lesson.sources.map((s) => s.id));

      for (const id of [
        ...idsFrom(lesson.body, CITE),
        ...idsFrom(lesson.body, MYTH_SOURCE),
      ]) {
        if (!sourceIds.has(id)) report(`fonte "${id}" citata ma non elencata`);
      }
      for (const id of idsFrom(lesson.body, TERM)) {
        if (!glossaryIds.has(id)) report(`termine "${id}" assente dal glossario`);
      }
      for (const name of new Set(idsFrom(lesson.body, COMPONENT))) {
        if (!allowed.has(name)) report(`componente sconosciuto <${name}>`);
      }
      if (lesson.status !== "bozza" && !lesson.lastVerified) {
        report(`stato "${lesson.status}" senza lastVerified`);
      }
      if (onlyLevelC(lesson.sources)) report("solo fonti di livello C");

      try {
        await compile(lesson.body);
      } catch (err) {
        report(`MDX non valido: ${(err as Error).message}`);
      }
    }
  }

  return issues;
}
