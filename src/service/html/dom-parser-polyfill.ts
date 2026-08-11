import { DOMParser } from "linkedom"

// Turndown decides which HTML parser to use once, at its own module-load
// time (it checks for a global `DOMParser`/`window`, falling back to
// requiring jsdom if neither exists). That decision is cached at import
// time, so this polyfill MUST run and complete before `turndown` is
// imported anywhere — patching after importing turndown, even in the same
// file, is too late because ES module imports are hoisted and Turndown's
// module body has already executed by then.
//
// Import this module first, as its own `import "./dom-parser-polyfill.ts"`
// line, ahead of any `import ... from "turndown"`.
if (typeof globalThis.DOMParser === "undefined") {
  globalThis.DOMParser = DOMParser as unknown as typeof globalThis.DOMParser
}