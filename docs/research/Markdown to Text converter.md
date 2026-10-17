
Given you already have a solid HTML→Markdown pipeline, I'd recommend reusing it (HTML→Markdown→text) rather than adding a separate HTML→text converter. A few reasons:

**Why reuse the Markdown path:**

1. **Less surface area to maintain.** A dedicated HTML→text library is a whole separate dependency with its own edge cases (whitespace handling, entity decoding, block vs inline elements, `<pre>`, tables, nested lists). You've already paid that cost once for the Markdown converter — don't pay it twice.

2. **HTML→text libraries are often *less* battle-tested than HTML→Markdown ones.** Markdown conversion (Turndown, html2text, pandoc, etc.) is a much more common need, so those libraries tend to be more mature and handle weird real-world HTML better. Plain-text extractors are a smaller niche and vary a lot in quality.

3. **Markdown→text is genuinely easy and low-risk.** Stripping Markdown syntax is a well-understood, mostly mechanical transform: remove `#`/`*`/`_`/backticks, convert links `[text](url)` → `text` (or `text (url)`), flatten lists to plain lines with indentation, drop image syntax or replace with alt text, collapse code fences. There are also small libraries for exactly this (e.g. `strip-markdown` in the unified/remark ecosystem, or `markdown-to-text` packages) if you don't want to hand-roll it.

4. **Consistency.** Your Markdown and plain-text outputs will represent the same semantic structure (headings, lists, emphasis) predictably, since they come from the same intermediate representation. If you convert HTML→text directly, you risk subtle divergences between how the two outputs represent the same source HTML — e.g. list nesting or link formatting that looks different in each, confusing anyone comparing them.

**When direct HTML→text might make more sense instead:**
- If you need very high-fidelity plain-text layout preservation (like `lynx -dump` or `html2text` with table/whitespace layout logic) that a Markdown intermediate would lose.
- If performance matters and you're processing huge volumes — double conversion adds overhead, though this is rarely significant.
- If your Markdown converter is lossy in ways that matter for text (e.g., it drops certain content that plain text extraction would want to keep, like alt text or table cell text).

For most use cases (docs, emails, chat messages, notifications), the two-step approach is the pragmatic choice: less code, reuses proven behavior, and keeps your two output formats structurally consistent.

If you want, I can sketch a small Markdown→plain-text stripper function (or point to a specific library) based on what language/stack you're using — that'd help pin down how "easy" that step really is for your case.

---

For TypeScript, the main options are:

1. **`strip-markdown`** (remark plugin, part of the unified/remark ecosystem) — AST-based, so it actually parses the Markdown properly instead of regex-stripping it. Handles GFM tables, footnotes, etc. via plugins. Actively maintained, same family as `remark-parse`/`remark-stringify` which is probably the most "battle-proven" JS Markdown toolchain there is.
2. **`markdown-to-txt`** — small, simple, regex/marked-based wrapper. Lightweight but less robust with edge cases (nested lists, tables, weird inline syntax).
3. **Hand-rolled regex stripping** — fine for very simple, controlled Markdown, but breaks on edge cases (nested structures, code fences containing `#`/`*`, etc.).
4. **`html-to-text`'s markdown mode / pandoc via shell-out** — heavier, external dependency (pandoc isn't npm-installable), overkill here.

**Recommendation: `remark` + `strip-markdown`** — it's the same philosophy as recommending a battle-tested HTML→Markdown library: AST-based parsing beats string manipulation for correctness, and it composes well with `remark-gfm` if your Markdown includes tables/strikethrough/task lists.

Here's the implementation:Add this to `package.json` dependencies:

```json
"dependencies": {
  "unified": "^11.0.5",
  "remark-parse": "^11.0.0",
  "remark-stringify": "^11.0.0",
  "remark-gfm": "^4.0.0",
  "strip-markdown": "^6.0.0"
}
```

Notes:

- All of these are ESM-only (unified v11+), so your `tsconfig.json` needs `"module": "NodeNext"` (or `ESNext`) and `"moduleResolution": "NodeNext"` — same requirement you likely already hit if your HTML→Markdown converter uses `unified`/`rehype`/`remark`.
- `remark-gfm` is optional — drop it (and the `gfm` option) if your Markdown source never uses tables/task lists/strikethrough; it's cheap to keep either way.
- The manual unescaping step (`text.replace(/\\(...)/g, ...)`) is needed because `remark-stringify` escapes characters like `*`, `_`, `[` that *would* be Markdown syntax — even after `strip-markdown` removes the actual formatting — since it doesn't know the output is meant to be plain text rather than re-parsable Markdown.