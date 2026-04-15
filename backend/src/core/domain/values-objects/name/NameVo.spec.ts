import { describe, expect, it } from "vitest";

import { BadRequestError } from "../../errors/controllers/BadRequestError";
import { NameVO } from "./name.vo";

describe("NameVO", () => {
  it("should create a valid NameVO", () => {
    const name = NameVO.create(" João da Silva ");
    expect(name.getValue()).toBe("João da Silva");
  });

  it("should trim and normalize name with multiple spaces", () => {
    const name = NameVO.create(" Maria   das   Dores ");
    expect(name.getValue()).toBe("Maria das Dores");
  });

  it("should throw if name is empty", () => {
    expect(() => NameVO.create("")).toThrow(BadRequestError);
  });

  it("should throw if name is too short", () => {
    expect(() => NameVO.create("J S", { minLength: 5 })).toThrow(
      BadRequestError,
    );
  });

  it("should throw if name is too long", () => {
    const longName = "A".repeat(60) + " B";
    expect(() => NameVO.create(longName, { maxLength: 50 })).toThrow(
      BadRequestError,
    );
  });

  it("should throw if no surname is provided", () => {
    expect(() => NameVO.create("João")).toThrow(BadRequestError);
  });

  it("should throw if name contains invalid characters", () => {
    expect(() => NameVO.create("João # Silva")).toThrow(BadRequestError);
  });

  it("should consider two NameVOs equal if values match", () => {
    const name1 = NameVO.create("Ana Maria");
    const name2 = NameVO.create("Ana Maria");
    expect(name1.equals(name2)).toBe(true);
  });

  it("should consider two NameVOs different if values differ", () => {
    const name1 = NameVO.create("Carlos Silva");
    const name2 = NameVO.create("Carlos Souza");
    expect(name1.equals(name2)).toBe(false);
  });
});
