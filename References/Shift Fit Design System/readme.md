# Shift Fit — Design System

**Shift Fit** is a fitness app for shift workers: workout tracking plus fatigue tracking,
built for people whose training week is cut across nights, swings and rest days. It is a
data instrument first and a fitness app second — the product's job is to tell a nurse
coming off her third night whether to lift heavy, lift light, or sleep.

The target surface is the **Shift Fit mobile app** (dark mode only). This project is the
brand + design system sheet for it: foundations, guidelines and reusable primitives — not a
product recreation.

## Sources given

| Source | What it provided |
| --- | --- |
| `uploads/favicon.png` (64×64 PNG, supplied by the user) | The only real brand asset — a dark rounded-square app mark with a white "S" and radiating spark strokes. Copied to `assets/app-icon.png` and upscaled to 256/512 for lockups. |
| Written brief (chat) | Company description, font pairing rationale, and the five core colour values. |

No codebase, Figma file, screenshots or slide deck were supplied. **No wordmark or logo
file was supplied** — the wordmark in this system is set in plain type (Space Grotesk 700,
"Fit" in amber) rather than reconstructed, and the only image mark used anywhere is the
user's own favicon. If a real logo exists, drop it into `assets/` and the lockup cards
should be updated to use it.

### Substitutions to confirm
- **Fonts are loaded from Google Fonts, not licensed binaries.** Space Grotesk, Inter and
  JetBrains Mono are all Google Fonts, so the pairing is exact — but `tokens/fonts.css`
  links the CDN. Send self-hosted files if the brand needs them offline.
- **JetBrains Mono is an addition, not a brief requirement** (see Intentional additions).
- **Icons are Lucide via CDN.** No icon set was supplied; Lucide's 2px-stroke geometric
  outline set matches the technical, mechanical tone of Space Grotesk. Flagged for review.

---

## CONTENT FUNDAMENTALS

The voice is a **competent colleague on the same shift**. It knows the user is tired, does
not pretend otherwise, and never sells.

**Person.** Second person for instruction ("Keep it to technique"), first-person possessive
only in settings ("Export my data"). Never "we" — the app doesn't have a personality to
refer to.

**Casing.** Sentence case everywhere: headings, buttons, list rows, dialog titles.
UPPERCASE is reserved for micro-labels, eyebrows and badges — that uppercase-with-tracking
treatment is the instrument-panel signal and loses its meaning if used for headings.

**Sentence shape.** Short declarative sentences. State the number, then what to do about
it. Two sentences maximum in any body block.

**Emoji: never.** Not in copy, not in labels, not in notifications. The one warm element on
screen is the amber accent; emoji would compete with it.

**No exclamation marks, no streak-shaming, no hype.** "Nice work!!" and "Don't break your
streak" are both wrong. The app never guilts a user who slept four hours.

**Numbers are exact and unit-suffixed.** "18,420 kg", "5:40 hrs", "4 × 8", "62". Never
"lots", "a bit", "almost there". Deltas always carry a comparison: "+6.1% vs last week".

**Shift language is literal.** "Night 3 of 4", "Off day 1 of 4", "4 on / 4 off". Days of the
week are unreliable for this audience — rota position is the true clock.

Examples that are correct:
- "Third night running. Technique work only — hold loads at 70%."
- "Your readiness dropped 8 points overnight."
- "Log a sleep window after your next shift and the trend starts here."
- "You have two sets left in this block."

Examples that are wrong:
- "Let's crush it 💪" (hype, emoji)
- "Oops! Looks like you missed a workout." (apologetic, guilting)
- "Feeling tired? Try to get more rest!" (vague, no number, exclamation)

---

## VISUAL FOUNDATIONS

**Palette.** Five values carry the whole system: background `#0D1117`, surface `#161B23`,
primary steel blue `#4A7A9E`, amber accent `#E0A458`, support grey `#98A2B0`. Everything
else is a ramp derived from those (`tokens/colors.css`).

