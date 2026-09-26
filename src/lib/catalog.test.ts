import { describe, expect, it } from "vitest";
import { catalog, formulaDiff, searchFormulas } from "./catalog";

describe("catalog learning utilities", () => {
  it("contains exactly 22 exam formulas", () => {
    expect(catalog.formulas.filter((formula) => formula.exam)).toHaveLength(22);
  });

  it("searches aliases, ingredients, contexts, and source text", () => {
    expect(searchFormulas("Four Gentlemen").some((formula) => formula.id === "si-jun-zi-tang")).toBe(true);
    expect(searchFormulas("Hong Hua").some((formula) => formula.id === "tao-hong-si-wu-tang")).toBe(true);
    expect(searchFormulas("late healing").some((formula) => formula.id === "si-wu-tang")).toBe(true);
    expect(searchFormulas("shoulder stiff").some((formula) => formula.id === "tao-hong-si-wu-tang")).toBe(true);
  });

  it("calculates shared and distinct ingredients", () => {
    const formulas = ["si-wu-tang", "tao-hong-si-wu-tang"].map((id) => catalog.formulas.find((formula) => formula.id === id)!);
    const diff = formulaDiff(formulas);
    expect(diff.shared).toEqual(expect.arrayContaining(["Dang Gui", "Chuan Xiong"]));
    expect(diff.unique[1].ingredients).toEqual(expect.arrayContaining(["Tao Ren", "Hong Hua"]));
  });
});
