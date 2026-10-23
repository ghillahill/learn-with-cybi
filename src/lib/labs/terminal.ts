// Terminale simulato (lezione 3.4): un file system finto in memoria e pochi
// comandi base. Niente rete, niente sistema reale: è solo una simulazione.

export type FsNode =
  | { type: "dir"; owner: string; private?: boolean; children: Record<string, FsNode> }
  | { type: "file"; owner: string; private?: boolean; content: string };

export const TERMINAL_USER = "studente";
export const HOME = `/home/${TERMINAL_USER}`;

export const fileSystem: FsNode = {
  type: "dir",
  owner: "root",
  children: {
    home: {
      type: "dir",
      owner: "root",
      children: {
        [TERMINAL_USER]: {
          type: "dir",
          owner: TERMINAL_USER,
          children: {
            "benvenuto.txt": {
              type: "file",
              owner: TERMINAL_USER,
              content:
                "Ciao! Questa è la tua cartella personale (home).\nQui puoi leggere e scrivere i tuoi file.",
            },
            documenti: {
              type: "dir",
              owner: TERMINAL_USER,
              children: {
                "indizio.txt": {
                  type: "file",
                  owner: TERMINAL_USER,
                  content:
                    "Si dice che nella cartella /root ci sia un diario.\nProva a leggerlo con: cat /root/diario.txt",
                },
                "lista-spesa.txt": {
                  type: "file",
                  owner: TERMINAL_USER,
                  content: "latte\npane\nbiscotti per Cybi",
                },
              },
            },
          },
        },
      },
    },
    root: {
      type: "dir",
      owner: "root",
      private: true,
      children: {
        "diario.txt": {
          type: "file",
          owner: "root",
          private: true,
          content: "Solo l'amministratore può leggere queste righe.",
        },
      },
    },
    etc: {
      type: "dir",
      owner: "root",
      children: {
        hostname: { type: "file", owner: "root", content: "cybi-lab" },
      },
    },
  },
};

export type TerminalState = { cwd: string; user: string };

export const initialTerminalState: TerminalState = { cwd: HOME, user: TERMINAL_USER };

// Esito di un comando, usato anche per verificare le missioni.
export type CommandResult = {
  state: TerminalState;
  output: string[];
  command: string;
  args: string[];
  ok: boolean;
  denied?: boolean;
  clear?: boolean;
};

// Trasforma un percorso (assoluto, relativo, con ~ . ..) in percorso assoluto.
export function resolvePath(cwd: string, target: string): string {
  const expanded = target === "~" || target.startsWith("~/") ? HOME + target.slice(1) : target;
  const parts = expanded.startsWith("/") ? [] : cwd.split("/").filter(Boolean);
  for (const part of expanded.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") parts.pop();
    else parts.push(part);
  }
  return `/${parts.join("/")}`;
}

function lookup(path: string): FsNode | null {
  let node: FsNode = fileSystem;
  for (const part of path.split("/").filter(Boolean)) {
    if (node.type !== "dir") return null;
    const child: FsNode | undefined = node.children[part];
    if (!child) return null;
    node = child;
  }
  return node;
}

function canAccess(node: FsNode, user: string): boolean {
  return !node.private || node.owner === user;
}

// Controlla anche le cartelle lungo il percorso: per entrare in /root/x
// bisogna poter entrare in /root.
function blockedOnPath(path: string, user: string): boolean {
  let node: FsNode | undefined = fileSystem;
  for (const part of path.split("/").filter(Boolean)) {
    if (!canAccess(node, user)) return true;
    if (node.type !== "dir") return false;
    node = node.children[part];
    if (!node) return false;
  }
  return !canAccess(node, user);
}

export const commandHelp: [string, string][] = [
  ["whoami", "mostra il nome del tuo utente"],
  ["pwd", "mostra la cartella in cui ti trovi"],
  ["ls [cartella]", "elenca il contenuto di una cartella"],
  ["cd [cartella]", "entra in una cartella (cd .. per tornare su, cd da solo per tornare a casa)"],
  ["cat <file>", "mostra il contenuto di un file"],
  ["clear", "pulisce lo schermo"],
  ["help", "mostra questo elenco"],
];

