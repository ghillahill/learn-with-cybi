import type { Metadata } from "next";
import { CybiBubble } from "@/components/cybi/cybi-bubble";
import { OrderingGame } from "@/components/timeline/ordering-game";
import { TimelineExplorer } from "@/components/timeline/timeline-explorer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getVisibleTimeline } from "@/lib/content/loader";

export const metadata: Metadata = { title: "Timeline" };

export default function TimelinePage() {
  const timeline = getVisibleTimeline();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Timeline</h1>
        <p className="text-muted-foreground">
          Dal 1900 a oggi: gli eventi che hanno fatto la storia della sicurezza
          informatica, ognuno con la sua fonte.
        </p>
      </header>

      {timeline.events.length === 0 ? (
        <CybiBubble mood="pensieroso">
          La timeline è ancora in revisione: torna presto!
        </CybiBubble>
      ) : (
        <Tabs defaultValue="timeline">
          <TabsList>
            <TabsTrigger value="timeline">Esplora</TabsTrigger>
            <TabsTrigger value="gioco">Metti in ordine</TabsTrigger>
          </TabsList>
          <TabsContent value="timeline" className="pt-4">
            <TimelineExplorer timeline={timeline} />
          </TabsContent>
          <TabsContent value="gioco" className="pt-4">
            <OrderingGame events={timeline.events} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
