/**
 * tempora — a tiny, zero-dependency toolkit for human-friendly time.
 *
 * - `timeAgo`   → "3 minutes ago", "in 2 days" (localized via Intl)
 * - `formatDuration` → 90061000 → "1d 1h 1m 1s"
 * - `parseDuration`  → "1h30m" → 5400000
 */

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

export type DurationUnit = "w" | "d" | "h" | "m" | "s" | "ms";

const UNIT_MS: Record<DurationUnit, number> = {
  w: WEEK,
  d: DAY,
  h: HOUR,
  m: MINUTE,
  s: SECOND,
  ms: 1,
};

const LONG_LABEL: Record<DurationUnit, string> = {
  w: "week",
  d: "day",
  h: "hour",
  m: "minute",
  s: "second",
  ms: "millisecond",
};

/** Aliases accepted by {@link parseDuration}. Order matters: longest first. */
const PARSE_ALIASES: [RegExp, DurationUnit][] = [
  [/^(?:ms|msec|millisseconds?|milliseconds?)$/, "ms"],
  [/^(?:w|wk|wks|week|weeks)$/, "w"],
  [/^(?:d|day|days)$/, "d"],
  [/^(?:h|hr|hrs|hour|hours)$/, "h"],
  [/^(?:m|min|mins|minute|minutes)$/, "m"],
  [/^(?:s|sec|secs|second|seconds)$/, "s"],
];

function resolveUnit(raw: string): DurationUnit | null {
  const token = raw.toLowerCase();
  for (const [pattern, unit] of PARSE_ALIASES) {
    if (pattern.test(token)) return unit;
  }
  return null;
}

/**
 * Parse a human duration string into milliseconds.
 *
 * ```ts
 * parseDuration("1h30m");   // 5_400_000
 * parseDuration("2.5h");    // 9_000_000
 * parseDuration("-90s");    // -90_000
 * parseDuration("500");     // 500  (unitless = milliseconds)
 * ```
 *
 * @throws {TypeError} if the string contains no recognizable duration.
 */
export function parseDuration(input: string): number {
  if (typeof input !== "string") {
    throw new TypeError(`parseDuration expected a string, got ${typeof input}`);
  }

  const trimmed = input.trim();
  if (trimmed === "") throw new TypeError("parseDuration received an empty string");

  // A bare number is treated as milliseconds, matching common conventions.
  if (/^-?\d*\.?\d+$/.test(trimmed)) return Number(trimmed);

  const tokenPattern = /(-?\d*\.?\d+)\s*([a-zA-Z]+)/g;
  let total = 0;
  let matched = false;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(trimmed)) !== null) {
    const value = Number(match[1]);
    const unit = resolveUnit(match[2] ?? "");
    if (unit === null || Number.isNaN(value)) {
      throw new TypeError(`parseDuration could not understand "${match[0]}"`);
    }
    total += value * UNIT_MS[unit];
    matched = true;
  }

  if (!matched) {
    throw new TypeError(`parseDuration could not parse "${input}"`);
  }
  return total;
}

export interface FormatDurationOptions {
  /** Units to break the duration into, largest → smallest. Default `["d","h","m","s"]`. */
  units?: DurationUnit[];
  /** Show at most this many of the largest non-zero units. Default: all. */
  largest?: number;
  /** Use long labels ("1 hour 30 minutes") instead of short ("1h 30m"). Default: `false`. */
  long?: boolean;
  /** Round the smallest displayed unit instead of truncating. Default: `true`. */
  round?: boolean;
  /** Separator between parts. Defaults to `" "` (short) or `", "` (long). */
  separator?: string;
}

const DEFAULT_UNITS: DurationUnit[] = ["d", "h", "m", "s"];

function pluralize(value: number, label: string): string {
  return value === 1 ? `1 ${label}` : `${value} ${label}s`;
}

/**
 * Format a duration in milliseconds into a readable string.
 *
 * ```ts
 * formatDuration(90061000);                    // "1d 1h 1m 1s"
 * formatDuration(90061000, { largest: 2 });    // "1d 1h"
 * formatDuration(5400000, { long: true });     // "1 hour, 30 minutes"
 * ```
 */
