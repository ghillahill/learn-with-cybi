import { InfoIcon, ScaleIcon, TriangleAlertIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const variants = {
  info: { icon: InfoIcon, label: "Nota", tone: "border-cybi/40 bg-cybi/5", iconTone: "text-cybi" },
  warning: { icon: TriangleAlertIcon, label: "Attenzione", tone: "border-warning/50 bg-warning/5", iconTone: "text-warning" },
  legal: { icon: ScaleIcon, label: "Legge ed etica", tone: "border-destructive/40 bg-destructive/5", iconTone: "text-destructive" },
} as const;

export function Callout({
  type = "info",
  title,
  children,
}: {
  type?: keyof typeof variants;
  title?: string;
  children: React.ReactNode;
}) {
  const v = variants[type];
  const Icon = v.icon;
  return (
    <div className={cn("my-6 rounded-xl border px-5 py-4", v.tone)}>
      <p className="not-prose flex items-center gap-2 text-sm font-semibold">
        <Icon className={cn("size-4", v.iconTone)} />
        {title ?? v.label}
      </p>
      <div className="[&>p:first-child]:mt-2 [&>p:last-child]:mb-0">{children}</div>
    </div>
  );
}
