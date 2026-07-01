---
"@fastkit/universal-logger": patch
---

Widen the `@datadog/browser-logs` peer dependency range to `^5.8.0 || ^6.0.0 || ^7.0.0` so it matches the version actually built against (`7.4.0`). Previously the peer range only allowed `^5.8.0`, which excluded the v6/v7 majors used in development and emitted spurious peer warnings for consumers on newer versions. The used API surface (`init`, `logger[level]` with the `error` argument) is present across all of these majors.
