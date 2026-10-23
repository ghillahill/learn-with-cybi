"use client";

import { PaletteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAccent } from "@/lib/accent";
import { ACCENTS, type Accent } from "@/lib/accent-script";

export function AccentPicker() {
  const [accent, setAccent] = useAccent();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" aria-label="Cambia colore di accento" />}
      >
        <PaletteIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Accento</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={accent}
            onValueChange={(value) => setAccent(value as Accent)}
          >
            {ACCENTS.map((a) => (
              <DropdownMenuRadioItem key={a.id} value={a.id}>
                {/* data-accent locale: il pallino mostra il colore di quell'accento */}
                <span data-accent={a.id} className="bg-primary size-3 rounded-full" />
                {a.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
