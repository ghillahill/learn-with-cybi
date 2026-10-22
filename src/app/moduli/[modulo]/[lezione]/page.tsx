import { ArrowLeftIcon, ArrowRightIcon, TargetIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LessonBody } from "@/components/lesson/lesson-body";
import { SourcesList } from "@/components/lesson/sources-list";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { StatusBadge } from "@/components/layout/status-badge";
import {
  CompleteLessonButton,
  LessonStarter,
  ModuleGate,
} from "@/components/progress/lesson-progress";
import { LessonQuiz } from "@/components/quiz/lesson-quiz";
import { buttonVariants } from "@/components/ui/button";
import {
  findLesson,
  getContent,
  getGlossary,
  getVisibleModules,
} from "@/lib/content/loader";

// Tutte le lezioni, anche quelle non pubblicate: la pagina risponde 404
// per quelle nascoste (vedi la pagina del modulo).
export function generateStaticParams() {
  return getContent().modules.flatMap((mod) =>
    mod.lessons.map((lesson) => ({ modulo: mod.id, lezione: lesson.id })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/moduli/[modulo]/[lezione]">): Promise<Metadata> {
  const { modulo, lezione } = await params;
  return { title: findLesson(modulo, lezione)?.lesson.title };
}

// I params si leggono dentro <Suspense>, come richiesto dalla navigazione
// istantanea di Cache Components; le pagine restano prerenderizzate.
export default function LessonPage({ params }: PageProps<"/moduli/[modulo]/[lezione]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <LessonContent params={params} />
    </Suspense>
  );
}

async function LessonContent({ params }: { params: PageProps<"/moduli/[modulo]/[lezione]">["params"] }) {
  const { modulo, lezione } = await params;
  const found = findLesson(modulo, lezione);
  if (!found) notFound();
  const { module: mod, lesson, index } = found;
  const modules = getVisibleModules();
  const prev = mod.lessons[index - 1];
  const next = mod.lessons[index + 1];

  return (
    <article className="space-y-6">
      <nav aria-label="Percorso" className="text-muted-foreground text-sm">
        <Link href="/" className="hover:underline">
          Percorso
        </Link>{" "}
        /{" "}
        <Link href={`/moduli/${mod.id}`} className="hover:underline">
          {mod.title}
        </Link>
      </nav>

      <header className="space-y-2">
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          Lezione {mod.order}.{index + 1} · {lesson.minutes} min · {lesson.xp} XP
          <StatusBadge status={lesson.status} />
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{lesson.title}</h1>
      </header>

      <ModuleGate
        requiredLessonKeys={mod.requires.map(
          (id) => modules.find((m) => m.id === id)?.lessons.map((l) => l.key) ?? [],
        )}
        requiredTitles={mod.requires.map(
          (id) => modules.find((m) => m.id === id)?.title ?? id,
        )}
      >
        <LessonStarter lessonKey={lesson.key} />

        <section aria-labelledby="obiettivi" className="bg-muted/40 rounded-xl border p-4">
          <h2 id="obiettivi" className="flex items-center gap-2 text-sm font-semibold">
            <TargetIcon className="text-cybi size-4" /> Alla fine saprai
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {lesson.objectives.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </section>

        <LessonBody body={lesson.body} sources={lesson.sources} glossary={getGlossary()} />

        {lesson.quizData ? (
          <LessonQuiz quiz={lesson.quizData} lessonKey={lesson.key} xp={lesson.xp} />
        ) : (
          <div className="mt-8">
            <CompleteLessonButton lessonKey={lesson.key} xp={lesson.xp} />
          </div>
        )}

        <SourcesList sources={lesson.sources} />
      </ModuleGate>

      <nav aria-label="Lezioni" className="flex justify-between gap-4 border-t pt-6">
        {prev ? (
          <Link
            href={`/moduli/${mod.id}/${prev.id}`}
            className={buttonVariants({ variant: "outline" })}
          >
            <ArrowLeftIcon /> Precedente
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/moduli/${mod.id}/${next.id}`} className={buttonVariants()}>
            Lezione successiva <ArrowRightIcon />
          </Link>
        ) : (
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Torna al percorso
          </Link>
        )}
      </nav>
    </article>
  );
}
