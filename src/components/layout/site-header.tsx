import Link from "next/link";
import { CybiAvatar } from "@/components/cybi/cybi-avatar";
import { XpBadge } from "@/components/progress/lesson-progress";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";

const links = [
  { href: "/", label: "Percorso" },
  { href: "/glossario", label: "Glossario" },
  { href: "/progressi", label: "Progressi" },
];

export function SiteHeader() {
  return (
    <header className="bg-background/90 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-2 px-4">
        <Link href="/" className="mr-auto flex items-center gap-2 font-semibold">
          <CybiAvatar className="size-8" />
          <span className="hidden sm:inline">LearnWithCybi</span>
        </Link>
        <nav aria-label="Navigazione principale" className="flex items-center">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <span className="hidden sm:contents">
          <XpBadge />
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}