export function formatDuration(ms: number, options: FormatDurationOptions = {}): string {
  if (!Number.isFinite(ms)) {
    throw new TypeError(`formatDuration expected a finite number, got ${ms}`);
  }

  const units = options.units && options.units.length > 0 ? options.units : DEFAULT_UNITS;
  const long = options.long ?? false;
  const round = options.round ?? true;
  const separator = options.separator ?? (long ? ", " : " ");

  const sign = ms < 0 ? "-" : "";
  let remaining = Math.abs(ms);

  const parts: { unit: DurationUnit; value: number }[] = [];
  units.forEach((unit, index) => {
    const isLast = index === units.length - 1;
    const size = UNIT_MS[unit];
    const value = isLast && round ? Math.round(remaining / size) : Math.floor(remaining / size);
    remaining -= value * size;
    parts.push({ unit, value });
  });

  let visible = parts.filter((p) => p.value !== 0);
  if (visible.length === 0) {
    // Everything rounded/truncated to zero — show the smallest requested unit.
    const smallest = units[units.length - 1] as DurationUnit;
    visible = [{ unit: smallest, value: 0 }];
  }
  if (options.largest && options.largest > 0) {
    visible = visible.slice(0, options.largest);
  }

  const rendered = visible.map(({ unit, value }) =>
    long ? pluralize(value, LONG_LABEL[unit]) : `${value}${unit}`,
  );

  return sign + rendered.join(separator);
}

export interface TimeAgoOptions {
  /** Reference "now". Defaults to `Date.now()`. */
  now?: Date | number;
  /** BCP-47 locale(s) passed to `Intl.RelativeTimeFormat`. Default: runtime locale. */
  locale?: string | string[];
  /** `"auto"` yields "yesterday"/"tomorrow"; `"always"` yields "1 day ago". Default: `"auto"`. */
  numeric?: "auto" | "always";
  /** Width of the output. Default: `"long"`. */
  style?: "long" | "short" | "narrow";
}

const TIME_AGO_STEPS: [number, Intl.RelativeTimeFormatUnit][] = [
  [MINUTE, "second"],
  [HOUR, "minute"],
  [DAY, "hour"],
  [WEEK, "day"],
  [30 * DAY, "week"],
  [365 * DAY, "month"],
  [Number.POSITIVE_INFINITY, "year"],
];

const UNIT_DIVISOR: Record<Intl.RelativeTimeFormatUnit, number> = {
  second: SECOND,
  seconds: SECOND,
  minute: MINUTE,
  minutes: MINUTE,
  hour: HOUR,
  hours: HOUR,
  day: DAY,
  days: DAY,
  week: WEEK,
  weeks: WEEK,
  month: 30 * DAY,
  months: 30 * DAY,
  quarter: 91 * DAY,
  quarters: 91 * DAY,
  year: 365 * DAY,
  years: 365 * DAY,
};

function toMillis(input: Date | number | string): number {
  if (input instanceof Date) return input.getTime();
  if (typeof input === "number") return input;
  const parsed = Date.parse(input);
  if (Number.isNaN(parsed)) {
    throw new TypeError(`timeAgo could not parse the date "${input}"`);
  }
  return parsed;
}

/**
 * Format a past or future time relative to now, localized via the built-in
 * `Intl.RelativeTimeFormat` (no dependencies, no locale data to ship).
 *
 * ```ts
 * timeAgo(Date.now() - 3 * 60_000);            // "3 minutes ago"
 * timeAgo(Date.now() + 2 * 86_400_000);        // "in 2 days"
 * timeAgo(then, { locale: "ko" });             // "3분 전"
 * ```
 */
export function timeAgo(input: Date | number | string, options: TimeAgoOptions = {}): string {
  const now = options.now === undefined ? Date.now() : toMillis(options.now);
  const target = toMillis(input);
  const diff = target - now; // positive = future, negative = past

  const abs = Math.abs(diff);
  const unit = TIME_AGO_STEPS.find(([threshold]) => abs < threshold)?.[1] ?? "year";
  const value = Math.round(diff / UNIT_DIVISOR[unit]);

  const formatter = new Intl.RelativeTimeFormat(options.locale, {
    numeric: options.numeric ?? "auto",
    style: options.style ?? "long",
  });
  return formatter.format(value, unit);
}
