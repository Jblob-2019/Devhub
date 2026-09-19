---
name: Developer Canvas
colors:
  surface: '#0b141c'
  surface-dim: '#0b141c'
  surface-bright: '#313a43'
  surface-container-lowest: '#060f16'
  surface-container-low: '#141c24'
  surface-container: '#182028'
  surface-container-high: '#222b33'
  surface-container-highest: '#2d363e'
  on-surface: '#dae3ee'
  on-surface-variant: '#c1c6d6'
  inverse-surface: '#dae3ee'
  inverse-on-surface: '#29313a'
  outline: '#8b909f'
  outline-variant: '#414754'
  surface-tint: '#acc7ff'
  primary: '#acc7ff'
  on-primary: '#002f68'
  primary-container: '#498fff'
  on-primary-container: '#00285b'
  inverse-primary: '#005bbf'
  secondary: '#7bdb80'
  on-secondary: '#00390e'
  secondary-container: '#007124'
  on-secondary-container: '#91f294'
  tertiary: '#d5bbff'
  on-tertiary: '#41008b'
  tertiary-container: '#a875fc'
  on-tertiary-container: '#39007a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d7e2ff'
  primary-fixed-dim: '#acc7ff'
  on-primary-fixed: '#001a40'
  on-primary-fixed-variant: '#004492'
  secondary-fixed: '#97f999'
  secondary-fixed-dim: '#7bdb80'
  on-secondary-fixed: '#002106'
  on-secondary-fixed-variant: '#005319'
  tertiary-fixed: '#ecdcff'
  tertiary-fixed-dim: '#d5bbff'
  on-tertiary-fixed: '#270058'
  on-tertiary-fixed-variant: '#5a21ab'
  background: '#0b141c'
  on-background: '#dae3ee'
  surface-variant: '#2d363e'
  canvas-default: '#0d1117'
  canvas-subtle: '#161b22'
  canvas-overlay: '#21262d'
  canvas-inset: '#010409'
  border-default: '#30363d'
  border-muted: '#21262d'
  fg-default: '#f0f6fc'
  fg-muted: '#8b949e'
  fg-subtle: '#6e7681'
  accent-fg: '#2f81f7'
  accent-emphasis: '#1f6feb'
  success-fg: '#3fb950'
  success-emphasis: '#238636'
  attention-fg: '#d29922'
  attention-emphasis: '#9e6a03'
  danger-fg: '#f85149'
  danger-emphasis: '#da3633'
  done-fg: '#a371f7'
  done-emphasis: '#8957e5'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Geist
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-xs:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-compact: 0.5rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system embodies utility-first minimalism engineered specifically for developer workflows, technical documentation, and high-density productivity tools. The visual voice is quiet, structured, and utilitarian—prioritizing content clarity, syntax distinction, and scannability above decorative embellishments.

The interface evokes focus, reliability, and precision. It draws from modern developer-grade minimalism and structured data display: crisp hairline borders, purposeful status cues, structured tabular surfaces, and monospaced accents. Interactions are immediate and responsive, designed to minimize visual friction during prolonged, complex sessions.

## Colors

The palette is tuned around developer canvas realities: high-contrast legibility against deep dark surfaces, mirrored symmetrically in a high-efficiency light theme.

- **Primary (`#2f81f7` dark / `#0969da` light):** Drives interactive elements, hyperlinks, active tab indicators, and branch markers.
- **Secondary (`#238636` / `#3fb950`):** Represents success, green commit additions, open pull requests, and verified checks.
- **Tertiary (`#a371f7` / `#8250df`):** Dedicated to merged branches, completed workflows, and release tags.
- **Surface & Hierarchy Tiers:** Surface elevation relies on calibrated canvas hexes (`#0d1117` base, `#161b22` card/panel containers, `#21262d` hover and popover layers). Structural dividers always utilize hairline borders (`#30363d` in dark, `#d0d7de` in light) rather than blurred shadows.
- **Status Anchors:** Alert orange/amber (`#d29922`) warns of pending CI runs or conflicts; danger red (`#f85149` / `#cf222e`) flags broken builds, closed states, and destructive actions.

## Typography

The typography scale utilizes Geist for core navigation, headings, and data reading, paired with JetBrains Mono for commit hashes, paths, syntax previews, branch names, and metadata counters.

- **Scale Rhythm:** Font sizing leans dense and compact (`14px` standard UI body, `12px` metadata, `13px` code).
- **Numerics & Code:** Commit SHAs, file line counts, diff tallies (`+14 -3`), and timestamps enforce tabular lining figures via the monospace family.
- **Hierarchy Rules:** Section titles and repository headings prioritize weight (`600`) over oversized scale to protect canvas real estate for source files and multi-column metadata grids.

## Layout & Spacing