**Colour discipline.** The screen is cool. Amber is the *only* warm note and it means one
thing — effort or progress — so there is at most **one amber object per screen**: the
start/log button, the live progress bar, or the "now" bar in a chart. Blue means
navigation, confirmation and informational data. Hue means severity only inside the
5-step fatigue scale and the fixed shift-phase colours.

**Type.** Space Grotesk (600/700, −0.02em) for every heading and title — its mechanical
geometry is the "instrument" cue. Inter (400/500) for all prose, labels and controls.
JetBrains Mono with tabular figures for **every number the user reads**, so digits don't
jitter as values tick. Never mix roles: no Grotesk body copy, no Inter metrics.

**Spacing & layout.** 4px-based scale (2 → 80). Fixed rules: 20px screen gutter, 16px card
padding (20px for hero cards), 24px between sections, 44px minimum tap target, 56px top
bar, 64px tab bar. Screens are single-column and scroll; the top bar and tab bar are the
only fixed elements.

**Backgrounds.** Flat near-black. **No photography, no illustration, no gradient washes, no
textures or patterns.** The only gradient in the system is the loading scan-sweep
(transparent → 22% amber → transparent). Data is the imagery.

**Cards.** `#161B23` fill, 1px `rgba(255,255,255,.06)` hairline, 14px radius, `shadow-sm`.
Depth is expressed as **surface value plus a hairline**, not as shadow: nest
inset → card → raised → overlay. Never a coloured left border; tinted callouts use a full
14%-opacity fill instead.

**Radii.** Controls 10px, cards 14px, sheets 20px (top corners only), wells 6–8px, pills
reserved for badges. The phone frame is 38px.

**Shadows.** Deep and low-opacity, never soft grey blooms: `sm` 0 1px 2px/40%, `md` 0 4px
12px/45%, `lg` 0 12px 32px/55%, sheets cast upward. Inner hairline highlight
(`inset 0 1px 0 rgba(255,255,255,.05)`) is optional on raised surfaces. **Glow is a state,
not a style** — `glow-accent` marks a live session only.

**Transparency & blur.** Two uses only: the dialog scrim (72% ink-950 + 6px blur) and
tint fills at 14–16% for callouts and quiet buttons. No frosted nav bars, no glassmorphism.

**Motion.** Mechanical, no bounce, no overshoot. Tap 80ms, hover/colour 140ms, toggles and
toasts 220ms, progress fills 320ms, bottom sheets 420ms, gauge/needle fill 900ms with
`ease-mechanical` (.5,0,.2,1). Four signature motions: **needle fill** (arcs and bars fill
once on entry), **rise-in** (8px up + fade for toasts and sheets), **breathe** (2.4s
opacity pulse on the live-session dot), **scan sweep** (amber band across a skeleton while
loading). Everything collapses to 1ms under `prefers-reduced-motion`.

**Hover states.** Desktop/hover surfaces lift by *light*, not colour: `rgba(255,255,255,.04)`
overlay, plus text moving from secondary to primary. Filled buttons step one stop lighter
on their ramp (blue-500 → blue-400).

**Press states.** Filled buttons step one stop *darker* (blue-500 → blue-600) and scale to
0.97. Quiet surfaces go to `rgba(255,255,255,.07)`. No ripples.

**Focus.** 2px background ring + 2px blue-400 ring (`--focus-ring`); fields also get a 3px
18%-blue halo.

**Borders.** Hairlines do the structural work: `rgba(255,255,255,.06)` for card edges and
dividers, `#2D3743` for form fields, `#3C4854` for emphasised outlines. Dashed borders only
to annotate specs, never in product.

**Imagery vibe.** If imagery is ever introduced it must be cool, desaturated, high-contrast
and low-key — night light, steel, sweat under fluorescent. No warm gym-lifestyle stock, no
orange-teal grade. Currently the system ships **no** photography.

---

## ICONOGRAPHY