export function runCommand(state: TerminalState, input: string): CommandResult {
  const [command = "", ...args] = input.trim().split(/\s+/).filter(Boolean);
  const result = (output: string[], extra: Partial<CommandResult> = {}): CommandResult => ({
    state,
    output,
    command,
    args,
    ok: true,
    ...extra,
  });
  const fail = (message: string, denied = false) =>
    result([message], { ok: false, denied: denied || undefined });

  switch (command) {
    case "":
      return result([]);
    case "help":
      return result(commandHelp.map(([cmd, text]) => `${cmd.padEnd(14)} ${text}`));
    case "clear":
      return result([], { clear: true });
    case "whoami":
      return result([state.user]);
    case "pwd":
      return result([state.cwd]);
    case "ls": {
      const path = resolvePath(state.cwd, args[0] ?? ".");
      if (blockedOnPath(path, state.user)) return fail(`ls: ${args[0] ?? path}: permesso negato`, true);
      const node = lookup(path);
      if (!node) return fail(`ls: ${args[0]}: file o cartella inesistente`);
      if (node.type === "file") return result([args[0] ?? path]);
      return result([
        Object.entries(node.children)
          .map(([name, child]) => (child.type === "dir" ? `${name}/` : name))
          .join("  "),
      ]);
    }
    case "cd": {
      const path = resolvePath(state.cwd, args[0] ?? "~");
      if (blockedOnPath(path, state.user)) return fail(`cd: ${args[0]}: permesso negato`, true);
      const node = lookup(path);
      if (!node) return fail(`cd: ${args[0]}: file o cartella inesistente`);
      if (node.type !== "dir") return fail(`cd: ${args[0]}: non è una cartella`);
      return result([], { state: { ...state, cwd: path } });
    }
    case "cat": {
      if (!args[0]) return fail("cat: indica il file da leggere, es. cat benvenuto.txt");
      const path = resolvePath(state.cwd, args[0]);
      if (blockedOnPath(path, state.user)) return fail(`cat: ${args[0]}: permesso negato`, true);
      const node = lookup(path);
      if (!node) return fail(`cat: ${args[0]}: file o cartella inesistente`);
      if (node.type === "dir") return fail(`cat: ${args[0]}: è una cartella`);
      return result(node.content.split("\n"));
    }
    default:
      return fail(`${command}: comando non trovato (scrivi help per l'elenco)`);
  }
}

export type TerminalMission = {
  id: string;
  goal: string;
  hint: string;
  isDone: (result: CommandResult) => boolean;
};

export const terminalMissions: TerminalMission[] = [
  {
    id: "chi-sono",
    goal: "Scopri con quale utente sei collegato.",
    hint: "Prova il comando whoami.",
    isDone: (r) => r.command === "whoami",
  },
  {
    id: "dove-sono",
    goal: "Scopri in quale cartella ti trovi.",
    hint: "Prova il comando pwd.",
    isDone: (r) => r.command === "pwd",
  },
  {
    id: "guarda-intorno",
    goal: "Guarda cosa c'è nella tua cartella.",
    hint: "Prova il comando ls.",
    isDone: (r) => r.command === "ls" && r.ok && r.state.cwd === HOME,
  },
  {
    id: "entra",
    goal: "Entra nella cartella documenti.",
    hint: "Prova cd documenti.",
    isDone: (r) => r.state.cwd === `${HOME}/documenti`,
  },
  {
    id: "leggi-indizio",
    goal: "Leggi il file indizio.txt.",
    hint: "Prova cat indizio.txt (dalla cartella documenti).",
    isDone: (r) => r.command === "cat" && r.ok && /indizio\.txt$/.test(r.args[0] ?? ""),
  },
  {
    id: "permesso-negato",
    goal: "Prova a leggere il diario nella cartella /root.",
    hint: "Prova cat /root/diario.txt.",
    isDone: (r) => r.denied === true,
  },
];