The layout is built around a flexible, high-density 12-column grid system paired with strict 4px/8px modular rhythm rules.

- **Desktop (1280px+):** Max layout width bounds to 1280px or stretches across a 100% fluid dual-pane workspace (e.g., file tree sidebar at 280px fixed width + fluid editor/diff viewport). Section margins sit at `1.5rem` (`24px`) with `1rem` (`16px`) gutters.
- **Tablet (768px - 1023px):** Sidebars collapse into responsive off-canvas panels or stack above the primary feed; gutters adjust to `0.75rem` (`12px`).
- **Mobile (<768px):** Single-column stack with `1rem` outer canvas padding. Tabbed navigation transforms into scrollable horizontal strips. Tables convert into row cards with inline key-value pairs.
- **Information Density:** Spacing between nested items (e.g., file list rows, comment headers, status checks) is constrained to `space-xs` (4px) and `space-sm` (8px) to maximize immediate contextual visibility without scrolling.

## Elevation & Depth

This design system avoids heavy blurred drop shadows, utilizing low-contrast hairline borders and structured tonal layers to establish spatial boundaries.

- **Base Layer (Canvas):** The primary view surface sits at `canvas-default` (`#0d1117`).
- **Surface 1 (Cards, Code Blocks, Inset Panes):** Styled in `canvas-subtle` (`#161b22`) framed by a 1px solid border (`#30363d`).
- **Surface 2 (Flyouts, Menus, Popovers, Modals):** Uses `canvas-overlay` (`#21262d`) with a 1px perimeter border (`#30363d`) and an ultra-subtle, crisp ambient shadow: `0 8px 24px rgba(1, 4, 9, 0.4)`.
- **States & Hovering:** Hover states on list items, file rows, and secondary buttons change background color to `#21262d` without translating or lifting in 3D space. Transitions are instant (80ms–120ms ease-out) to preserve an immediate developer-tool tactile feel.

## Shapes

The design system adheres to a consistent 6px default corner radius (`roundedness: 1`), providing a slightly smoothed technical edge that avoids aggressive boxiness while remaining clean and compact.

- **Inputs, Buttons, Cards, & Panels:** Standardized at `6px` (`0.375rem`) border radius.
- **Tags, Commit Badges, & Branch Pills:** Full circular/pill radius (`9999px`) reserved specifically for discrete status tags, branch chips, and label indicators.
- **Code Snippets & Diff Blocks:** Outer frame matches `6px`, with inner preformatted blocks nested flush against hairline partition lines.

## Components

### Buttons
- **Primary:** Filled in `#238636` (green) with `#ffffff` text, 1px top highlight `rgba(255, 255, 255, 0.2)` inset border, and solid base. Padding is `5px 16px` with `label-sm` typography.
- **Secondary (Default):** Surface `#21262d`, text `#c9d1d9`, bordered by 1px `#30363d`. Hover changes surface to `#30363d` with `#f0f6fc` text.
- **Danger:** Subtle canvas surface with text `#f85149` and border `#30363d`; hover transitions to filled `#da3633` with white text.
- **Icon Buttons / Split Buttons:** 28px or 32px height with seamless border-connected dropdown carets.

### Input Fields & Search
- Background `#0d1117`, border 1px `#30363d`, text `#f0f6fc`. Focus state activates a 1px ring and border `#2f81f7` with 0 offset.
- Filter and command inputs feature leading icon slots (16px) and trailing keyboard shortcut tokens (`kbd` element in monospaced font with `#21262d` background).

### Badges, Tags & Commit Pills
- **Branch / Commit Pills:** `#161b22` surface, `#8b949e` text, 1px `#30363d` border, rounded-full shape, monospaced font (`code-sm`), embedded git-fork or commit icon.
- **State Badges:** Open PR (`#238636` bg, white text), Closed Issue (`#da3633` bg), Merged PR (`#8957e5` bg), rounded pill with `12px` bold text and icon.

### Data Tables & File Trees
- Flush list panels with outer border `#30363d` and corner radius 6px.
- Row items possess 1px border-top divider, padding of `8px 16px`, highlighting to `#161b22` on row hover.
- Metadata (commit message, time ago, file author) right-aligned with fixed column baselines.

### Cards & Repository Panels
- Background `#161b22`, 1px solid border `#30363d`, padding `16px`. Header area features primary repo title linked in `#2f81f7`, status visibility pill (`Public`/`Private`), description body, and trailing meta strip with language color dot, star counter, and fork tallies.

### Code Diffs & Syntax Containers
- Split or unified diff view. Additions set on `rgba(46, 160, 67, 0.15)` background with line numbers in `#3fb950`; deletions set on `rgba(248, 81, 73, 0.15)` background with line numbers in `#f85149`. Zero margins inside code lines, strict fixed-width line guttering.