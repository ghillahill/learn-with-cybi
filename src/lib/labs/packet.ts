// Tappe del laboratorio "Viaggio di un pacchetto" (lezione 4.6):
// DNS, three-way handshake TCP, cifratura TLS, richiesta e risposta HTTP.
// Nomi e indirizzi sono quelli riservati agli esempi (example.com, 192.0.2.x).

export type Actor = "browser" | "dns" | "server";

export const actors: Record<Actor, string> = {
  browser: "Il tuo browser",
  dns: "Resolver DNS",
  server: "Server di www.example.com",
};

export type PacketMessage = { from: Actor; to: Actor; label: string; detail?: string };

export type PacketStep = {
  id: string;
  title: string;
  layer: string;
  messages: PacketMessage[];
  explain: string;
};

export const packetSteps: PacketStep[] = [
  {
    id: "dns",
    title: "1. Chiedere la strada (DNS)",
    layer: "Applicazione · UDP, porta 53",
    messages: [
      { from: "browser", to: "dns", label: "Qual è l'indirizzo di www.example.com?", detail: "richiesta di un record A" },
      { from: "dns", to: "browser", label: "È 192.0.2.10", detail: "risposta con il record A" },
    ],
    explain:
      "Il browser conosce solo il nome del sito. Prima di tutto chiede al resolver DNS l'indirizzo IP corrispondente.",
  },
  {
    id: "tcp",
    title: "2. Stringersi la mano (TCP)",
    layer: "Trasporto · TCP, porta 443",
    messages: [
      { from: "browser", to: "server", label: "SYN", detail: "vorrei aprire una connessione" },
      { from: "server", to: "browser", label: "SYN-ACK", detail: "ricevuto, va bene anche per me" },
      { from: "browser", to: "server", label: "ACK", detail: "ricevuto: si parte" },
    ],
    explain:
      "Con l'indirizzo IP in mano, il browser apre una connessione TCP verso la porta 443, quella di HTTPS. Servono tre messaggi: il three-way handshake.",
  },
  {
    id: "tls",
    title: "3. Chiudere la busta (TLS)",
    layer: "Sopra TCP · TLS",
    messages: [
      { from: "browser", to: "server", label: "Ciao, parliamo in modo cifrato?" },
      { from: "server", to: "browser", label: "Ecco il mio certificato" },
    ],
    explain:
      "Con HTTPS, prima di mandare la richiesta browser e server preparano un canale cifrato con TLS. Come funziona lo vedremo nel modulo sulla crittografia.",
  },
  {
    id: "richiesta",
    title: "4. La richiesta (HTTP)",
    layer: "Applicazione · HTTP dentro TLS",
    messages: [{ from: "browser", to: "server", label: "GET / HTTP/1.1", detail: "Host: www.example.com" }],
    explain: "Dentro il canale cifrato, il browser chiede la pagina con il metodo GET.",
  },
  {
    id: "risposta",
    title: "5. La risposta",
    layer: "Applicazione · HTTP dentro TLS",
    messages: [{ from: "server", to: "browser", label: "200 OK", detail: "più il codice HTML della pagina" }],
    explain:
      "Il server risponde con il codice di stato 200 (tutto bene) e il contenuto della pagina. Il browser lo legge e lo disegna sullo schermo.",
  },
];
