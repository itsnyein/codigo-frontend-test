import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { createPersistence } from "./persistence";

const schema = z.object({ username: z.string(), visits: z.number() });
const KEY = "test:state:v1";

function subject() {
  return createPersistence(KEY, schema);
}

describe("createPersistence", () => {
  it("round-trips a valid value", () => {
    const persistence = subject();
    persistence.save({ username: "ada", visits: 2 });

    expect(persistence.load()).toEqual({ username: "ada", visits: 2 });
  });

  it("returns undefined when nothing is stored", () => {
    expect(subject().load()).toBeUndefined();
  });

  it("discards malformed JSON instead of throwing", () => {
    localStorage.setItem(KEY, "{not json");

    expect(subject().load()).toBeUndefined();
  });

  it("discards stored data that no longer matches the schema", () => {
    localStorage.setItem(KEY, JSON.stringify({ username: "ada" }));

    expect(subject().load()).toBeUndefined();
  });

  it("clears the stored value", () => {
    const persistence = subject();
    persistence.save({ username: "ada", visits: 1 });
    persistence.clear();

    expect(persistence.load()).toBeUndefined();
  });

  it("stays silent when writing throws, so a full store cannot break the app", () => {
    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new DOMException("QuotaExceededError");
      });

    expect(() => subject().save({ username: "ada", visits: 1 })).not.toThrow();

    setItem.mockRestore();
  });

  it("stays silent when reading throws", () => {
    const getItem = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new DOMException("SecurityError");
      });

    expect(subject().load()).toBeUndefined();

    getItem.mockRestore();
  });
});
