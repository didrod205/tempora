// Run with: node examples/basic.mjs
// (after `npm run build`, this imports the built bundle)
import { formatDuration, parseDuration, timeAgo } from "../dist/index.js";

const now = Date.now();

console.log(timeAgo(now - 3 * 60_000));              // "3 minutes ago"
console.log(timeAgo(now + 2 * 86_400_000));          // "in 2 days"
console.log(timeAgo(now - 3 * 60_000, { locale: "ko" })); // "3분 전"

console.log(formatDuration(90_061_000));             // "1d 1h 1m 1s"
console.log(formatDuration(5_400_000, { long: true })); // "1 hour, 30 minutes"

console.log(parseDuration("1h30m"));                 // 5400000
console.log(parseDuration("2.5h"));                  // 9000000
