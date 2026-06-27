# The Tokens Project

**This repo is a parsing architecture where grammar rules compile into regular expressions, source code is mapped into a string of Unicode characters, and the parser never has to throw your work away to understand it. Built to enable a new category of code editors.**

## Table of contents

- [The problem](#the-problem)
- [The proposed solution](#the-proposed-solution)
- [Why this repo exists](#why-this-repo-exists)
- [The basic flow](#the-basic-flow)
- [The implementation](#the-implementation)
- [The sample language](#the-sample-language)
- [Project status](#project-status)
- [About myself and this project](#about-myself-and-this-project)
- [License](#license)

---

## The problem

AI now writes a large share of the code in most modern stacks, and tools like Cursor, GitHub Copilot, Claude Code, and Grok Build are growing accordingly. But the productivity story is shakier than it looks: independent research keeps finding higher vulnerability rates in AI-generated code, longer debugging time, and low developer confidence in AI output, especially as projects diverge from low-entropy problem spaces (i.e. CRUD work).

The usual response is "better AI is on the horizon". But more code, written faster, by more agents, is exploding the volume of _code nobody understands_. Throwing more AI at your project won't help what's actually become scarce: the bandwidth to comprehend and maintain code once it's been written.

## The proposed solution

> This is *speculative-but-plausible*. Those looking for roast material for HN / Reddit should instead consider seeking employment.

**TL;DR**: If we tweak the mechanics of the surface where we perceive and touch code—the editor—I believe we can *vastly* improve code comprehension per unit of time (especially at scale). And serendipitously, it seems we can trim output token costs *dramatically*. Read further to discover how I got there.

The industry has standardized on text-based (character-centric) editing. Typing characters anywhere is chaotic, it balloons the complexity of the compiler behind it, and it leaves a ton of opportunity on the table. But this is for good reason–it's seen as the cost of non-negotiable flexibility.

The other, lesser known editing paradigm is called *Projectional Editors* (JetBrains MPS, others). Instead of being character-centric, they're *node-centric*. They're a higher-level UI where AST nodes are mutated directly. They sound great in theory:

- Never broken editing
- You unlock something like "syntax-free programming". Imagine typing `if` and tabbing through slots replaces typing punctuation — the same shift as command-line versus GUI, applied to code.
- UI isn't constrained to text—render or animate anything anywhere. Imagine UIs like *code exposé* where on the strike of a hotkey you animate from actual code into an architecture diagram showing whole-program module visibility.
- A vast expansion in the language design solution space. Rather than playing a game of arranging 95 unique ASCII characters on an 80xN grid, the full spectrum of HCI verbs are on the table.

But then you try to use one, and it feels like being in a totalitarian police state. They don't let you think out loud, half-finish a thought, or get into a flow state the way a text buffer does.

However, I see a third paradigm—a middle-ground that hasn't been well explored. If text-based editing is too granular, and node-based editing is too coarse, then perhaps the optimal editing granularity is actually the representation that exists in the middle of those two states in a compiler. Perhaps we ought to be **editing at the level of the token**.

Imagine this: light guardrails preserve delimiter balancing and basic syntax forms, but editing goes from shuffling *individual characters* around a canvas to shuffling around *whole tokens*. **This may sound inconsequential**—and that's a feature, not a bug. If (very big **IF**) you can slam-dunk the UX, it would mean that only minor changes to the interaction paradigm are necessary to break from *95-ASCII-characters-on-an-80xN-grid*, and dramatically expand what compilers and code intelligence tools can safely do.

For example, the *minimum viable guardrails* would be just enough to avoid huge swaths of the AST going up in flames every time someone types a character. And tokens carry persistent identity, giving the editor and compiler a continuous view of the program across time. All this opens the door to a richer refactoring API and more targeted recompilation. Today's tooling often has to rebuild the world in the ~80ms between keystroke and acknowledgement. But I suspect we can unlock much heavier real-time analysis.

Where I suspect this leads is a blurring of the line between a character edit and a deep refactor. Imagine complex natural-language refactor requests from the author (or an LLM) compiling into large-scale deterministic transformations against a rich compiler API.

The result: vastly more powerful editor intelligence, safer AI collaboration, and new kinds of refactoring, made possible by a foundation that's sturdier than lines of text. And I foresee _huge_ output token cost savings, because AI agents can issue high level code modifications instructions in real-time with surgical precision, rather than re-generating entire contexts.

*Caveat: Yes this is bounded by the soundness of the underlying language. Tokens with IDs won’t magically turn a dynamically typed dumpster fire into something safe.*

## Why this repo exists

There are unsolved HCI problems blocking a token-based editor, and I needed a supporting architecture in order to start running editor trials.

Once tokens need to be UI-addressable at scale — not just inlays and decorations bolted onto a tree, but live widgets bound directly to code primitives being edited — you've boarded a UFO and left orbit. The usual parsing styles (LL / LR / L-whatever, tree-sitter, recursive descent, others) hand you a tree to *query*, not objects a UI can *retain* across edits. After fighting with many off-the-shelf options, I ended up creating something that, at least to me, looks like a new parsing paradigm. It seems general enough to apply to many languages.

> If it turns out this technique is academically novel, I'd like to formalize it in a paper. **If you're an academic and you're interested, please [reach out](https://x.com/imyoungpaul)**.

## The basic flow

In this parsing system, the goal is to trim code volume and offload as much of the heavy lifting to a stock regular expression engine as possible. The steps are as follows:

1. Lex raw source into **tokens**, which are either *fixed* ("if", "return") or *flex* ("foo", "12.34")
2. Group tokens into a tree of **tapes** — runs of tokens bounded by delimiters, which can nest more tokens or tapes.
3. Assign every token type its own Unicode proxy character.
4. Represent any tape as a **charstring** — just the sequence of those Unicode proxy characters.
5. Define grammar rules ("masks") as classes with a small declarative `schema()`, and auto-generate a regex for each one. Each mask gets its own Unicode proxy character as well.
6. Match those regexes against the charstring. Wherever one matches, slap a Mask on top of the matched span. Because the Mask itself has its own proxy character, applying it causes the charstring to update, and the process continues until the whole tape is "masked" and there are no tokens peeking through (or we run out of masks to attempt).

As a result, there's zero construct-specific parsing logic. Parsing behavior emerges from generating regexes from declarative schemas and handing the matching problem to an engine that's already fast, well-tested, and built-in. 

## The implementation

**Tapes, fragments, lenses.** Lexing is handled by [Moo](https://github.com/no-context/moo) with some conventional rules. A lightweight delimiter-aware scanner groups the lex'd tokens into a hierarchical tree of *tapes*. Tapes get subdivided into **fragments** via some basic whitespace rules. Finally **lenses** are bounded views over a tape, which is necessary to establish boundaries for regex matching, for example, when applying masks to the expression side of a `foo = 1 + 1` statement.

**Charstrings.** `cat is Animal` — understood as `Entity–Keyword–Entity` — becomes a three-character string of Unicode proxies, e.g. `✏⚱✏`. Proxy characters are drawn from a dedicated range (`U+25A9`–`U+275C`); a generated legend is available on request. This charstring is what every match step actually runs against.

If you want to see how charstrings actually work, I built a debugging helper that emits the charstring legend. You can see it [here](./docs/legend.md).

**Masks.** A mask is a grammar rule with a `schema()`, built from six primitives — `X.one()`, `X.many()`, `X.some()`, `X.lasso()`, `X.has()`, `X.raw()` — plus "structural" tokens that anchor a match without carrying data themselves. Here's a real one, matching postfix calls and index access:

```ts
/** .term(x)(x)[x][x] */
export class PostParticleMask extends X.Mask
{
	readonly term: X.EntityToken | X.ParticleLiteralToken = X.unset;
	readonly activators: (X.FunctionActivatorMask | X.IndexActivatorMask)[] = X.unset;
	
	schema() { return {
		...X.structural(X.tokens.dot),
		term: X.one(X.EntityToken, X.ParticleLiteralToken),
		activators: X.many(X.FunctionActivatorMask, X.IndexActivatorMask),
	}}
}
```

Each field maps to a named capture group, so a match isn't just yes/no — it tells you exactly which tokens bind to which field. For example, here is what the compiled Regex looks like for `PostParticleMask`:

```
^⛊(?<term>[✌✏])(?<activators>[▢▤]{0,})$
```

Two ordering effects matter: mask definition order acts like production-rule priority (it's how order-of-operations gets resolved), and token definition order matters because proxy characters are assigned sequentially, so grouping related tokens (all assignment operators, say) lets their regex collapse into a character-class range instead of a long alternation. A flat, single-layer regex per mask also under-constrains the match — too many masks can technically fit a span. The fix is generating mask regexes in layers, embedding a simplified version of a referenced mask's regex inside the one that references it, which cuts ambiguity substantially. I don't yet have a clean rule for exactly when layering is required versus unnecessary, but for now we just do 1-level of embedding and it seems to disambiguate sufficiently.

**Mask application == reverse Tetris.** Applying a mask shrinks the charstring: Start with four tokens. A mask captures the middle two, leaving three characters. The interesting part is what happens when a new, *wider* mask comes along that would capture at least one previously unmasked token. Think of it as Tetris played from the bottom up: the new mask is a block popping up from below, and any masks currently sitting where it needs to land get pushed up and then re-attached as properties on the new, bigger mask that just locked into place. This can cascade multiple layers deep. The result is a base layer of raw tokens with N layers of masks stacked above it, constantly being torn apart and rebuilt as wider matches get found. 

The process has to be non-destructive, because the editor's rendering model depends on tokens staying put. Edit a tape, and only the masks actually touching that edit get evicted; everything else is untouched.

**Enclosures.** An `EnclosureMask` matches a tape end-to-end, gated by a delimiter type. From outside, it only exposes its delimiter's proxy character — contents are invisible until something descends into it. So `doSomething(1, 2)` looks like `ENTITY-TOKEN PAREN-TAPE` from the entity's side; the `1, 2` doesn't exist yet at that level. This is what keeps higher-level matching cheap.

**Unmasked tokens.** Anything left over after every candidate mask has been tried is flagged, not fatal. The rest of the file keeps working. That's a deliberate guard against the "one missing `}` and the file is cooked" failure mode mainstream parsers have.

## The sample language

All of the above is built against a general-purpose language I threw together, which is mostly a variant of TypeScript but with grammar changes to make it work better with token-based editing.

## Project status

The core engine is structurally present but **very WIP**.

- Lex → tape → charstring → mask matching works end-to-end.
- Eviction, layering, and EnclosureMasks are implemented and functioning.
- Enough production rules exist to parse a basic function — a meaningful start, far from complete.
- Tests are MIA and need real investment before I'd treat it as strong evidence of correctness.
- The docs are unfortunately "just ask Claude bro". More work needed.
- More refactoring is needed to fully separate the framework from the sample language.

**Expect turbulence.** APIs, the mask schema, and the proxy-character scheme are all still moving as the grammar grows. Come in expecting a research engine that works, not a stable library. The sample language is also somewhat stapled to the engine. The plan is to separate "framework-general" code from "language-specific" code in the near future so that we have a reusable parsing engine.

## About myself and this project

I've been building this alone, privately for a few months. But it's informed by _decades_ of past work (and scars) on non-text code editors, language design, and compiler architecture.

It turns out I know a few things about this particular niche. I was one of the founders of Skybound Research, the company behind the much-loved Stylizer CSS Editor, which was a non-text code editor for CSS. Although I designed it around the time of the dinosaurs (before the first iPhone), it was _way_ ahead of its time.

**Your skepticism around whether this project's goals are viable is warranted**. Designing a non-text code editor that developers actually love is the _kind of hard_ that's difficult to grasp until you've been through it. Early versions of Stylizer were _miserable_ to use. We were *years* doing things like tuning novel input patterns via low-level mouse hooks before it finally made you more productive.

If you're an editor/tooling builder, or someone invested or just interested in the future of code authorship — I'd like to know what breaks, what's prior art under a different name, or just collaboration in general. Issues and discussion are open for exactly that. Or follow me on [X](https://x.com/imyoungpaul). DMs are open.

## License

MIT — see [LICENSE](LICENSE).