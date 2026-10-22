import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { StatusBadge } from "@/components/layout/status-badge";
import {
  LessonStatusIcon,
  ModuleGate,
  ModuleProgress,
} from "@/components/progress/lesson-progress";
import { findModule, getContent, getVisibleModules } from "@/lib/content/loader";

// Tutti i moduli, anche quelli senza lezioni visibili: Cache Components
// richiede almeno un risultato, e la pagina risponde 404 per quelli nascosti.
export function generateStaticParams() {
  return getContent().modules.map((mod) => ({ modulo: mod.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/moduli/[modulo]">): Promise<Metadata> {
  const { modulo } = await params;
  return { title: findModule(modulo)?.title };
}

// I params si leggono dentro <Suspense>, come richiesto dalla navigazione
// istantanea di Cache Components; le pagine restano prerenderizzate.
export default function ModulePage({ params }: PageProps<"/moduli/[modulo]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ModuleContent params={params} />
    </Suspense>
  );
}

async function ModuleContent({ params }: { params: PageProps<"/moduli/[modulo]">["params"] }) {
  const { modulo } = await params;
  const mod = findModule(modulo);
  if (!mod) notFound();
  const modules = getVisibleModules();

  return (
    <div className="space-y-6">
      <nav aria-label="Percorso" className="text-muted-foreground text-sm">
        <Link href="/" className="hover:underline">
          Percorso
        </Link>{" "}
        / Modulo {mod.order}
      </nav>
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{mod.title}</h1>
        <p className="text-muted-foreground">{mod.subtitle}</p>
        <p>{mod.description}</p>
      </header>
      <ModuleProgress lessonKeys={mod.lessons.map((l) => l.key)} />

      <ModuleGate
        requiredLessonKeys={mod.requires.map(
          (id) => modules.find((m) => m.id === id)?.lessons.map((l) => l.key) ?? [],
        )}
        requiredTitles={mod.requires.map(
          (id) => modules.find((m) => m.id === id)?.title ?? id,
        )}
      >
        <ol className="divide-y rounded-xl border">
          {mod.lessons.map((lesson, i) => (
            <li key={lesson.key}>
              <Link
                href={`/moduli/${mod.id}/${lesson.id}`}
                className="hover:bg-muted/50 flex items-center gap-4 px-4 py-4"
              >
                <LessonStatusIcon lessonKey={lesson.key} />
                <span className="flex-1">
                  <span className="text-muted-foreground block text-xs">
                    Lezione {mod.order}.{i + 1}
                  </span>
                  <span className="font-medium">{lesson.title}</span>
                </span>
                <StatusBadge status={lesson.status} />
                <span className="text-muted-foreground text-xs whitespace-nowrap">
                  {lesson.minutes} min · {lesson.xp} XP
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </ModuleGate>
    </div>
  );
}
