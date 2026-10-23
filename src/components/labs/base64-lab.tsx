"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { base64Secret, decodeBase64, encodeBase64, isSecretFound } from "@/lib/labs/base64";
import { LabFeedback, LabFrame } from "./lab-frame";

const secretEncoded = encodeBase64(base64Secret.message);

// Lab della lezione 3.3: Base64 si codifica e si decodifica senza chiavi.
export function Base64Lab() {
  const [plain, setPlain] = useState("");
  const [encoded, setEncoded] = useState("");
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);

  const decoded = encoded.trim() === "" ? "" : decodeBase64(encoded);
  const found = checked && isSecretFound(answer);

  return (
    <LabFrame
      id="base64"
      title="Base64: codifica, non cifratura"
      objective="codificare una frase in Base64 e decifrare un messaggio senza conoscere nessuna chiave."
      intro="Scrivi una frase e guarda come diventa in Base64. Poi ti passo un messaggio “segreto”: riesci a leggerlo?"
      conclusion="Visto? Nessuna chiave, nessuna password: chiunque può decodificare Base64. Serve a trasportare dati, non a nasconderli."
      solved={plain.trim() !== "" && found}
    >
      <div className="space-y-2">
        <label htmlFor="b64-plain" className="font-medium">
          1. Scrivi una frase
        </label>
        <Textarea
          id="b64-plain"
          value={plain}
          onChange={(e) => setPlain(e.target.value)}
          placeholder="Ciao Cybi!"
        />
        <p className="text-muted-foreground">In Base64:</p>
        <output
          htmlFor="b64-plain"
          aria-label="Frase codificata in Base64"
          className="bg-muted block min-h-9 rounded-lg px-3 py-2 font-mono break-all"
        >
          {plain === "" ? "…" : encodeBase64(plain)}
        </output>
      </div>

      <div className="space-y-2">
        <p className="font-medium">2. Decodifica il messaggio segreto</p>
        <p>
          Copia questo testo nella casella qui sotto:{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 break-all">{secretEncoded}</code>
        </p>
        <label htmlFor="b64-encoded" className="sr-only">
          Testo in Base64 da decodificare
        </label>
        <Textarea
          id="b64-encoded"
          value={encoded}
          onChange={(e) => setEncoded(e.target.value)}
          placeholder="Incolla qui il testo in Base64"
          className="font-mono"
        />
        <output
          htmlFor="b64-encoded"
          aria-label="Testo decodificato"
          className="bg-muted block min-h-9 rounded-lg px-3 py-2"
        >
          {decoded === null ? "Questo non è Base64 valido." : decoded || "…"}
        </output>
      </div>

      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          setChecked(true);
        }}
      >
        <label htmlFor="b64-answer" className="font-medium">
          3. Qual è la parola segreta?
        </label>
        <div className="flex gap-2">
          <Input
            id="b64-answer"
            value={answer}
            autoComplete="off"
            disabled={found}
            onChange={(e) => {
              setAnswer(e.target.value);
              setChecked(false);
            }}
          />
          <Button type="submit" variant="outline" disabled={found || answer.trim() === ""}>
            Verifica
          </Button>
        </div>
        {checked && (
          <LabFeedback ok={found}>
            {found
              ? "Esatto, l'hai letta senza nessuna chiave."
              : "Non è questa. Decodifica il messaggio al punto 2 e leggi bene."}
          </LabFeedback>
        )}
        {found && plain.trim() === "" && (
          <LabFeedback ok={false}>Manca il punto 1: codifica una frase tua.</LabFeedback>
        )}
      </form>
    </LabFrame>
  );
}
