import type { Metadata } from "next";
import { ProgressSettings } from "@/components/progress/progress-settings";
import { getVisibleModules } from "@/lib/content/loader";

export const metadata: Metadata = { title: "Progressi" };

export default function ProgressPage() {
  const totalLessons = getVisibleModules().reduce((n, m) => n + m.lessons.length, 0);
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">I tuoi progressi</h1>
      </header>
      <ProgressSettings totalLessons={totalLessons} />
    </div>
  );
}
