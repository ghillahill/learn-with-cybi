"use client";

import { MessageCircleQuestionIcon, SendIcon, SparklesIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { MAX_MESSAGE_CHARS, MAX_MESSAGES, type ChatMessage } from "@/lib/cybi-ai/prompt";
import { cn } from "@/lib/utils";
import { CybiAvatar } from "./cybi-avatar";

// "Chiedi a Cybi" (§4.4): chat opzionale sulla lezione corrente. Il pulsante
// compare solo se il server ha una chiave API. La conversazione non si salva.
export function CybiChat({ lessonKey, lessonTitle }: { lessonKey: string; lessonTitle: string }) {
  const [enabled, setEnabled] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/cybi")
      .then((r) => (r.ok ? r.json() : { enabled: false }))
      .then((data: { enabled?: boolean }) => {
        if (active) setEnabled(data.enabled === true);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, pending]);

  if (!enabled) return null;

  const full = messages.length >= MAX_MESSAGES - 1;

  async function send() {
    const question = draft.trim();
    if (!question || pending || full) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: question }];
    setMessages(next);
    setDraft("");
    setFailure(null);
    setPending(true);
    try {
      const response = await fetch("/api/cybi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonKey, messages: next }),
      });
      const data: { reply?: string; error?: string } = await response.json().catch(() => ({}));
      if (!response.ok || !data.reply) throw new Error(data.error ?? "Qualcosa è andato storto: riprova.");
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch (e) {
      // La domanda torna nella casella, così si può riprovare.
      setMessages(messages);
      setDraft(question);
      setFailure(e instanceof Error ? e.message : "Qualcosa è andato storto: riprova.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button className="fixed right-4 bottom-4 z-40 shadow-lg" size="lg">
            <MessageCircleQuestionIcon /> Chiedi a Cybi
          </Button>
        }
      />
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2">
            <CybiAvatar className="size-8" /> Chiedi a Cybi
          </SheetTitle>
          <SheetDescription>
            Domande sulla lezione “{lessonTitle}”. Le risposte sono generate dall&apos;AI: controllale sulle fonti
            della lezione.
          </SheetDescription>
        </SheetHeader>

        <div role="log" aria-live="polite" aria-label="Conversazione con Cybi" className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && (
            <p className="text-muted-foreground text-sm">
              Non hai capito un passaggio? Vuoi un altro esempio? Chiedimelo! Non rispondo a richieste per attaccare
              sistemi reali: per quelle ci sono i laboratori simulati.
            </p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap",
                  m.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-cybi/10 border-cybi/30 rounded-bl-sm border",
                )}
              >
                {m.content}
                {m.role === "assistant" && (
                  <Badge variant="outline" className="mt-2 flex w-fit gap-1 text-[0.65rem] whitespace-normal">
                    <SparklesIcon /> Risposta generata dall&apos;AI: verifica sulle fonti della lezione
                  </Badge>
                )}
              </div>
            </div>
          ))}
          {pending && (
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <CybiAvatar mood="pensieroso" idle className="size-8" /> Cybi ci pensa…
            </p>
          )}
          <div ref={endRef} />
        </div>

        <form
          className="space-y-2 border-t p-4"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          {failure && (
            <p role="alert" className="text-destructive text-sm">
              {failure}
            </p>
          )}
          {full ? (
            <p className="text-muted-foreground text-sm">
              La conversazione è lunga: chiudi e riapri la lezione per ricominciare.
            </p>
          ) : (
            <>
              <label htmlFor="cybi-domanda" className="sr-only">
                La tua domanda
              </label>
              <Textarea
                id="cybi-domanda"
                value={draft}
                maxLength={MAX_MESSAGE_CHARS}
                placeholder="Scrivi la tua domanda…"
                disabled={pending}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
              />
              <Button type="submit" disabled={pending || draft.trim() === ""} className="w-full">
                <SendIcon /> Invia
              </Button>
            </>
          )}
        </form>
      </SheetContent>
    </Sheet>
  );
}
