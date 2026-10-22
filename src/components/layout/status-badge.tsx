import { Badge } from "@/components/ui/badge";
import { showDrafts } from "@/lib/content/loader";
import type { LessonStatus } from "@/lib/content/schema";

const labels: Record<LessonStatus, string> = {
  bozza: "Bozza",
  "fonti-verificate": "Fonti verificate",
  revisionata: "Revisionata",
  pubblicata: "Pubblicata",
};

// Visibile solo quando si mostrano anche le lezioni non pubblicate (§3.2).
export function StatusBadge({ status }: { status: LessonStatus }) {
  if (!showDrafts() || status === "pubblicata") return null;
  return (
    <Badge variant="outline" className="border-warning/60 text-warning">
      {labels[status]}
    </Badge>
  );
}
