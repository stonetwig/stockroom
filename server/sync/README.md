# Vendored BedrockJS sync server (0.1.4)

These four files are copied verbatim (only relative import paths adjusted) from
`jsr:@rendly/bedrockjs@0.1.4/src/sync/` — `protocol.ts`, `adapters/types.ts`,
`adapters/deno-kv.ts` and `server.ts`.

Why vendor instead of importing `@rendly/bedrockjs/sync/server`: that entry
point statically imports `jsr:@db/sqlite`, which `dlopen`s a native SQLite
library at import time. That needs `--allow-ffi` and is unavailable on Deno
Deploy. The Deno KV adapter and the server handler themselves have no
dependencies.

The browser side still uses the real package (`@rendly/bedrockjs/sync`); the
wire protocol (`PROTOCOL_VERSION` 1) is identical. When upgrading BedrockJS,
re-copy these files from the new version.
