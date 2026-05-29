import { describe, expect, it } from "vitest";
import { formatDuration, parseDuration, timeAgo } from "../src/tempora.js";

describe("parseDuration", () => {
  it("parses single units", () => {
    expect(parseDuration("1s")).toBe(1000);
    expect(parseDuration("2m")).toBe(120_000);
    expect(parseDuration("1h")).toBe(3_600_000);
    expect(parseDuration("1d")).toBe(86_400_000);
    expect(parseDuration("1w")).toBe(604_800_000);
    expect(parseDuration("250ms")).toBe(250);
  });

  it("sums compound durations with or without spaces", () => {
    expect(parseDuration("1h30m")).toBe(5_400_000);
    expect(parseDuration("1h 30m 5s")).toBe(5_405_000);
  });

  it("accepts decimals and negatives", () => {
    expect(parseDuration("2.5h")).toBe(9_000_000);
    expect(parseDuration("-90s")).toBe(-90_000);
  });

  it("treats a bare number as milliseconds", () => {
    expect(parseDuration("500")).toBe(500);
  });

  it("accepts long unit names", () => {
    expect(parseDuration("1 hour 30 minutes")).toBe(5_400_000);
  });

  it("throws on invalid input", () => {
    expect(() => parseDuration("")).toThrow(TypeError);
    expect(() => parseDuration("soon")).toThrow(TypeError);
    expect(() => parseDuration("5 fortnights")).toThrow(TypeError);
  });
});

describe("formatDuration", () => {
  it("formats with default units", () => {
    expect(formatDuration(90_061_000)).toBe("1d 1h 1m 1s");
  });

  it("omits zero units", () => {
    expect(formatDuration(3_600_000)).toBe("1h");
    expect(formatDuration(5_400_000)).toBe("1h 30m");
  });

  it("limits output with largest", () => {
    expect(formatDuration(90_061_000, { largest: 2 })).toBe("1d 1h");
  });

  it("supports long labels with pluralization", () => {
    expect(formatDuration(5_400_000, { long: true })).toBe("1 hour, 30 minutes");
    expect(formatDuration(60_000, { long: true })).toBe("1 minute");
  });

  it("rounds the smallest displayed unit by default", () => {
    expect(formatDuration(1_500, { units: ["s"] })).toBe("2s");
    expect(formatDuration(1_500, { units: ["s"], round: false })).toBe("1s");
  });

  it("handles zero and negatives", () => {
    expect(formatDuration(0)).toBe("0s");
    expect(formatDuration(-5_400_000)).toBe("-1h 30m");
  });

  it("respects a custom unit set and separator", () => {
    expect(formatDuration(WEEKS(2) + 86_400_000, { units: ["w", "d"], separator: " / " })).toBe(
      "2w / 1d",
    );
  });

  it("throws on non-finite input", () => {
    expect(() => formatDuration(Number.NaN)).toThrow(TypeError);
  });
});

function WEEKS(n: number): number {
  return n * 604_800_000;
}

describe("timeAgo", () => {
  const now = Date.parse("2026-05-29T12:00:00Z");

  it("formats past times", () => {
    expect(timeAgo(now - 3 * 60_000, { now })).toBe("3 minutes ago");
    expect(timeAgo(now - 5 * 3_600_000, { now })).toBe("5 hours ago");
  });

  it("formats future times", () => {
    expect(timeAgo(now + 2 * 86_400_000, { now })).toBe("in 2 days");
  });

  it("uses auto numeric for adjacent days", () => {
    expect(timeAgo(now - 86_400_000, { now })).toBe("yesterday");
    expect(timeAgo(now + 86_400_000, { now })).toBe("tomorrow");
  });

  it("supports always-numeric output", () => {
    expect(timeAgo(now - 86_400_000, { now, numeric: "always" })).toBe("1 day ago");
  });

  it("localizes output", () => {
    expect(timeAgo(now - 3 * 60_000, { now, locale: "ko" })).toBe("3분 전");
  });

  it("accepts Date, number and string inputs", () => {
    expect(timeAgo(new Date(now - 60_000), { now })).toBe("1 minute ago");
    expect(timeAgo("2026-05-29T11:00:00Z", { now })).toBe("1 hour ago");
  });

  it("throws on an unparseable string", () => {
    expect(() => timeAgo("not-a-date", { now })).toThrow(TypeError);
  });
});
