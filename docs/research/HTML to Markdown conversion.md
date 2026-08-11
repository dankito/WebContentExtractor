Which html to markdown conversion libraries are there for TS/JS?
How do they compare in speed and conversion quality to Python based Markdownify and html2text?

---

Here's the landscape for JS/TS, plus how they stack up against Python's Markdownify and html2text.

## Main TS/JS libraries

**Turndown** — the de facto standard. Rule-based, uses a real DOM parser (jsdom in Node, native DOM in browser), CommonMark output, highly extensible via custom rules and plugins (`turndown-plugin-gfm` adds tables, strikethrough, task lists). Mature, widely used (Joplin, Obsidian importers, etc.), but single-threaded synchronous conversion and DOM parsing overhead make it the slowest of the JS options on large documents.

**node-html-markdown** — built specifically for speed. Custom lightweight parser instead of a full DOM, avoids jsdom entirely. Benchmarks in its own README claim 5-30x faster than Turndown on large inputs, with comparable output quality. Good default if throughput matters (batch conversion, server-side pipelines).

**html-to-md** — another dependency-light, DOM-free converter aiming for speed and small bundle size. Less battle-tested than Turndown, smaller plugin ecosystem, but usable in browser and Node without jsdom.

**rehype-remark** (unified/rehype/remark ecosystem) — parses HTML into a hast tree via `rehype-parse`, converts to an mdast tree, serializes with `remark-stringify`. Not the fastest, but by far the most correct and configurable if you're already in the unified ecosystem — you get a real AST you can transform before/after conversion, GFM support via `remark-gfm`, and very predictable CommonMark-compliant output. Best choice if you need to combine HTML→MD with other content transforms (sanitizing, rewriting links, custom node handling) rather than just a one-shot string conversion.

**mdast-util-to-markdown / hast-util-to-mdast** — the lower-level pieces rehype-remark is built on, useful if you want to hand-roll a pipeline.

## Speed comparison

Rough ordering, fastest to slowest, for typical article-length HTML:

1. node-html-markdown / html-to-md (no DOM parser, custom tokenizers)
2. Python's html2text (also avoids a full DOM, uses HTMLParser from stdlib)
3. Turndown, rehype-remark (both build a full DOM/AST first — jsdom is the real cost for Turndown in Node)
4. Python's Markdownify (built on BeautifulSoup, generally the slowest of this group — BS4 parsing plus its own recursive tree walk)

The dominant cost in nearly all of these is HTML parsing, not the markdown emission step, so libraries that skip building a full DOM (node-html-markdown, html2text) pull ahead substantially on large pages. In the browser, Turndown gets a "free" native DOM parser so its relative speed is better there than in Node with jsdom.

## Quality comparison

- **Turndown** and **rehype-remark** produce the most standards-compliant, well-formed Markdown (proper escaping, correct nested-list handling, sane blockquote/code-block edge cases) because they operate on a real tree structure. Turndown's plugin system also makes GFM extras (tables, strikethrough) reliable.
- **node-html-markdown** is close behind on quality for typical content (paragraphs, lists, links, images, basic tables) but can be less robust on deeply malformed or unusual nested HTML since it isn't a full DOM implementation — edge cases in whitespace handling and nested inline formatting are where it occasionally diverges from Turndown's output.
- **Markdownify (Python)** is generally regarded as producing clean, readable Markdown similar in spirit to Turndown, with decent configurability (heading style, bullet style, strip/convert specific tags), largely because BeautifulSoup's tree gives it the same structural correctness advantage.
- **html2text (Python)** is older and more opinionated/rigid — good for quickly getting readable plain-text-ish Markdown, but weaker at precise structural fidelity (tables and nested lists are its usual weak points) and less configurable than the others.

## Practical takeaway

- Need max fidelity / plugin ecosystem / battle-tested: **Turndown** (Node/browser) or **rehype-remark** if you want an AST-based pipeline.
- Need max throughput on large volumes of HTML: **node-html-markdown**.
- Coming from Python and want a rough JS equivalent of Markdownify in behavior/quality: **Turndown** is the closest match (both are DOM-tree based with similar configurability); html2text sits closer to node-html-markdown/html-to-md in the "skip the full DOM, prioritize speed" camp, but with worse table/list fidelity than any of the JS-side options above.

If you want, tell me your use case (batch pipeline vs. one-off conversion, need for tables/GFM, browser vs. Node) and I can narrow this to a single recommendation.

---

The service runs on bun.  Would it be possible to use linkedom instead of jsdom for Turndown, e.g. by passing a Document instance to it?

