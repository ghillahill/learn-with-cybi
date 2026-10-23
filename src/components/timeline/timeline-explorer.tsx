"use client";

import {
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, useScroll } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  timelineCategories,
  type Source,
  type Timeline,
  type TimelineCategory,
  type TimelineEvent,
} from "@/lib/content/schema";
import { eventDecade, formatEventDate } from "@/lib/timeline/logic";
import { cn } from "@/lib/utils";
import { categoryDot, categoryLabel } from "./categories";

// Timeline orizzontale (§8.2): gli eventi scorrono in una riga divisa per
// decenni; il clic su un evento apre la sua scheda sotto la linea.
export function TimelineExplorer({ timeline }: { timeline: Timeline }) {
  const [active, setActive] = useState<TimelineCategory[]>([...timelineCategories]);
  const [selected, setSelected] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });
  const { scrollXProgress } = useScroll({ container: scrollRef });
  const reduceMotion = useReducedMotion();
  const behavior: ScrollBehavior = reduceMotion ? "auto" : "smooth";

  const sourcesById = new Map(timeline.sources.map((s) => [s.id, s]));
  const events = timeline.events.filter((e) => active.includes(e.category));
  const decades = [...new Set(events.map(eventDecade))];
  const selectedEvent = events.find((e) => e.id === selected);

  // Abilita le frecce solo se c'è ancora spazio da scorrere in quella direzione.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () =>
      setEdges({
        start: el.scrollLeft <= 1,
        end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1,
      });
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  function toggle(category: TimelineCategory) {
    setActive((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
  }

  function scrollByPage(direction: 1 | -1) {
    const el = scrollRef.current;
    el?.scrollBy({ left: direction * el.clientWidth * 0.8, behavior });
  }

  function scrollToDecade(decade: number) {
    const el = scrollRef.current;
    const target = el?.querySelector<HTMLElement>(`[data-decade="${decade}"]`);
    if (el && target) el.scrollTo({ left: target.offsetLeft, behavior });
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm" role="status">
          {events.length === 1 ? "1 evento" : `${events.length} eventi`}
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Eventi precedenti"
            disabled={edges.start}
            onClick={() => scrollByPage(-1)}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Eventi successivi"
            disabled={edges.end}
            onClick={() => scrollByPage(1)}
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </div>

      {decades.length > 1 && (
        <nav aria-label="Vai al decennio" className="flex flex-wrap gap-1">
          {decades.map((decade) => (
            <Button
              key={decade}
              variant="ghost"
              size="xs"
              className="text-muted-foreground"
              onClick={() => scrollToDecade(decade)}
            >
              {decade}
            </Button>
          ))}
        </nav>
      )}

      <div className="space-y-2">
        <div aria-hidden className="bg-border h-0.5 overflow-hidden rounded-full">
          <motion.div className="bg-primary h-full origin-left" style={{ scaleX: scrollXProgress }} />
        </div>
        <motion.div
          ref={scrollRef}
          layoutScroll
          role="region"
          aria-label="Eventi della timeline"
          tabIndex={0}
          className="focus-visible:ring-ring/50 -mx-1 overflow-x-auto rounded-md px-1 pb-4 [scrollbar-width:none] outline-none focus-visible:ring-3"
        >
          <ol className="flex w-max gap-10 pt-2">
            {events.length === 0 && (
              <li className="text-sm">Nessun evento per le categorie scelte.</li>
            )}
            <AnimatePresence initial={false} mode="popLayout">
              {decades.map((decade) => (
                <motion.li
                  key={decade}
                  layout
                  data-decade={decade}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  aria-labelledby={`decennio-${decade}`}
                >
                  <h2
                    id={`decennio-${decade}`}
                    className="sticky left-0 w-fit pb-3 text-lg font-semibold"
                  >
                    Anni {decade}
                  </h2>
                  <div className="relative">
                    <motion.div
                      aria-hidden
                      className="bg-border absolute inset-x-0 top-[6px] h-0.5 origin-left"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ root: scrollRef, once: true }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                    <ol className="flex gap-3">
                      <AnimatePresence initial={false} mode="popLayout">
                        {events
                          .filter((e) => eventDecade(e) === decade)
                          .map((event, i) => (
                            <EventCard
                              key={event.id}
                              event={event}
                              index={i}
                              selected={event.id === selected}
                              root={scrollRef}
                              onSelect={(target) => {
                                setSelected(event.id === selected ? null : event.id);
                                target.scrollIntoView({ behavior, inline: "nearest", block: "nearest" });
                              }}
                            />
                          ))}
                      </AnimatePresence>
                    </ol>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
        </motion.div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {selectedEvent ? (
          <motion.article
            key={selectedEvent.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            aria-labelledby="evento-selezionato"
            className="bg-card space-y-3 rounded-xl border p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-muted-foreground flex items-center gap-2 text-xs">
                  <span aria-hidden className={cn("size-2 rounded-full", categoryDot[selectedEvent.category])} />
                  {formatEventDate(selectedEvent.date, selectedEvent.approximate)} ·{" "}
                  {categoryLabel[selectedEvent.category]}
                </p>
                <h3 id="evento-selezionato" className="text-lg font-semibold">
                  {selectedEvent.title}
                </h3>
              </div>
              <Button variant="ghost" size="icon-sm" aria-label="Chiudi scheda" onClick={() => setSelected(null)}>
                <XIcon />
              </Button>
            </div>
            <p>{selectedEvent.description}</p>
            {selectedEvent.note && (
              <p className="text-muted-foreground flex gap-2 text-sm">
                <TriangleAlertIcon className="text-warning mt-0.5 size-4 shrink-0" aria-label="Attenzione" />
                {selectedEvent.note}
              </p>
            )}
            <EventSources sources={selectedEvent.sources.flatMap((id) => sourcesById.get(id) ?? [])} />
            {selectedEvent.lesson && (
              <Link
                href={`/moduli/${selectedEvent.lesson.module}/${selectedEvent.lesson.lesson}`}
                className="inline-flex items-center gap-1 text-sm font-medium"
              >
                Vai alla lezione <ArrowRightIcon className="size-4" />
              </Link>
            )}
          </motion.article>
        ) : (
          events.length > 0 && (
            <motion.p
              key="suggerimento"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-muted-foreground text-sm"
            >
              Scorri la linea del tempo e scegli un evento per leggerne la scheda.
            </motion.p>
          )
        )}
      </AnimatePresence>
    </div>
  );
}

function EventCard({
  event,
  index,
  selected,
  root,
  onSelect,
}: {
  event: TimelineEvent;
  index: number;
  selected: boolean;
  root: React.RefObject<HTMLDivElement | null>;
  onSelect: (target: HTMLElement) => void;
}) {
  return (
    <motion.li
      layout
      className="relative flex pt-6"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      viewport={{ root, once: true, amount: 0.3 }}
      transition={{ type: "spring", stiffness: 260, damping: 24, delay: Math.min(index, 6) * 0.04 }}
    >
      <motion.span
        aria-hidden
        className={cn(
          "ring-background absolute top-0 left-4 size-3.5 rounded-full ring-4",
          categoryDot[event.category],
        )}
        animate={{ scale: selected ? 1.4 : 1 }}
      />
      <span aria-hidden className="bg-border absolute top-3.5 left-[22px] h-2.5 w-px" />
      <motion.button
        type="button"
        aria-pressed={selected}
        onClick={(e) => onSelect(e.currentTarget)}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.97 }}
        className={cn(
          "bg-card focus-visible:ring-ring/50 flex w-60 flex-col gap-1 rounded-lg border p-3 text-left text-sm outline-none transition-colors focus-visible:ring-3",
          selected ? "border-primary bg-primary/10" : "hover:border-primary/50",
        )}
      >
        <span className="text-muted-foreground text-xs">
          {formatEventDate(event.date, event.approximate)} · {categoryLabel[event.category]}
        </span>
        <span className="line-clamp-3 font-medium">{event.title}</span>
      </motion.button>
    </motion.li>
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
