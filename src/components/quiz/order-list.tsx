"use client";

import { ArrowDownIcon, ArrowUpIcon, CheckIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { moveItem } from "@/lib/quiz/shuffle";
import { cn } from "@/lib/utils";

export type OrderItem = { text: string; explain: string };

// Lista da ordinare con i pulsanti su/giù (accessibile da tastiera, niente
// trascinamento). `order` contiene gli indici originali nell'ordine attuale;
// l'ordine corretto è quello degli indici 0, 1, 2…
export function OrderList({
  items,
  order,
  onChange,
  checked,
}: {
  items: OrderItem[];
  order: number[];
  onChange: (order: number[]) => void;
  checked: boolean;
}) {
  return (
    <ol className="space-y-2">
      {order.map((itemIndex, position) => {
        const item = items[itemIndex];
        const inPlace = itemIndex === position;
        return (
          <li
            key={itemIndex}
            className={cn(
              "flex gap-3 rounded-lg border px-4 py-3 text-sm",
              checked &&
                (inPlace ? "border-success/60 bg-success/5" : "border-destructive/60 bg-destructive/5"),
            )}
          >
            <span className="text-muted-foreground w-5 shrink-0 pt-0.5 text-right font-medium">
              {position + 1}.
            </span>
            <span className="flex-1">
              <span className="flex items-start justify-between gap-2">
                <span>{item.text}</span>
                {checked &&
                  (inPlace ? (
                    <CheckIcon className="text-success size-4 shrink-0" aria-label="Al posto giusto" />
                  ) : (
                    <XIcon className="text-destructive size-4 shrink-0" aria-label="Al posto sbagliato" />
                  ))}
              </span>
              {checked && (
                <span className="text-muted-foreground mt-1 block">
                  {!inPlace && `Posizione corretta: ${itemIndex + 1}. `}
                  {item.explain}
                </span>
              )}
            </span>
            {!checked && (
              <span className="flex shrink-0 gap-1">
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label={`Sposta su: ${item.text}`}
                  disabled={position === 0}
                  onClick={() => onChange(moveItem(order, position, position - 1))}
                >
                  <ArrowUpIcon />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label={`Sposta giù: ${item.text}`}
                  disabled={position === order.length - 1}
                  onClick={() => onChange(moveItem(order, position, position + 1))}
                >
                  <ArrowDownIcon />
                </Button>
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