How do above libraries compare to Kreuzberg html-to-markdown (https://github.com/xberg-io/html-to-markdown), which has bindings for both JS and Python for its Rust core.

---

## linkedom + Turndown on Bun

Yes, this is a common and well-supported pattern, and it works well on Bun.

Turndown doesn't hard-depend on jsdom — internally it just needs a `DOMParser`-like object to parse the HTML string into a tree it can walk. It resolves this by checking for a global `window`/`document`/`DOMParser`, and if none exists it falls back to requiring jsdom itself. So the trick is to make a DOM-ish global available *before* jsdom's lazy-require kicks in, using linkedom instead:

```ts
import { parseHTML } from "linkedom";
import TurndownService from "turndown";

const { document } = parseHTML("<html><body></body></html>");

// Turndown looks for a global document/DOMParser if you don't pass one explicitly
globalThis.document = document;
globalThis.DOMParser = new (parseHTML("").window as any).DOMParser
  ? (parseHTML("").window as any).DOMParser
  : undefined;

const turndownService = new TurndownService();
const markdown = turndownService.turndown("<h1>Hello</h1>");
```

In practice, the cleaner approach people use (and what I'd recommend) is patching global `DOMParser` once at startup, since that's the actual API Turndown's HTML-parser module calls:

```ts
import { DOMParser } from "linkedom";
globalThis.DOMParser = DOMParser as any;

import TurndownService from "turndown"; // import after patching the global
```

This is the same workaround used for running Turndown in Cloudflare Workers and other non-Node edge runtimes that lack jsdom's native bindings, so it's a proven pattern, not a hack unique to Bun.

**Caveats:**
- linkedom is not a full DOM implementation — it covers the parsing/traversal APIs Turndown actually needs (`querySelectorAll`, `childNodes`, `nodeType`, etc.) well, but exotic edge cases in malformed HTML may parse slightly differently than jsdom's html5-compliant parser.
- You lose jsdom's stricter HTML5 error-recovery in exchange for a large speed/footprint win — linkedom has no native bindings, is CPU/memory-light, and starts fast, which matters a lot on Bun/edge where jsdom's native deps (canvas, etc.) are often unavailable or slow to cold-start anyway.
- Worth writing a small regression test set against your real-world HTML samples before shipping, since this swap can occasionally change output on pathological markup.

Net: yes, do this — it's the standard way to get Turndown running efficiently outside Node-with-native-jsdom environments.

## Kreuzberg's html-to-markdown (Rust core)

This is a different category of tool from the others: it's a single Rust engine (`kreuzberg-dev/html-to-markdown`, published under both the Kreuzberg org and `xberg-io`) with native bindings for 16+ languages, including Node/Bun (via NAPI, package `@kreuzberg/html-to-markdown`) and Python (`html-to-markdown` on PyPI), plus a WASM build for portability. It routes each input through three tiers: a single-pass byte scanner for clean HTML, a tolerant DOM walker for complex inputs, and an html5ever repair pass for malformed HTML, with byte-identical output enforced across tiers by a snapshot oracle and per-group performance gates in CI.

**Speed:** This is where it separates itself from everything discussed so far. Because it's compiled Rust with no DOM-construction overhead for the common case (the byte-scanner tier), it should comfortably outperform Turndown+jsdom, rehype-remark, and even node-html-markdown on throughput, and it beats Python's Markdownify/html2text by an even wider margin since those carry Python interpreter overhead on top of BeautifulSoup/HTMLParser parsing. For Node.js/Bun specifically, the native NAPI binding is documented as ~1.17x faster than the WASM build, and the native binding is the one you'd want on Bun anyway since Bun supports NAPI natively.

**Quality/robustness:** It's built to handle unclosed tags, CDATA, custom elements, malformed entities, nested tables, and mixed encodings without losing content, using html5ever (the same battle-tested HTML5 parser that powers Servo/Firefox) as its repair-pass tier for genuinely broken markup — that's a stronger guarantee on malformed real-world HTML than Turndown+jsdom, and much stronger than html2text or node-html-markdown, which are more brittle outside well-formed input.

**Cross-language consistency:** Because every binding shares the same Rust renderer, output matches across Rust, Python, Node.js, Ruby, PHP, Go, Java, .NET, Elixir, R, Dart, Swift, Zig, and WASM — a real advantage if you ever need byte-identical Markdown from both a Python service and a Bun service, which none of Turndown/node-html-markdown/Markdownify/html2text can promise since they're independent implementations with their own quirks.

**Extras beyond conversion:** it returns a structured result — Markdown plus metadata, links, headings, images, tables, and warnings, not just a string — which the pure-JS libraries and Python libraries don't give you out of the box (you'd have to parse the HTML yourself separately for that).

**Where Turndown/rehype-remark still win:** extensibility. Turndown's rule system and rehype-remark's AST access let you hook custom per-element transforms, strip/rewrite specific tags, or inject custom Markdown nodes in JS directly. Kreuzberg's core logic lives in Rust — visitor/hook support exists for Python and TypeScript/Node.js bindings (both sync and async), described as suited for server-side bulk processing, but customization is inherently more constrained/indirect than manipulating a JS-native AST, and Go/Java/C# bindings don't get visitor support at all.

### Bottom line for your stack (Bun)

Given you're already on Bun and care about speed, `@kreuzberg/html-to-markdown` (native NAPI binding) is very likely your best default choice — faster than Turndown+linkedom, more robust against malformed HTML, and gives you matching output if a Python service ever needs to do the same conversion. Reach for Turndown+linkedom instead only if you need heavy custom per-tag transform logic that's easier to express as JS rules than as hooks into the Rust pipeline.