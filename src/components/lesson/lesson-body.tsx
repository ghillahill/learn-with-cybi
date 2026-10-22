import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { CybiBubble } from "@/components/cybi/cybi-bubble";
import type { CybiMood } from "@/components/cybi/cybi-avatar";
import type { GlossaryEntry, Source } from "@/lib/content/schema";
import { Callout } from "./callout";
import { Cite } from "./cite";
import { KeyPoints } from "./key-points";
import { MythVsFact } from "./myth-vs-fact";
import { Term } from "./term";

// Compila il corpo MDX lato server e collega i componenti della lezione
// alle sue fonti e al glossario (§7.3).
export async function LessonBody({
  body,
  sources,
  glossary,
}: {
  body: string;
  sources: Source[];
  glossary: GlossaryEntry[];
}) {
  const { default: MDXContent } = await evaluate(body, { ...runtime });
  const glossaryById = new Map(glossary.map((entry) => [entry.id, entry]));

  const components = {
    Cybi: ({ mood, children }: { mood?: CybiMood; children: React.ReactNode }) => (
      <CybiBubble mood={mood}>{children}</CybiBubble>
    ),
    Cite: ({ id }: { id: string }) => <Cite id={id} sources={sources} />,
    Term: ({ id, children }: { id: string; children?: React.ReactNode }) => {
      const entry = glossaryById.get(id);
      if (!entry) return <>{children}</>;
      return (
        <Term term={entry.term} definition={entry.definition}>
          {children}
        </Term>
      );
    },
    MythVsFact: ({
      myth,
      fact,
      source,
    }: {
      myth: string;
      fact: string;
      source?: string;
    }) => (
      <MythVsFact
        myth={myth}
        fact={fact}
        cite={source ? <Cite id={source} sources={sources} /> : undefined}
      />
    ),
    KeyPoints,
    Callout,
  };

  return (
    <div className="prose prose-neutral dark:prose-invert prose-a:text-cybi max-w-none">
      <MDXContent components={components} />
    </div>
  );
}
