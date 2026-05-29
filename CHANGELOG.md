# Changelog

All notable changes to this project are documented in this file. The format is
based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0]

### Added

- Initial release.
- `timeAgo(input, options?)` — localized relative time via `Intl.RelativeTimeFormat`.
- `formatDuration(ms, options?)` — readable durations ("1d 1h 1m 1s"), with `units`, `largest`, `long`, `round` and `separator` options.
- `parseDuration(input)` — parse "1h30m"-style strings into milliseconds.
- Ships ESM + CJS with full TypeScript types.

[Unreleased]: https://github.com/didrod205/tempora/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/didrod205/tempora/releases/tag/v0.1.0
