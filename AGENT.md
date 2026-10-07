# AGENT.md — Tesla STEM Biology 2 Notes

> **Read this first.** This file is the operating manual for any AI assistant (or human collaborator) editing this notes site. It explains the structure, the design system that must not be broken, and how to add new content safely. Follow it and the UI/UX stays consistent across every update.

---

## 1. Project Overview

**STEM Tesla · Biology 2 Notes** is a single-page, presentation-ready study website built for classroom projection, TV mirroring, and phone access via QR code. The current unit is **Genetics & Heredity**, but the site is designed as a **growing notes hub** — new biology units and chapters can be added without redesigning anything.

- **Live site:** tb2n.vercel.app
- **Repo:** github.com/ryzishin/tb2n
- **Section:** Tesla (the user's class section — that is why the brand says "STEM Tesla")
- **Tagline:** Explore. Practice. Apply. Discover Biology.

The site is intentionally **static and dependency-light** so it stays fast, deployable from a zip, and editable by anyone — including AI assistants who have never seen the codebase before.

---

## 2. Tech Stack

- **HTML + CSS + vanilla JavaScript.** No framework, no build step, no backend.
- **AOS** (Animate On Scroll) library, vendored locally in `vendor/`.
- **Deploy:** push to GitHub `main` → Vercel auto-deploys. No env vars.
- **Fonts:** system sans-serif stack + `JetBrains Mono` / `SF Mono` for genotypes.

This is **not** a Next.js / React project. Do not introduce one. The simplicity is the feature.

---

## 3. File Structure

```
tb2n/
├── index.html          ← the entire page (single file, all sections)
├── css/
│   └── style.css       ← all styles + design tokens (CSS custom properties)
├── js/
│   └── main.js         ← Punnett square simulator + AOS init + nav highlighting
├── vendor/
│   ├── aos.css         ← scroll animation library (DO NOT EDIT)
│   └── aos.js          ← scroll animation library (DO NOT EDIT)
├── assets/
│   ├── stem-logo.jpeg  ← Tesla STEM logo (header, hero, footer)
│   ├── hero-bg1.jpeg   ← unused legacy asset (safe to delete)
│   └── hero-bg2.jpeg   ← unused legacy asset (safe to delete)
├── AGENT.md            ← this file
└── README.md           ← optional, for humans
```

**Golden rule:** one `index.html`, one `style.css`, one `main.js`. Do not split the page into multiple HTML files. If the file gets long, that is fine — search and edit in place.

---

## 4. Design System — DO NOT BREAK

These are the tokens that make every page look like part of the same study site. You may **use** them in new components, but do not **change** them without an explicit user request.

### 4.1 Color Palette (defined in `:root` at the top of `style.css`)

| Token | Value | Purpose |
|-------|-------|---------|
| `--bg` | `#060c1d` | Page background (deep navy) |
| `--bg-2` | `#0a1430` | Secondary background |
| `--surface` | `#0f1c3d` | Card background base |
| `--surface-2` | `#14265c` | Elevated card background |
| `--ink` | `#eaf2ff` | Primary text (off-white, projector-safe) |
| `--ink-soft` | `#a9bede` | Secondary text |
| `--ink-mute` | `#6e84ad` | Tertiary / hints |
| `--line` | `#1f3160` | Default border |
| `--line-bright` | `#2b4690` | Emphasized border |
| `--blue-500` | `#2f7fea` | Primary accent |
| `--blue-700` | `#15448f` | Pressed / active state |
| `--cyan` | `#36e0ff` | Highlights, kickers, monospace numbers |
| `--rose` | `#ff4d6d` | Affected / danger |
| `--amber` | `#ffb454` | Carrier / blend / warning |
| `--emerald` | `#2ee6a6` | Normal / success |
| `--violet` | `#a78bfa` | Codominance B / dihybrid wrinkled-yellow |

**Theme:** dark navy with electric blue + cyan accents. Chosen for TV/projector readability — high contrast, no pure black (avoids that "flat hole" look), no pure white (avoids eye strain). Do not switch to a light theme unless the user explicitly asks.

### 4.2 Typography

| Element | Spec |
|---------|------|
| Body | system sans, 17px, line-height 1.65 |
| H1 (hero title) | `clamp(36px, 6.5vw, 76px)`, weight 800, letter-spacing −0.025em |
| H2 (section title) | `clamp(28px, 4vw, 44px)`, weight 800 |
| H3 (subsection) | `clamp(20px, 2.4vw, 26px)`, weight 800 |
| Kicker | 12px, uppercase, letter-spacing 0.22em, weight 700 |
| Mono (genotypes) | `JetBrains Mono`, `SF Mono`, Menlo, Consolas |
| Tagline | `clamp(18px, 2.4vw, 24px)`, weight 700, blue-100 color |

### 4.3 Spacing & Layout

| Token | Value |
|-------|-------|
| Container max-width | 1180px (92% on smaller screens) |
| Section padding | 96px vertical desktop / 64px mobile |
| Card border-radius | `--radius` = 18px |
| Card border | 1px solid `var(--line)` |
| Card padding | 28px default, 22px for `.mini` |
| Card shadow | `var(--shadow-md)` for normal, `var(--shadow-lg)` for hover |

### 4.4 Reusable Component Classes

These are the building blocks. **Reuse them** instead of inventing new ones whenever possible:

| Class | What it is |
|-------|------------|
| `.card` | Base surface card |
| `.card.prose` | Body-text card (white text, dark surface) |
| `.card.mini` | Compact card with title + bullet list |
| `.card.rule-card` | Card holding a numbered rule list |
| `.card.notation-card` | Card holding a symbol/notation list |
| `.card.law-card` | Mendel's-law style card with `law-num`, `law-title`, `law-tagline`, `law-example` |
| `.callout` | Highlighted "why this matters" box with left blue bar |
| `.kicker` | Small-caps eyebrow label above section titles |
| `.section-lede` | Lead paragraph below a section title |
| `.subhead` | Mid-section sub-heading with left blue bar |
| `.grid-2` / `.grid-3` | 2- or 3-column responsive grid |
| `.vocab-grid` | 4-column vocab card grid (collapses to 2 → 1) |
| `.law-grid` | 3-column law card grid |
| `.cross-grid` | 3-column cross-reference grid |
| `.index-card` | Notes-index chapter card (numbered, hover-lift) |
| `.btn-primary` / `.btn-ghost` | CTA buttons |
| `.mono` | Inline monospace (for genotypes, gene names) |

### 4.5 Punnett Square Cell Colors

The simulator uses these cell classes — extend, don't replace:

| Class | Color | Used for |
|-------|-------|----------|
| `.cell-affected` | rose | Affected (X-linked recessive) |
| `.cell-carrier` | amber | Carrier / heterozygote |
| `.cell-normal` | emerald | Normal / homozygous recessive (Mendelian) |
| `.cell-blend` | amber-violet | Incomplete-dominance heterozygote |
| `.cell-A` | cyan | ABO Type A |
| `.cell-B` | violet | ABO Type B |
| `.cell-AB` | cyan-violet gradient | ABO Type AB |
| `.cell-O` | neutral | ABO Type O |

---

## 5. How to Add a New Biology Chapter (Most Common Task)

Example: adding a "DNA Replication" chapter to this unit.

### Step 1 — Add a nav link

In `<nav class="site-nav">` near the top of `index.html`:

```html
<a href="#dna-replication">DNA Replication</a>
```

### Step 2 — Add a card to the Notes Index

Inside `<div class="index-grid">` in the `#index` section, add a new chapter card with the next available number:

```html
<a href="#dna-replication" class="index-card" data-aos="fade-up">
  <p class="index-num">07</p>
  <h3>DNA Replication</h3>
  <p>One-line description of what the chapter covers.</p>
  <span class="index-link">Read chapter →</span>
</a>
```

### Step 3 — Add the section

Inside `<main id="main">`, place the new section between existing sections. Use this template:

```html
<section class="section" id="dna-replication">
  <div class="container">
    <header class="section-head" data-aos="fade-up">
      <p class="kicker">Chapter 7</p>
      <h2>DNA Replication</h2>
      <p class="section-lede">One-paragraph intro that frames the topic and connects it to the rest of the unit. Aim for 3–4 sentences.</p>
    </header>

    <!-- Two-column body -->
    <div class="grid-2">
      <article class="card prose" data-aos="fade-up">
        <h3>Subheading</h3>
        <p>Body paragraph with <strong>bold key terms</strong> on first mention and <em>italic emphasis</em> for scientific names. Minimum 3 sentences per paragraph.</p>
        <p>Second paragraph developing the idea further...</p>
      </article>
      <article class="card prose" data-aos="fade-up" data-aos-delay="120">
        <h3>Another subheading</h3>
        <p>More content...</p>
      </article>
    </div>

    <!-- Optional callout -->
    <div class="callout" data-aos="fade-up">
      <p class="callout-title">Why this matters</p>
      <p>Real-world context, clinical connection, or exam relevance.</p>
    </div>
  </div>
</section>
```

### Step 4 — Alternate section backgrounds for rhythm

Mix these to create visual rhythm down the page (do not put two `.section-alt` next to each other):

- `<section class="section">` — default dark
- `<section class="section section-alt">` — slightly lighter, with top/bottom border
- `<section class="section section-sim">` — reserved for interactive / simulator sections

### Step 5 — Update the footer nav

Inside `<nav class="footer-nav">` at the bottom of `index.html`, add the new link:

```html
<a href="#dna-replication">DNA Replication</a>
```

### Step 6 — Update the recap (optional)

If the new chapter has exam-critical facts, add them to the `<ol class="takeaways">` list and/or the `<article class="card quick-hits">` bullet list in the `#recap` section.

**That's it.** No CSS or JS changes needed for a standard content chapter — the existing tokens cover it.

---

## 6. How to Add a Brand-New Unit

The site is structured so future biology units (e.g., "Cell Division", "Evolution", "Ecology") can live on the same page, each as a cluster of chapters. To add a new unit:

1. Add a `<section class="notes-index">` for the new unit right before its first chapter (mirror the existing `#index` section).
2. Number its chapters starting from `01` again — the unit name in the kicker provides context.
3. Add a unit-level entry to the main nav (e.g., a `#unit-celldivision` anchor).
4. Update the hero `hero-chips` row to mention the new unit.

If the site grows past ~10 chapters, consider splitting units onto separate HTML pages — but only then. Single-page is the default.

---

## 7. How to Extend the Punnett Simulator

The simulator lives in `js/main.js` and is organized by **modes**. Each mode is an object in the `MODES` map:

```js
var MODES = {
  mono: MONO,           // Mendelian monohybrid (2×2)
  di: DI,               // Mendelian dihybrid (4×4)
  incomplete: INCOMPLETE, // Incomplete dominance (snapdragons)
  codominant: CODOMINANT, // Codominance (ABO blood type)
  xlinked: XLINKED        // X-linked recessive
};
```

### To add a new mode (e.g., "Epistasis"):

1. **Define the mode object** with these required fields:
   ```js
   var EPISTASIS = {
     name: 'Epistasis',
     note: 'HTML description shown under the mode picker.',
     size: 2,  // 2 for monohybrid-style, 4 for dihybrid-style
     p1: [ /* array of { key, label, alleles } genotype options */ ],
     p2: [ /* same shape */ ],
     p1Sex: '♀',
     p2Sex: '♂',
     classify: function (a1, a2) {
       // a1, a2 are the two gamete alleles being combined
       return { genoHTML: 'Aa', classLabel: 'Phenotype Name', cls: 'normal' };
       // cls must be one of: affected, carrier, normal, blend, A, B, AB, O
     },
     outcomeNote: 'HTML string shown in the carrier-note line',
     parentGenoHTML: function (p) { return p.alleles.join(''); }
   };
   ```

2. **Register it** in the `MODES` map.

3. **Add a button** in `index.html` simulator controls:
   ```html
   <button type="button" class="seg-btn" data-mode="epistasis" aria-pressed="false">Epistasis</button>
   ```

4. **Add a default branch** in the click handler in `main.js` (look for `if (state.mode === 'xlinked')` etc.) so the picker opens on sensible default genotypes.

### Asymmetric modes (sex-linked, mitochondrial, etc.)

If the two parents have **different shapes** of genotypes (like X-linked where the mother has 2 X alleles and the father has 1 X + a Y), follow the `XLINKED` pattern — give the mode a custom `computeXLinked()` function instead of relying on the default `classify()` path. The framework already special-cases `state.mode === 'xlinked'`; add a parallel branch for any new asymmetric mode.

### Adding new cell colors

If a new mode needs a phenotype that doesn't fit existing classes (affected/carrier/normal/blend/A/B/AB/O), add a new cell class to `style.css`:

```css
.punnett .cell-newname { background: rgba(...); border-color: rgba(...); }
.punnett .cell-newname .cell-class { color: var(--accent); }
.stat-newname .bar-fill { background: linear-gradient(90deg, ...); }
.stat-newname .stat-pct { color: var(--accent); }
```

And add a corresponding chip class `.gno-newname` for the sex-breakdown chips. Keep colors within the existing palette family (blue/cyan/rose/amber/emerald/violet).

---

## 8. What NOT to Touch (Without Explicit User Request)

These are load-bearing — breaking them breaks the whole site:

1. **`vendor/aos.css` and `vendor/aos.js`** — third-party library, never edit.
2. **The `:root` design tokens** in `style.css` — changing colors or fonts breaks every page that uses them.
3. **`body::before` ambient gradient** — this is what prevents the page from looking like a flat black hole on a projector. Keep it.
4. **The `<header class="site-header">` structure** — sticky nav with brand + section links. Breaking it breaks navigation.
5. **The `<footer class="site-footer">` brand text** — currently says "STEM Tesla" by user preference.
6. **The hero tagline** — "Explore. Practice. Apply. Discover Biology." is the brand promise.
7. **The single-file structure** — do not split `index.html` into multiple pages without explicit approval.

---

## 9. Content Style Guide

These rules keep the writing consistent across chapters added by different people (or different AI sessions):

| Rule | Detail |
|------|--------|
| Tone | Clear, conversational, exam-focused. Like a smart classmate explaining, not a textbook lecturing. |
| Paragraph length | **3–5 sentences minimum.** No single-sentence paragraphs except for genuine transitions. |
| Section length | **150+ words of body content per heading.** Never a heading followed by 1–2 lines. |
| Examples | Every concept gets a worked example. Use `<div class="law-example">` or `<div class="callout">`. |
| Genotypes | Always wrap in `<span class="mono">X<sup>H</sup>X<sup>h</sup></span>` for proper monospace + superscript. |
| Bold | Key terms on first mention. |
| Italic | Scientific names, Latin terms, and emphasis. |
| Emojis | **Forbidden** in content unless the user explicitly asks. |
| Lists | Use `<ul class="mini-list">` for bullets, `<ol class="rule-list">` for numbered rules. Add explanatory context, not just bullets. |
| Numbers | Use `~1 in 5,000` style for frequencies, not `0.02%`. |
| Chapter numbering | Use two-digit format: `01`, `02`, ... `10`, `11`. |

---

## 10. Image & Diagram Conventions

- All images go in `assets/`.
- **Prefer inline SVG over raster images** for diagrams — SVGs scale perfectly on projectors and stay sharp at any resolution. See the family-tree SVG in the Sex-Linked section for a working example.
- The hero background is **CSS-generated** (gradient blobs + grid) — no image needed.
- If you must add a raster image, keep it under 200KB and use `.jpeg` for photos, `.png` only for transparency.
- Always add `alt` text to `<img>` tags and `aria-label` to decorative `<svg>`s.

---

## 11. Deployment

1. Push to `main` branch on `github.com/ryzishin/tb2n`.
2. Vercel auto-deploys within ~30 seconds.
3. Live URL: **tb2n.vercel.app**
4. No build step. No environment variables. No backend.
5. To deploy a fork or local copy: drag the project folder into vercel.com or run `vercel --prod` from the project root.

---

## 12. Accessibility Checklist

Before merging any change, verify:

- [ ] All interactive elements are reachable by keyboard (Tab + Enter).
- [ ] Color contrast stays above 4.5:1 for body text (the dark theme is designed for this — verify any new colors).
- [ ] Images and SVGs have `alt` or `aria-label`.
- [ ] The `skip-link` at the top of the page still works (it jumps to `#main`).
- [ ] The simulator buttons all have `aria-pressed` toggling correctly.
- [ ] No motion is essential to understanding content (AOS animations are decorative — `prefers-reduced-motion` disables them).

---

## 13. When in Doubt

- **Preserve the dark-blue presentation theme** — it is chosen for TV/projector readability.
- **Reuse existing component classes** before inventing new ones.
- **Keep the single-file structure** — do not split into multiple HTML pages.
- **Mobile-first** — every change should look fine at 360px wide. Test by resizing the browser.
- **Ask the user** before making sweeping changes to layout, theme, or information architecture.
- **When adding content, match the depth of existing chapters** — if "Genetics & Heredity" has 4 paragraphs and a vocab grid, your new chapter should have similar depth, not 2 bullet points.

---

## 14. Quick Reference — Section Anatomy

A typical chapter section looks like this:

```
<section class="section [section-alt|section-sim]" id="chapter-id">
  <div class="container">
    <header class="section-head" data-aos="fade-up">
      <p class="kicker">Chapter N · Topic Label</p>
      <h2>Chapter Title</h2>
      <p class="section-lede">3–4 sentence intro.</p>
    </header>

    [<div class="grid-2|grid-3|vocab-grid|...">  ← body content blocks </div>]
    [<h3 class="subhead">Mid-section heading</h3> + more blocks]
    [<div class="callout">  ← "why this matters" box  </div>]
  </div>
</section>
```

Stick to this anatomy and new chapters will look like they belong.

---

**End of AGENT.md.** If you are an AI assistant reading this for the first time, welcome — the site is yours to extend. Follow the rules above and the user will get consistent, presentation-ready notes every time.
