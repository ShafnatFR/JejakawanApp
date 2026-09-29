---
name: Jejakawan Split & Settle
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#464555'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#684000'
  on-tertiary: '#ffffff'
  tertiary-container: '#885500'
  on-tertiary-container: '#ffd4a4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.25rem
---

## Brand & Style

This design system establishes a focused, trustworthy, and modern utility aesthetic tailored for collaborative expense management and group splitting within outdoor and adventure travel settings. It bridges the energy of exploring with the calm precision needed for financial reconciliation among travel companions.

The aesthetic leans into modern corporate utility with a contemporary digital finish: clean surface segregation, deliberate structural whitespace, crisp typography, and high legibility. Avoid noisy gradients, distracting decorative illustrations, or skeuomorphic styling. Financial values, balance tallies, and member attributions must feel immediate, transparent, and authoritative.

## Colors

The palette relies on solid, purposeful functional colors:
- **Primary Indigo (`#4F46E5`)**: Primary CTAs (e.g., "+ Tambah Pengeluaran"), active navigation items, active tab segments, and interactive focus states.
- **Secondary Emerald (`#10B981`)**: Signals settled payments, positive credit balances, successful receipt uploads, and completed settlements.
- **Tertiary Amber (`#F59E0B`)**: Represents pending approvals, unsettled debts, and partial settlements.
- **Neutral Slate (`#64748B`)**: Powers structural secondary text, borders, dividers, subtle surfaces, and muted container outlines (`#F8FAFC`, `#F1F5F9`, `#E2E8F0`, and `#0F172A`).
- **Semantic Crimson (`#EF4444`)**: Reserved specifically for negative debt balances, overdue settlements, and destructive deletion actions.

Do not use clash-prone gradient fills on core containers or cards. Solid surface containers ensure maximum numerical legibility across mobile screens and desktop viewports.

## Typography

The type scale uses **Plus Jakarta Sans** across all hierarchies for geometric clarity, sharp figure numerals, and high readability in financial summaries. 

- Use **tabular figures** (`font-variant-numeric: tabular-nums`) across all financial tables, split balances, and currency sums (`Rp`) to prevent visual jitter during calculations.
- Display values (`Rp0`, summary metric cards) utilize `headline-lg` or `headline-md` at `fontWeight: 700`.
- Micro-labels beneath numeric figures use `label-sm` with subtle letter spacing (`0.02em`) in neutral slate tones (`#64748B`).

## Layout & Spacing

A 12-column responsive fluid grid governs desktop layouts (max-width: 1200px centered canvas), shifting to a 4-column layout on mobile devices (<768px).

- **Margins & Safe Zones**: Canvas padding scales from `1rem` on mobile screens up to `2rem` on wide displays.
- **Rhythm**: Spacing follows an 8pt increment model. Component gaps use `space-sm` (8px) for tightly grouped badges/chips and `space-md` (16px) for intra-card content blocks.
- **Section Breaks**: Vertical gaps between card grids, transaction tables, and action bars rely on `space-lg` (24px) to `space-xl` (36px).

## Elevation & Depth

This system avoids heavy, muddy drop shadows in favor of a crisp surface hierarchy combined with subtle slate border outlines:

- **Surface 0 (Background)**: `#F8FAFC` (Slate 50) for the application backdrop.
- **Surface 1 (Base Cards & Metric Containers)**: Pure white `#FFFFFF` bounded by a thin `1px` border of `#E2E8F0` (Slate 200). Elevation shadow is ultra-soft: `0 1px 3px rgba(15, 23, 42, 0.04)`.
- **Surface 2 (Hovered Cards & Interactive List Rows)**: White background `#FFFFFF` with a localized shift to border `#CBD5E1` and shadow `0 4px 12px -2px rgba(15, 23, 42, 0.08)`.
- **Surface 3 (Overlays, Modals, & Settlement Drawers)**: `#FFFFFF` floating over a `#0F172A` backdrop blur (opacity 40%), using shadow `0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.06)`.

## Shapes

The interface balances modern approachability and structure with roundedness level 2:
- Base inputs, buttons, and badges feature `0.5rem` (8px) corner radii.
- Metric summary cards, split bill receipt cards, and floating containers use `rounded-lg` (`1rem` / 16px).
- Modals, action sheets, and bottom sheets leverage `rounded-xl` (`1.5rem` / 24px) on their top or perimeter corners.
- Avatar chips and settlement status tags can utilize fully rounded pills (`9999px`) to distinguish categorical metadata from primary card blocks.

## Components

### Buttons
- **Primary Button**: Solid `#4F46E5` background, `#FFFFFF` text, `0.5rem` radius, subtle transition on hover (`#4338CA`), padding `0.625rem 1.25rem`. Integrated icons (e.g., `+`) sit left-aligned with `0.5rem` margin.
- **Secondary Button**: `#FFFFFF` background with `1px` solid `#E2E8F0` border, text `#334155`. Hover shifts to `#F8FAFC` and border `#CBD5E1`.
- **Settlement Button**: Solid `#10B981` background, `#FFFFFF` text, used for "Selesaikan Patungan" (Settle Balances).

### Metric Summary Cards (Top Row)
- Grid-aligned trio displaying **Total Pengeluaran**, **Anggota**, and **Rata-rata Per Orang**.
- Background `#FFFFFF`, border `1px` solid `#E2E8F0`, rounded `1rem`. Top icon tinted with a soft `#EEF2FF` circular badge containing indigo `#4F46E5` iconography. Value typography set to `headline-md` tabular bold.

### Input Fields
- White background `#FFFFFF`, text `#0F172A`, placeholder `#94A3B8`.
- Resting border `1px` solid `#CBD5E1`, transitioning to `2px` solid `#4F46E5` on focus with no noisy outer rings.
- Currency fields include a fixed prefix container (`Rp`) styled in `#64748B` on `#F1F5F9` background.

### Expense Item Rows / Lists
- Horizontal flex containers grouping payer avatar, category glyph (food, transport, camp permit), expense title, timestamp, and net amount.
- Bottom border `1px` solid `#F1F5F9`. Hover state renders `#F8FAFC`.
- Positive balances owed to the user render in bold `#10B981`, amounts owed by the user render in bold `#EF4444`.

### Member Chips & Splitting Toggles
- Compact chips showing member names and share ratios (Equal split `1/N` or custom amounts).
- Inactive state: `#F1F5F9` background, `#475569` text.
- Active toggle state: `#EEF2FF` background, `1px` solid `#4F46E5`, `#4F46E5` text.

### Empty States
- Clean, minimal layout centered vertically with an ultra-light slate `#94A3B8` icon container, friendly prompt text in `body-md`, and a direct primary action trigger to log the group's first trip expense.