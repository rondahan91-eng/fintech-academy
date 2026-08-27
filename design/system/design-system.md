---
version: "alpha-2"
name: "FinTech Academy"
description: "FinTech Academy — a warm, semi-hi-tech design system for a year-long fintech simulation platform that teaches Python programming, guided by an AI mentor avatar. A trustworthy foundation (clear data typography, calm motion) with an inviting gradient-and-glow layer on top. Hebrew-first RTL interface with LTR code islands; every screen is an application screen at 1366×768 with no vertical slack."
colors:
  primary: "#3D6FE5"
  primaryAccent: "#8B5CF6"
  secondary: "#16A34A"
  tertiary: "#B8860B"
  neutral: "#4A5568"
  surface: "#FFFFFF"
  accent: "#F8F9FD"
  pending: "#F4EBE4"
  pendingInk: "#7A6A5E"
  breach: "#9C463B"
  breachWash: "#F5E2E0"
typography:
  h1:
    fontFamily: sans-serif
    fontSize: 2.25rem
    fontWeight: 700
    letterSpacing: "0"
  body-md:
    fontFamily: sans-serif
    fontSize: 1rem
    fontWeight: 400
    letterSpacing: "0"
rounded:
  sm: 8px
  md: 12px
  lg: 16px
components:
  button-primary:
    backgroundColor: "linear-gradient(135deg, {colors.primary}, {colors.primaryAccent})"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: 12px
---

## Overview

FinTech Academy is the visual design system for a year-long Python programming course built around realistic payroll/salary-calculation exercises. Students work in a fixed three-column workspace — an AI mentor avatar (אלעד / Elad) on one side, a code editor in the center, task requirements on the other — guided week by week toward a monthly payslip their own code computes. The system favors clarity and precision over decoration: every color, spacing value, and motion rule is chosen to feel like a real, dependable product, because that realism is what makes the exercises land.

**This is an application, not a site.** There are five screens — weekly workspace, onboarding conversation, teacher dashboard, grades, payslip — and every one of them is a fixed 1366×768 working surface. There are no marketing pages, no hero sections, and no scrolling narrative layouts. Rules written for landing pages do not apply here and are not included.

- Density: 4/10 in student screens — airy, focused. **8/10 in the teacher dashboard** — it must show 30 students at once
- Variance: 3/10 — Restrained
- Motion: 3/10 — Subtle

- **Style:** Clean, Trustworthy, Inviting, Semi-hi-tech
- **Keywords:** fintech, Python, education, simulation, AI mentor, gradient, glow, data-driven, clarity, trust, hands-on
- **Era:** 2026 EdTech
- **Theme:** Light UI with a soft ambient gradient wash (ombre background, glow shadows on cards); the code editor's surface is the one intentionally dark area, for focus

## Language & Direction

**The entire interface is Hebrew, right-to-left.** This is not a localization layer — it is the design target.

- **Base direction is RTL.** Layout order, alignment, and icon direction all follow it. Column order is stated per screen in Layout and never mirrors between states.
- **Code and program output stay LTR inside Hebrew text.** Variable names, tracebacks, file paths, and version tags render left-to-right with `unicode-bidi: embed` and an explicit `direction: ltr`. This mixing happens on every screen and is a known failure point — bidirectional text that is not explicitly isolated will reorder punctuation and break at the wrong place.
- **Letter-spacing is `0` across the entire scale.** Negative tracking is common in latin display type and actively harms Hebrew: it collides final letters (ם ן ך ף ץ) with their neighbours and blurs the distinction between them. There is no "tight tracking" step in this system.
- **Fonts are served from the application, never from a CDN.** The deployment environment is a closed school network. The UI face must carry full Hebrew coverage including nikud — Assistant or Heebo are the safe choices. For code, use Consolas: it is present on every Windows machine in the building, so it costs nothing to load and cannot fail to resolve.

## Colors

