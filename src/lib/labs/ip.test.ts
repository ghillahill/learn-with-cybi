import { describe, expect, it } from "vitest";
import { ipChallenge, isIpSelectionCorrect, parseIPv4, privateBlockOf } from "./ip";

describe("indirizzi IPv4 privati", () => {
  it("interpreta gli indirizzi validi e rifiuta quelli sbagliati", () => {
    expect(parseIPv4("0.0.0.0")).toBe(0);
    expect(parseIPv4("255.255.255.255")).toBe(2 ** 32 - 1);
    expect(parseIPv4("256.1.1.1")).toBeNull();
    expect(parseIPv4("1.2.3")).toBeNull();
    expect(parseIPv4("1.2.3.x")).toBeNull();
  });

  it("riconosce i confini dei tre blocchi dell'RFC 1918", () => {
    expect(privateBlockOf("10.0.0.0")?.cidr).toBe("10.0.0.0/8");
    expect(privateBlockOf("10.255.255.255")?.cidr).toBe("10.0.0.0/8");
    expect(privateBlockOf("172.16.0.0")?.cidr).toBe("172.16.0.0/12");
    expect(privateBlockOf("172.31.255.255")?.cidr).toBe("172.16.0.0/12");
    expect(privateBlockOf("172.15.255.255")).toBeNull();
    expect(privateBlockOf("172.32.0.0")).toBeNull();
    expect(privateBlockOf("192.168.0.0")?.cidr).toBe("192.168.0.0/16");
    expect(privateBlockOf("192.169.0.0")).toBeNull();
  });

  it("la sfida ha sia indirizzi privati sia pubblici", () => {
    const priv = ipChallenge.filter((a) => privateBlockOf(a));
    expect(priv).toEqual(["192.168.1.10", "10.200.1.1", "172.31.255.254", "172.16.5.4"]);
    expect(isIpSelectionCorrect(priv)).toBe(true);
    expect(isIpSelectionCorrect([...priv, "172.32.0.1"])).toBe(false);
    expect(isIpSelectionCorrect(priv.slice(1))).toBe(false);
  });
});
