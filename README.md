<div align="center">

# tempora

**Human-friendly time, in ~1 KB. Relative time, duration formatting & parsing — zero dependencies, localized via `Intl`.**

[![npm version](https://img.shields.io/npm/v/tempora.svg?color=success)](https://www.npmjs.com/package/tempora)
[![bundle size](https://img.shields.io/bundlephobia/minzip/tempora?label=gzip)](https://bundlephobia.com/package/tempora)
[![CI](https://github.com/didrod205/tempora/actions/workflows/ci.yml/badge.svg)](https://github.com/didrod205/tempora/actions/workflows/ci.yml)
[![types](https://img.shields.io/npm/types/tempora.svg)](https://www.npmjs.com/package/tempora)
[![license](https://img.shields.io/npm/l/tempora.svg)](./LICENSE)

</div>

Three tiny functions for the time formatting every app ends up needing — without
pulling in a date library or shipping locale data.

```ts
import { timeAgo, formatDuration, parseDuration } from "tempora";

timeAgo(Date.now() - 3 * 60_000);   // "3 minutes ago"
timeAgo(then, { locale: "ko" });    // "3분 전"

formatDuration(90_061_000);         // "1d 1h 1m 1s"
parseDuration("1h30m");             // 5_400_000
```

---

## Why tempora?

- 🪶 **Zero dependencies.** ~1 KB gzipped. No locale files to ship.
- 🌍 **Localized for free.** `timeAgo` uses the built-in `Intl.RelativeTimeFormat`, so every language the runtime knows just works.
- 🔁 **Round-trips.** `parseDuration` and `formatDuration` are two ends of the same pipe.
- 🧩 **Three focused functions.** No giant API surface, no moment-style mutable objects.
- ⚙️ **Runs everywhere.** Node 18+, Deno, Bun, Cloudflare Workers and the browser.
- 🛡️ **Type-safe.** Written in TypeScript, ships full declarations.

## Install

```bash
npm install tempora
# or: pnpm add tempora  /  yarn add tempora  /  bun add tempora
```

Ships ESM **and** CommonJS:

```ts
import { timeAgo } from "tempora";        // ESM / TypeScript
const { timeAgo } = require("tempora");   // CommonJS
```

## Usage

### `timeAgo` — relative time

```ts
timeAgo(Date.now() - 3 * 60_000);              // "3 minutes ago"
timeAgo(Date.now() + 2 * 86_400_000);          // "in 2 days"
timeAgo("2026-01-01T00:00:00Z");               // "last year" (relative to now)

// Localized — any BCP-47 locale the runtime supports
timeAgo(then, { locale: "ko" });               // "3분 전"
timeAgo(then, { locale: "es" });               // "hace 3 minutos"

// Tweak the wording
timeAgo(yesterday, { numeric: "always" });     // "1 day ago" (instead of "yesterday")
timeAgo(then, { style: "short" });             // "3 min. ago"

// Test deterministically by pinning "now"
timeAgo(t, { now: fixedTimestamp });
```

Accepts a `Date`, a millisecond timestamp, or any string `Date.parse` understands.

### `formatDuration` — milliseconds → readable

```ts
formatDuration(90_061_000);                          // "1d 1h 1m 1s"
formatDuration(5_400_000);                           // "1h 30m"
formatDuration(90_061_000, { largest: 2 });          // "1d 1h"
formatDuration(5_400_000, { long: true });           // "1 hour, 30 minutes"
formatDuration(elapsed, { units: ["m", "s"] });      // "75m 30s"
```

### `parseDuration` — readable → milliseconds

```ts
parseDuration("1h30m");          // 5_400_000
parseDuration("2.5h");           // 9_000_000
parseDuration("1h 30m 5s");      // 5_405_000
parseDuration("-90s");           // -90_000
parseDuration("500");            // 500  (bare number = milliseconds)
parseDuration("1 hour");         // 3_600_000
```

Throws a `TypeError` for input it can't understand, so misconfiguration fails loudly.

## API

### `timeAgo(input, options?) => string`

| Option    | Type                          | Default          | Description                                            |
| --------- | ----------------------------- | ---------------- | ------------------------------------------------------ |
| `now`     | `Date \| number`              | `Date.now()`     | Reference point for the comparison.                    |
| `locale`  | `string \| string[]`          | runtime locale   | BCP-47 locale(s) for `Intl.RelativeTimeFormat`.        |
| `numeric` | `"auto" \| "always"`          | `"auto"`         | `"auto"` allows "yesterday"/"tomorrow".                |
| `style`   | `"long" \| "short" \| "narrow"` | `"long"`       | Width of the output.                                   |

### `formatDuration(ms, options?) => string`

| Option      | Type             | Default              | Description                                       |
| ----------- | ---------------- | -------------------- | ------------------------------------------------- |
| `units`     | `DurationUnit[]` | `["d","h","m","s"]`  | Units to break into, largest → smallest.          |
| `largest`   | `number`         | all                  | Show at most N largest non-zero units.            |
| `long`      | `boolean`        | `false`              | Long labels ("1 hour") vs short ("1h").           |
| `round`     | `boolean`        | `true`               | Round the smallest displayed unit.                |
| `separator` | `string`         | `" "` / `", "`       | Separator between parts.                           |

`DurationUnit` is one of `"w" | "d" | "h" | "m" | "s" | "ms"`.

### `parseDuration(input) => number`

Parses a duration string into milliseconds. A bare number is treated as
milliseconds. Throws `TypeError` on unrecognized input.

## Comparison

|                          | `tempora` | `moment` / `dayjs` | `humanize-duration` + `timeago.js` |
| ------------------------ | :-------: | :----------------: | :--------------------------------: |
| Zero dependencies        |    ✅     |         ⚠️         |                ✅                  |
| Relative time            |    ✅     |         ✅         |                ✅                  |
| Duration format + parse  |    ✅     |         ⚠️         |                ⚠️ (two libs)       |
| Localized without bundle |    ✅     |         ❌         |                ❌                  |
| ~1 KB gzipped            |    ✅     |         ❌         |                ❌                  |

## Contributing

Contributions are very welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md)
and our [Code of Conduct](./CODE_OF_CONDUCT.md).

```bash
git clone https://github.com/didrod205/tempora.git
cd tempora
npm install
npm test
```

## 💖 Sponsor

`tempora` is free and MIT-licensed, built and maintained in spare time. If it
saved you from reaching for a heavy date library, please consider supporting it —
every bit helps keep the project healthy.

- ⭐ **Star this repo** — the simplest, free way to help others discover it.
- 🍋 **[Sponsor via Lemon Squeezy](https://elab-studio.lemonsqueezy.com/checkout/buy/5d059b89-51d0-456b-b33a-ed56994f7010)** — one-time or recurring support.

> Sponsoring? Open an issue and we'll add your name/logo here. Thank you! 🙏

## License

[MIT](./LICENSE) © tempora contributors
