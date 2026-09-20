// Plain "util", not "node:util": this package's jest resolver does not handle
// the node: prefix and treats it as a path.
import { TextDecoder, TextEncoder } from "util";

// Jest's node environment does not copy these two globals across, and
// `js-xxhash` needs `TextEncoder` to hash a compiled style block. Without them
// every test that compiles a component died with
// `ReferenceError: TextEncoder is not defined` — which nobody saw, because the
// suites holding those tests failed to load at all until the `@/` alias was
// mapped.
if (typeof globalThis.TextEncoder === "undefined") {
  globalThis.TextEncoder = TextEncoder as unknown as typeof globalThis.TextEncoder;
}

if (typeof globalThis.TextDecoder === "undefined") {
  globalThis.TextDecoder = TextDecoder as unknown as typeof globalThis.TextDecoder;
}
