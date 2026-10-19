import { getErrorMessage } from "@/lib/errors";
import { applyOrder, interleave, moveItem } from "@/lib/feed";

describe("interleave", () => {
  it("takes one item from each list in turn", () => {
    expect(interleave([["a1", "a2"], ["b1", "b2"]])).toEqual(["a1", "b1", "a2", "b2"]);
  });

  it("handles lists of different lengths", () => {
    expect(interleave([["a1", "a2", "a3"], ["b1"]])).toEqual(["a1", "b1", "a2", "a3"]);
  });

  it("returns an empty list for empty input", () => {
    expect(interleave([])).toEqual([]);
    expect(interleave([[], []])).toEqual([]);
  });
});

describe("applyOrder", () => {
  const items = ["a", "b", "c", "d"].map((id) => ({ id }));
  const ids = (list: { id: string }[]) => list.map((x) => x.id);

  it("leaves items untouched when there is no saved order", () => {
    expect(applyOrder(items, [])).toBe(items);
  });

  it("puts ordered items first, in the saved order", () => {
    expect(ids(applyOrder(items, ["c", "a"]))).toEqual(["c", "a", "b", "d"]);
  });

  it("ignores saved ids that are no longer in the feed", () => {
    expect(ids(applyOrder(items, ["gone", "b"]))).toEqual(["b", "a", "c", "d"]);
  });
});

describe("moveItem", () => {
  it("moves an item to a new position", () => {
    expect(moveItem(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"]);
  });

  it("does not mutate the original list", () => {
    const list = ["a", "b", "c"];
    moveItem(list, 0, 2);
    expect(list).toEqual(["a", "b", "c"]);
  });

  it("returns the same list when the target is out of range", () => {
    const list = ["a", "b"];
    expect(moveItem(list, 0, -1)).toBe(list);
    expect(moveItem(list, 1, 2)).toBe(list);
  });
});

describe("getErrorMessage", () => {
  it("reads the message our API routes send", () => {
    expect(getErrorMessage({ status: 502, data: { error: "News API is down" } })).toBe(
      "News API is down"
    );
  });

  it("reads a plain error string", () => {
    expect(getErrorMessage({ status: "FETCH_ERROR", error: "Failed to fetch" })).toBe(
      "Failed to fetch"
    );
  });

  it("falls back to a friendly message", () => {
    expect(getErrorMessage(undefined)).toMatch(/something went wrong/i);
  });
});