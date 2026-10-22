"use client";

import { ShuffleIcon } from "lucide-react";
import { useState } from "react";
import { CybiBubble } from "@/components/cybi/cybi-bubble";
import { OrderList } from "@/components/quiz/order-list";
import { Button } from "@/components/ui/button";
import type { TimelineEvent } from "@/lib/content/schema";
import { shuffledIndexes } from "@/lib/quiz/shuffle";
import { formatEventDate, pickOrderingRound } from "@/lib/timeline/logic";

const ROUND_SIZE = 5;

// Mini-gioco "Metti in ordine" (§8.2): 5 eventi casuali da ordinare.
// Il round si crea al clic, così il rendering del server resta deterministico.
export function OrderingGame({ events }: { events: TimelineEvent[] }) {
  const [round, setRound] = useState<TimelineEvent[] | null>(null);
  const [order, setOrder] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);

  function start() {
    const next = pickOrderingRound(events, ROUND_SIZE);
    setRound(next);
    setOrder(shuffledIndexes(next.length));
    setChecked(false);
  }

  if (!round) {
    return (
      <div className="space-y-4">
        <CybiBubble mood="detective">
          Ti do {ROUND_SIZE} eventi a caso dalla timeline: mettili in ordine, dal più
          antico al più recente. Niente date, solo memoria e ragionamento!
        </CybiBubble>
        <Button onClick={start} disabled={events.length < ROUND_SIZE}>
          Inizia
        </Button>
      </div>
    );
  }

  const right = order.filter((itemIndex, position) => itemIndex === position).length;
  const items = round.map((event) => {
    const date = formatEventDate(event.date, event.approximate);
    return {
      text: event.title,
      explain: `${date.charAt(0).toUpperCase()}${date.slice(1)}. ${event.description}`,
    };
  });

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Dal più antico (in alto) al più recente (in basso).
      </p>
      <OrderList items={items} order={order} onChange={setOrder} checked={checked} />
      {checked && (
        <CybiBubble mood={right === round.length ? "fiero" : "pensieroso"}>
          {right === round.length
            ? "Perfetto, tutti al posto giusto! Sei un vero archivista del tempo."
            : `${right} su ${round.length} al posto giusto. Leggi le date e riprova con una nuova partita.`}
        </CybiBubble>
      )}
      <div className="flex justify-end gap-2">
        {checked ? (
          <Button onClick={start}>
            <ShuffleIcon /> Nuova partita
          </Button>
        ) : (
          <Button onClick={() => setChecked(true)}>Verifica</Button>
        )}
      </div>
    </div>
  );
}
