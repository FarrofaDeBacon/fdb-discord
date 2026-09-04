/**
 * Teste real — asserts, não narrativa.
 * Run: npx vitest run discord.test.ts (ou node direto se vitest nao instalado)
 */
import { describe, it, expect } from "vitest";
import { checkGuildAdmin } from "./discord";

describe("checkGuildAdmin — 403 logic", () => {
  it("C1: admin da guild 1111 → true (deve permitir)", () => {
    expect(checkGuildAdmin("1111", ["1111"])).toBe(true);
  });
  it("C2: nao-admin (2222) tenta 1111 → false (deve 403)", () => {
    expect(checkGuildAdmin("1111", ["2222"])).toBe(false);
  });
  it("C3: manipulado URL 9999 com session 2222 → false (deve 403)", () => {
    expect(checkGuildAdmin("9999", ["2222"])).toBe(false);
  });
});
