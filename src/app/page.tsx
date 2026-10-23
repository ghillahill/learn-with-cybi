import { ClockIcon } from "lucide-react";
import Link from "next/link";
import { CybiBubble } from "@/components/cybi/cybi-bubble";
import { ModuleGate, ModuleProgress } from "@/components/progress/lesson-progress";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getVisibleModules } from "@/lib/content/loader";

export default function Home() {
  const modules = getVisibleModules();
  const lessonKeysOf = (id: string) =>
    modules.find((m) => m.id === id)?.lessons.map((l) => l.key) ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Il tuo percorso</h1>
        <CybiBubble mood="felice">
          Ciao! Sono Cybi. Impareremo la cybersecurity insieme, partendo da zero:
          prima la storia, poi le basi. Ogni lezione ha le sue fonti, così puoi
          verificare tutto quello che ti racconto.
        </CybiBubble>
      </div>

      {modules.length === 0 ? (
        <p className="text-muted-foreground">
          Nessuna lezione pubblicata, per ora. Torna presto!
        </p>
      ) : (
        <ol className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {modules.map((mod) => (
            <li key={mod.id}>
              <Card className="h-full">
                <CardHeader>
                  <CardDescription>Modulo {mod.order}</CardDescription>
                  <CardTitle className="text-lg">{mod.title}</CardTitle>
                  <CardDescription>{mod.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">{mod.description}</p>
                  <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                    <ClockIcon className="size-3.5" />
                    {mod.lessons.length} lezioni · circa {mod.estimatedMinutes} minuti
                  </p>
                  <ModuleProgress lessonKeys={mod.lessons.map((l) => l.key)} />
                </CardContent>
                <CardFooter>
                  <ModuleGate
                    requiredLessonKeys={mod.requires.map(lessonKeysOf)}
                    requiredTitles={mod.requires.map(
                      (id) => modules.find((m) => m.id === id)?.title ?? id,
                    )}
                  >
                    <Link href={`/moduli/${mod.id}`} className={buttonVariants()}>
                      Apri il modulo
                    </Link>
                  </ModuleGate>
                </CardFooter>
              </Card>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
