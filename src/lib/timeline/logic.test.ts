import { describe, expect, it } from "vitest";
import { eventDecade, formatEventDate, pickOrderingRound } from "./logic";

describe("formatEventDate", () => {
  it("formatta anno, mese e giorno in italiano", () => {
    expect(formatEventDate("1988")).toBe("1988");
    expect(formatEventDate("1932-12")).toBe("dicembre 1932");
    expect(formatEventDate("1969-10-29")).toBe("29 ottobre 1969");
    expect(formatEventDate("1977-01-05")).toBe("5 gennaio 1977");
  });

  it("aggiunge 'circa' alle date approssimative", () => {
    expect(formatEventDate("1962", true)).toBe("circa 1962");
  });
});

describe("eventDecade", () => {
  it("restituisce il decennio", () => {
    expect(eventDecade({ date: "1903-06" })).toBe(1900);
    expect(eventDecade({ date: "1989-12" })).toBe(1980);
    expect(eventDecade({ date: "2024" })).toBe(2020);
  });
});

describe("pickOrderingRound", () => {
  const events = [
    { id: "a", date: "1932-12", approximate: false },
    { id: "b", date: "1939-07", approximate: false },
    { id: "c", date: "1940-03", approximate: false },
    { id: "d", date: "1940-08", approximate: false },
    { id: "e", date: "1944-02", approximate: false },
    { id: "f", date: "1962", approximate: true },
    { id: "g", date: "1969-10-29", approximate: false },
  ];

  it("sceglie eventi con anni diversi, in ordine cronologico", () => {
    for (let run = 0; run < 100; run++) {
      const round = pickOrderingRound(events, 5);
      const years = round.map((e) => e.date.slice(0, 4));
      expect(round).toHaveLength(5);
      expect(new Set(years).size).toBe(5);
      expect([...years].sort()).toEqual(years);
    }
  });

  it("esclude le date approssimative", () => {
    for (let run = 0; run < 100; run++) {
      expect(pickOrderingRound(events, 5).map((e) => e.id)).not.toContain("f");
    }
  });

  it("restituisce meno eventi se gli anni disponibili non bastano", () => {
    expect(pickOrderingRound(events.slice(0, 2), 5)).toHaveLength(2);
  });
});
