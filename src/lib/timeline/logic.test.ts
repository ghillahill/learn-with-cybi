import { describe, expect, it } from "vitest";
import { eventDecade, formatEventDate } from "./logic";

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