- **Trust Blue** (#3D6FE5) — Gradient start. Primary actions, links, focus states, brand identity
- **Focus Violet** (#8B5CF6) — Gradient end. Always paired with Trust Blue (135deg) — never used as a flat solid on its own
- **Growth Green** (#16A34A) — Positive money values, gains, a test that has passed
- **Signal Gold** (#B8860B) — Time pressure and required action: a deadline approaching, a retake window closing
- **Working Sand** (#F4EBE4 wash / #7A6A5E ink) — **A test that has not passed yet**
- **Alert Red** (#E24C4C) — **Negative money values only**
- **Breach Red** (#9C463B ink / #F5E2E0 wash) — **Ethical violation only**
- **Slate Gray** (#4A5568) — Secondary text, borders, muted UI elements
- **White** (#FFFFFF) — Primary surface
- **Cool Gray** (#F8F9FD) — Base page background, secondary surface
- **Deep Navy** (#1E2A38) — Code editor surface, dark high-contrast areas

### A failing test is not an error

**Working Sand exists because a red failing test is the single most damaging default this product could ship.** A student runs the tests fifteen times before they pass. That is not fifteen errors — that is what working looks like. Marking it red forty times a week teaches him he is failing constantly.

A test that has not passed yet is warm neutral. It becomes Growth Green when it passes. **It is never red.**

### Breach Red is the only alarm in the product, and it is never about code

Reserved for a student harming a simulated customer: recommending the product that pays the bank more, scraping, or repeatedly pressuring the mentor for the answer. **It never marks a bug, a failed test, or a missed deadline.**

It is also the only state that renders as a **filled background band** rather than an ink colour on a dot or numeral — that structural difference, not the hue alone, is what separates it from Alert Red in a money column.

### Numeric convention

Pair Growth Green with positive/increasing money and Alert Red with negative/decreasing money — the standard finance-UI convention students will recognize instantly. **Note the narrowing:** Alert Red no longer covers errors or destructive actions. Errors live in the results area as plain text; destructive actions are guarded by a confirmation dialog, not by colour.

### Ambient background wash

Three large, softly blurred radial-gradient circles (Focus Violet, Trust Blue, Growth Green, each at ~10–16% opacity) positioned in the page corners/center behind all content, on the Cool Gray base. Decorative only — never place text or controls directly against a blob without the card surface between them.

## Typography

- **Display / Section heads:** Sans-serif — Weight 700, **letter-spacing 0**
- **Body:** Sans-serif — Weight 400, 16px/1.6
- **UI Labels / Captions:** Sans-serif — 0.875rem, weight 500, **letter-spacing 0**
- **Dense data (teacher table only):** 13px, weight 400 — the one place a caption size carries primary content, because 30 rows in 648px allows a 21px row and nothing taller
- **Numeric / Financial data:** Monospace with tabular figures — used for balances, prices, and any value that must align in a column

Scale:
- H1: 2.25rem
- H2: 1.5rem
- Body: 1rem / 1.6
- Small: 0.875rem
- Dense data: 0.8125rem

**No `clamp()` viewport scaling.** Every screen is a fixed 1366×768 working surface; type that grows with the viewport only introduces drift between the design and the build.

## Layout

- **Grid:** CSS Grid primary. **No global max-width container.** Application screens use the full viewport width minus their own padding and compute their own margins — the grades screen centers 1172px, the payslip 1132px, and the workspace fills 1366 less 32px of padding. A 1280px cap would silently take 86px off the editor and drop the target screen to what the layout spec calls its comfortable floor.
- **Spacing rhythm:** Base unit 0.5rem (8px). Gaps between regions are 16px or 32px; nothing larger appears on any screen.
- **Weekly work screen:** Fixed three-column workspace, order never changes — mentor avatar panel (360px) · code editor (flexible = screen width − 720px) · task column (296px). Below 1220px the editor absorbs the loss with line wrapping; only below 1140px does the task column collapse to a tab. **The mentor panel never collapses, at any width.**
- **Two-column screens (onboarding, teacher, grades, payslip):** A fixed narrower column (avatar, triage, or summary) paired with a wider working column — always the same physical side per screen, never mirrored between states.
- **Vertical budget — the binding constraint.** At 768px tall, after a 52px bar and 32px of padding, **684px remain and every screen spends all of them.** Any region that grows steals directly from the primary work area, so give resizable regions a sensible drag range instead of a fixed guess.
- **All stated heights are `border-box`,** and borders count toward them. Where a block's content exactly fills its stated height, use `outline` rather than `border` — an outline does not enter the box and the budget stays exact.
- **z-index contract:** base (0) / sticky-nav (100) / overlay (200) / modal (300) / toast (500).

## Elevation & Depth

Shadows carry a soft color tint lifted from the gradient — glow rather than flat gray — paired with restrained micro-interactions, highly legible typography, and data-first layouts. Warmer and more inviting on the surface; still grounded and dependable underneath, since the glow decorates and never competes with the data.

- **Glow shadow (cards, elevated surfaces):** `0 12px 32px -10px rgba(89,71,235,0.16), 0 2px 8px rgba(20,20,40,0.04)` — a soft violet-tinted lift instead of flat gray.
- **Physics:** Ease-out curves, 200–300ms duration. Smooth and predictable.
- **Entry animations:** Fade + translate-Y (12px → 0) over 380ms ease-out.
- **Staggered lists:** 60ms between items, **capped at 300ms total.** Uncapped, a 30-row teacher roster takes 2.2 seconds to finish appearing — on a screen whose entire purpose is a three-minute scan between lessons. Above roughly six rows, prefer no stagger at all: a data table should arrive, not perform.
- **Avatar state changes:** 200ms, **on stage change only** — never per message. An avatar that reacts to every sentence becomes an animation, and during the baseline questions it becomes feedback the student is not supposed to receive.
- **Hover states:** Subtle color shift + shadow adjustment over 200ms.
- **Page transitions:** Fade only (200ms).
- **Performance:** Only transform and opacity animated. No layout-triggering properties.

## Shapes

Base corner radius scale: 8px (sm — inputs, small controls) / 12px (md — buttons) / 16px (lg — cards, elevated surfaces). See rounded tokens in front matter for the full scale.

Named exception: the mentor chat input is fully pill-shaped (999px) — the one deliberately organic shape against an otherwise rounded-rectangle system.

## Components

- **Primary Button:** Rounded (12px). Gradient fill (Trust Blue → Focus Violet, 135deg), white text. Soft color-matched glow beneath at rest. Hover: 8% brighten + deeper glow. Active: -1px translate. Font weight 600. **One per screen.**
- **Secondary / Ghost Button:** Rounded (12px), outline variant. 1.5px border in Slate Gray, text in Trust Blue. Hover: subtle background fill. No gradient, no glow.
- **Cards:** Rounded (16px). White surface above the ambient wash, glow shadow, 1px hairline border to keep edges crisp.
- **Inputs:** Rounded (8px). Label above input, 1px border, focus ring 2px Trust Blue offset 2px, error text below in Alert Red. No floating labels.
- **Navigation:** White surface. Active item: gradient indicator. Weight 500 when active. **The top bar is identical on every screen and only the active item changes** — items never appear or disappear between screens. Future features (a shop that opens in week 5, peer review that unlocks at rank D3) are present from day one, dimmed, with what unlocks them. An item that shows for one student and not another is itself a rank signal.
- **Data tables:** Numeric columns right-aligned with tabular figures; positive values Growth Green, negative Alert Red. In dense tables (a 30-row class roster) **no chip/pill status badges** — a pill's own padding does not fit a 21px row. Use a single colored dot plus one word. **Add a hairline every 5 rows**, and budget for it: six groups means five separators, five pixels the table must be given.
- **Code editor:** Deep Navy background, light monospace text, `direction: ltr`. A thin gradient line (Trust Blue → Focus Violet) marks its top edge — the one deliberate spot of brand color against the dark surface. **Its bottom edge is a drag handle** (8px hit area, `row-resize` cursor, a visible centered grip roughly 32px wide) that resizes the results area beneath it. It must never render as a plain border line — a boundary drawn as a line gets built as a line.
- **Results area:** Tabbed, beneath the editor, base height 196px, drag range 196–376px, position saved per student. **The first time output overflows, the divider opens itself once** and then belongs to the student — one move teaches that it moves; a second is just an annoyance.
- **Test result rows — two forms.** When the test has a clean value pair: `✕ label — got 4,710 · expected 4,890`. When it does not: a short label with a plain-language explanation wrapped beneath it. **Forcing a comparison where none exists reads as absurd** — a floating-point rounding check would print "got 210.0 · expected 210.00000000000003". The test supplies `got`/`expected` separately from its message so the interface can tell which form applies.
- **Mentor avatar panel:** Full-bleed avatar art with a 48px fade at the bottom edge, a plain-text conversation thread below (same bubble treatment throughout — nothing marks certain messages as "the real content"), a single-line pill-shaped (999px) input pinned to the bottom. Fixed width and height; never resizes or collapses. **No glow or halo behind the avatar art** — the character stands on its own; the ambient wash stays on the page behind the panel, never inside it.
  - **Onboarding screen:** 420×520, the full framing, unscaled.
  - **Workspace panel:** **240px tall — a dedicated head-and-shoulders crop, not a scaled-down version of the 420×520.** At 296px wide that framing's ratio yields 366px and overflows the panel by 126px. This crop is an asset that still has to be produced.
- **Skeletons:** Shimmer animation matching component dimensions. No circular spinners.
- **Empty States:** Icon-based composition with descriptive text and action button. **A component with no value yet is not empty — it is scheduled.** An assessment that has not happened shows its week, not a placeholder.

## Do's and Don'ts

- No emojis in UI — use a single, consistent icon library (outlined or filled, never mixed). A lock on a gated feature is an icon, not 🔒
- No pure black (#000000) — use Deep Navy or charcoal variants
- No oversaturated accent colors (saturation cap: 80%)
- No negative letter-spacing anywhere — it breaks Hebrew final letters
- No unisolated bidirectional text — code, output and version tags inside Hebrew must carry explicit LTR direction
- No externally hosted fonts — the network is closed
- No global max-width container — application screens compute their own margins
- No viewport-scaled type or spacing — the target is one fixed screen size
- No `h-screen` — use `min-h-[100dvh]`
- No hype copywriting clichés: "Elevate", "Seamless", "Unleash", "Next-Gen"
- No broken external image links — use neutral placeholder imagery or inline SVG
- **No red on a failing test** — that is Working Sand, and it is the normal state of working
- **No Breach Red on anything other than an ethical violation** — never a bug, a failed test, or a missed deadline
- No generic lorem ipsum in demos — use exercise content that is arithmetically consistent. **A gross/tax/net figure shown anywhere must add up in the numbers as displayed**, because the student will subtract them; choose figures that divide cleanly rather than rounding lines independently
- No unstyled error output — Python tracebacks render inside the results area, never as browser alerts
- No comparison-style failure message when there is no clean value pair — use the explanation form
- No status chips/pills in dense data tables — a colored dot plus one word only
- No glow or aura behind character/avatar art
- No flat/solid Focus Violet fills — it only appears as the gradient's end color paired with Trust Blue (135deg)
- No countdown timer on student work — assessments and incidents are untimed. Deadlines are dates and they stay; a clock inside a working session does not exist, and would contradict the platform's promise that an interrupted session resumes exactly where it stopped
- No section gaps larger than 32px — there is no vertical slack to spend

- Do use Growth Green / Working Sand / Alert Red / Breach Red for their four distinct meanings and no others
- Do reserve the gradient for primary actions, the active nav indicator, the editor's top edge, and the ambient wash — **those four, and nothing else**
- Do keep shadows and motion restrained in intensity, even with color in them — glow, not flash
- Do use tabular numeric figures everywhere money or data appears
- Do keep typography highly legible at small sizes — students and teachers read dense tables
- Do treat vertical space as the binding constraint and give resizable regions a range, not a guess
- Do show a locked feature in place, dimmed, with its unlock condition — never reveal it for the first time when it unlocks

## Use Case

A year-long Python programming course: a weekly coding workspace guided by an AI mentor avatar, a teacher triage dashboard for a full class of 30, a grades screen, and a monthly payslip the student's own code computes.
