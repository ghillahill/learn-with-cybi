"use client";

import { ArrowRightIcon, TriangleAlertIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  timelineCategories,
  type Source,
  type Timeline,
  type TimelineCategory,
} from "@/lib/content/schema";
import { eventDecade, formatEventDate } from "@/lib/timeline/logic";
import { cn } from "@/lib/utils";
import { categoryDot, categoryLabel } from "./categories";

export function TimelineExplorer({ timeline }: { timeline: Timeline }) {
  const [active, setActive] = useState<TimelineCategory[]>([...timelineCategories]);
  const sourcesById = new Map(timeline.sources.map((s) => [s.id, s]));
  const events = timeline.events.filter((e) => active.includes(e.category));
  const decades = [...new Set(events.map(eventDecade))];

  function toggle(category: TimelineCategory) {
    setActive((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
  }

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="text-muted-foreground mb-2 text-sm">Filtra per categoria</legend>
        <div className="flex flex-wrap gap-2">
          {timelineCategories.map((category) => {
            const on = active.includes(category);
            return (
              <Button
                key={category}
                variant={on ? "secondary" : "outline"}
                size="sm"
                aria-pressed={on}
                onClick={() => toggle(category)}
                className={cn(!on && "text-muted-foreground")}
              >
                <span
                  aria-hidden
                  className={cn("size-2 rounded-full", on ? categoryDot[category] : "bg-muted-foreground/40")}
                />
                {categoryLabel[category]}
              </Button>
            );
          })}
        </div>
      </fieldset>

      <p className="text-muted-foreground text-sm" role="status">
        {events.length === 1 ? "1 evento" : `${events.length} eventi`}
      </p>

      {events.length === 0 ? (
        <p className="text-sm">Nessun evento per le categorie scelte.</p>
      ) : (
        <div className="space-y-8">
          {decades.map((decade) => (
            <section key={decade} aria-labelledby={`decennio-${decade}`}>
              <h2 id={`decennio-${decade}`} className="text-lg font-semibold">
                Anni {decade}
              </h2>
              <Accordion multiple className="mt-3 border-l-2 pl-5">
                {events
                  .filter((e) => eventDecade(e) === decade)
                  .map((event) => (
                    <AccordionItem key={event.id} value={event.id} className="relative not-last:border-b-0">
                      <span
                        aria-hidden
                        className={cn(
                          "ring-background absolute top-4 -left-[27px] size-3 rounded-full ring-4",
                          categoryDot[event.category],
                        )}
                      />
                      <AccordionTrigger className="gap-3">
                        <span className="flex flex-col gap-0.5">
                          <span className="text-muted-foreground text-xs font-normal">
                            {formatEventDate(event.date, event.approximate)} ·{" "}
                            {categoryLabel[event.category]}
                          </span>
                          <span>{event.title}</span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p>{event.description}</p>
                        {event.note && (
                          <p className="text-muted-foreground flex gap-2">
                            <TriangleAlertIcon className="text-warning mt-0.5 size-4 shrink-0" aria-label="Attenzione" />
                            {event.note}
                          </p>
                        )}
                        <EventSources sources={event.sources.flatMap((id) => sourcesById.get(id) ?? [])} />
                        {event.lesson && (
                          <Link
                            href={`/moduli/${event.lesson.module}/${event.lesson.lesson}`}
                            className="inline-flex items-center gap-1 font-medium"
                          >
                            Vai alla lezione <ArrowRightIcon className="size-4" />
                          </Link>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
              </Accordion>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function EventSources({ sources }: { sources: Source[] }) {
  return (
    <p className="text-muted-foreground text-xs">
      {sources.length === 1 ? "Fonte: " : "Fonti: "}
      {sources.map((s, i) => (
        <span key={s.id}>
          {i > 0 && "; "}
          {s.url ? (
            <a href={s.url} target="_blank" rel="noreferrer">
              {s.title}
            </a>
          ) : (
            s.title
          )}
          {[s.author, s.publisher, s.year].filter(Boolean).length > 0 &&
            ` — ${[s.author, s.publisher, s.year].filter(Boolean).join(", ")}`}{" "}
          (livello {s.level})
        </span>
      ))}
    </p>
  );
}