- **Set: Lucide, 2px stroke, geometric outline** — loaded from
  `https://unpkg.com/lucide-static@0.544.0/icons/<name>.svg`. This is a *substitution*: no
  icon set was supplied. Flagged for review.
- **Rendering: CSS mask, not inline SVG.** The `Icon` component paints the Lucide file as a
  `mask-image` over `currentColor`, so icons inherit text colour and can be recoloured with
  a token. Do not paste SVG paths into components and do not use PNG icons.
- **Sizes:** 16 / 20 / 24 / 32. 20 is the default; 16 inside buttons and rows; 24 in tab
  bars and leading list slots; 32 in empty states.
- **Colour:** icons are almost always `--text-secondary` or `--text-tertiary`. Coloured
  icons only carry semantics (green/amber/red in recovery actions, amber for the active tab).
- **Canonical glyph set:** activity, dumbbell, moon, sun, bed, coffee, timer, heart-pulse,
  battery-medium, trending-up, trending-down, calendar-days, chevron-left/right/down, plus,
  minus, check, x, bell, user, watch, download, log-out, info, alert-triangle, alert-circle,
  check-circle, library, play, more-horizontal, trash-2, mail, wifi, signal.
- **Emoji: never.** **Unicode symbols as icons: never**, with two typographic exceptions
  used inside strings — the multiplication sign in set notation ("4 × 8") and the middle dot
  as a metadata separator ("Chest · Barbell").
- **Brand mark:** `assets/app-icon.png` (plus 256/512 upscales) is the user's supplied
  favicon. It is an image asset, never re-drawn, never recoloured, never used as a UI icon.

---

## Index

| Path | What it is |
| --- | --- |
| `styles.css` | Global entry point — `@import` list only. Consumers link this one file. |
| `tokens/` | `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `radius.css`, `elevation.css`, `motion.css`, `base.css` |
| `assets/` | `app-icon.png`, `app-icon-256.png`, `app-icon-512.png` |
| `guidelines/` | 22 specimen cards: Brand (3), Colors (8), Type (5), Spacing (4), Motion (2) |
| `components/` | 25 React primitives in 5 groups (below) |
| `thumbnail.html` | Homepage tile |
| `SKILL.md` | Agent-Skills wrapper for use outside this project |

### Components

**core/** — `Icon`, `Button`, `IconButton`, `Card`, `Badge`, `Tag`
**forms/** — `Input`, `Select`, `Checkbox`, `Radio`, `Switch`, `Stepper`
**data/** — `MetricTile`, `FatigueGauge`, `ShiftRibbon`, `SparkBars`, `ProgressBar`
**feedback/** — `Toast`, `Dialog`, `Tooltip`, `EmptyState`
**navigation/** — `TopBar`, `TabBar`, `SegmentedControl`, `ListRow`

Each has a sibling `.d.ts` (props contract) and `.prompt.md` (what/when + usage).

### Intentional additions

No source defined a component inventory, so this is an authored standard set. Four
additions beyond the generic primitives, each because the product's core job needs it:

- **`FatigueGauge`** — the fatigue score is the product's headline number; it needs a
  banded arc, not a progress bar.
- **`ShiftRibbon`** — rota position is the app's real calendar; no generic component
  expresses "night / swing / day / off" per day.
- **`SparkBars`** — axis-free trend bars for tonnage and sleep, sized to sit inside a card.
- **`Stepper`** — mid-workout numeric entry with 40px targets, usable one-handed.
- **`Icon`** — a wrapper over the Lucide CDN set so glyphs are recolourable by token.
- **`JetBrains Mono`** (token, not component) — the brief named two fonts; a tabular mono
  was added because every screen is a readout and proportional digits shift as they tick.

### Not built

This is a **brand and design system sheet only** — foundations, guidelines and reusable
primitives. No product screens, app recreation, slide template, marketing site or email
templates are included. Ask if you want any of them built on top of these foundations.
