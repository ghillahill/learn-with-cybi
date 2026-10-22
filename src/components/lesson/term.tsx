"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Termine del glossario: sottolineato, mostra la definizione al passaggio
// del mouse o al tocco (§5.3).
export function Term({
  term,
  definition,
  children,
}: {
  term: string;
  definition: string;
  children?: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<span tabIndex={0} />}
        className="cursor-help underline decoration-cybi decoration-dotted decoration-2 underline-offset-4"
      >
        {children ?? term}
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-left leading-relaxed">
        <span>
          <strong>{term}</strong>: {definition}
        </span>
      </TooltipContent>
    </Tooltip>
  );
}
