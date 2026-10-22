import { CheckCircle2Icon, XCircleIcon } from "lucide-react";

export function MythVsFact({
  myth,
  fact,
  cite,
}: {
  myth: string;
  fact: string;
  cite?: React.ReactNode;
}) {
  return (
    <div className="not-prose my-6 grid gap-3 rounded-xl border p-4 sm:grid-cols-2">
      <div className="flex gap-2">
        <XCircleIcon className="text-destructive mt-0.5 size-5 shrink-0" />
        <div>
          <p className="text-destructive text-xs font-semibold tracking-wide uppercase">
            Mito
          </p>
          <p className="mt-1 text-sm">{myth}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <CheckCircle2Icon className="text-success mt-0.5 size-5 shrink-0" />
        <div>
          <p className="text-success text-xs font-semibold tracking-wide uppercase">
            Realtà
          </p>
          <p className="mt-1 text-sm">
            {fact}
            {cite}
          </p>
        </div>
      </div>
    </div>
  );
}
