import * as motion from "motion/react-client";
import { cn } from "@/lib/utils";
import { CybiAvatar, type CybiMood } from "./cybi-avatar";

// Il fumetto entra solo con scala e spostamento, mai con l'opacità: senza
// JavaScript il testo resta leggibile.
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
      <CybiAvatar mood={mood} idle />
      <motion.div
        initial={{ scale: 0.94, y: 6 }}
        whileInView={{ scale: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
        style={{ originX: 0, originY: 0 }}
        className="relative rounded-2xl rounded-tl-sm border border-cybi/30 bg-cybi/10 px-4 py-3 text-sm leading-relaxed [&_p]:m-0 [&_p+p]:mt-2"
      >
        {children}
      </motion.div>
    </aside>
  );
}
