import { cn } from "@/lib/utils";
import { CybiAvatar, type CybiMood } from "./cybi-avatar";

export function CybiBubble({
  mood = "felice",
  children,
  className,
}: {
  mood?: CybiMood;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <aside
      aria-label="Cybi dice"
      className={cn("not-prose my-6 flex items-start gap-3", className)}
    >
      <CybiAvatar mood={mood} />
      <div className="relative rounded-2xl rounded-tl-sm border border-cybi/30 bg-cybi/10 px-4 py-3 text-sm leading-relaxed [&_p]:m-0 [&_p+p]:mt-2">
        {children}
      </div>
    </aside>
  );
}
