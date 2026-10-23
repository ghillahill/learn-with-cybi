import { describe, expect, it } from "vitest";
import {
  HOME,
  initialTerminalState,
  resolvePath,
  runCommand,
  terminalMissions,
  type TerminalState,
} from "./terminal";

function run(commands: string[], state: TerminalState = initialTerminalState) {
  return commands.reduce(
    (acc, cmd) => {
      const r = runCommand(acc.state, cmd);
      return { state: r.state, results: [...acc.results, r] };
    },
    { state, results: [] as ReturnType<typeof runCommand>[] },
  );
}

describe("terminale simulato", () => {
  it("risolve percorsi relativi, assoluti e con ~", () => {
    expect(resolvePath(HOME, "documenti")).toBe(`${HOME}/documenti`);
    expect(resolvePath(`${HOME}/documenti`, "..")).toBe(HOME);
    expect(resolvePath("/etc", "~/documenti")).toBe(`${HOME}/documenti`);
    expect(resolvePath(HOME, "/etc/./hostname")).toBe("/etc/hostname");
    expect(resolvePath("/", "../..")).toBe("/");
  });

  it("whoami, pwd e ls", () => {
    const { results } = run(["whoami", "pwd", "ls"]);
    expect(results.map((r) => r.output)).toEqual([
      ["studente"],
      [HOME],
      ["benvenuto.txt  documenti/"],
    ]);
  });

  it("cd e cat, con errori per percorsi inesistenti", () => {
    const { state, results } = run(["cd documenti", "cat indizio.txt", "cat nulla.txt", "cd"]);
    expect(results[1].output[0]).toMatch(/\/root/);
    expect(results[2]).toMatchObject({ ok: false, output: ["cat: nulla.txt: file o cartella inesistente"] });
    expect(state.cwd).toBe(HOME);
  });

  it("nega l'accesso alla cartella dell'amministratore", () => {
    for (const cmd of ["cat /root/diario.txt", "ls /root", "cd /root"]) {
      const r = runCommand(initialTerminalState, cmd);
      expect(r.denied).toBe(true);
      expect(r.output[0]).toMatch(/permesso negato$/);
    }
    expect(runCommand(initialTerminalState, "cat /etc/hostname").output).toEqual(["cybi-lab"]);
  });

  it("segnala i comandi sconosciuti", () => {
    expect(runCommand(initialTerminalState, "sudo cat /root/diario.txt").ok).toBe(false);
  });

  it("la sequenza guidata completa tutte le missioni in ordine", () => {
    const { results } = run([
      "whoami",
      "pwd",
      "ls",
      "cd documenti",
      "cat indizio.txt",
      "cat /root/diario.txt",
    ]);
    terminalMissions.forEach((mission, i) => expect(mission.isDone(results[i])).toBe(true));
  });
});
