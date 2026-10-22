import { ListChecksIcon } from "lucide-react";

export function KeyPoints({ children }: { children: React.ReactNode }) {
  return (
    <section className="bg-muted/50 my-6 rounded-xl border px-5 py-4">
      <h3 className="not-prose mb-2 flex items-center gap-2 text-sm font-semibold">
        <ListChecksIcon className="text-cybi size-4" />
        Punti chiave
      </h3>
      <div className="[&_ul]:my-0">{children}</div>
    </section>
  );
}
