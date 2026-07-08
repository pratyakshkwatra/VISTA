---
name: Vista
colors:
  surface: '#031427'
  surface-dim: '#031427'
  surface-bright: '#2a3a4f'
  surface-container-lowest: '#000f21'
  surface-container-low: '#0b1c30'
  surface-container: '#102034'
  surface-container-high: '#1b2b3f'
  surface-container-highest: '#26364a'
  on-surface: '#d3e4fe'
  on-surface-variant: '#c0c8c7'
  inverse-surface: '#d3e4fe'
  inverse-on-surface: '#213145'
  outline: '#8a9291'
  outline-variant: '#404848'
  surface-tint: '#9dd0cd'
  primary: '#9dd0cd'
  on-primary: '#003735'
  primary-container: '#2a5c5a'
  on-primary-container: '#a0d2cf'
  inverse-primary: '#356664'
  secondary: '#7bd0ff'
  on-secondary: '#00354a'
  secondary-container: '#00a6e0'
  on-secondary-container: '#00374d'
  tertiary: '#f6b99e'
  on-tertiary: '#4c2614'
  tertiary-container: '#764934'
  on-tertiary-container: '#f9bba0'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#b9ece9'
  primary-fixed-dim: '#9dd0cd'
  on-primary-fixed: '#00201f'
  on-primary-fixed-variant: '#1a4e4c'
  secondary-fixed: '#c4e7ff'
  secondary-fixed-dim: '#7bd0ff'
  on-secondary-fixed: '#001e2c'
  on-secondary-fixed-variant: '#004c69'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#f6b99e'
  on-tertiary-fixed: '#321203'
  on-tertiary-fixed-variant: '#663c28'
  background: '#031427'
  on-background: '#d3e4fe'
  surface-variant: '#26364a'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-technical:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  container-max: 1280px
---

## Brand & Style

The design system is engineered for environmental monitoring and urban planning, specifically tailored for the Indian context. It balances technical precision with public accessibility. The brand personality is authoritative yet transparent, evoking a sense of clarity and environmental stewardship.

The design style is **Corporate Modern with a Minimalist influence**. It prioritizes high legibility and data density without overwhelming the user. By utilizing a "Systematic Clarity" approach, the UI remains functional for government officials while being approachable for the general public. The interface relies on clean lines, purposeful whitespace, and a disciplined use of color to highlight critical environmental metrics.

## Colors

The palette is anchored by **Atmospheric Green** (`#2A5C5A`), a sophisticated, deep teal-green that reflects both environmental health and professional stability. 

### Core Palette
- **Primary (Atmospheric Green):** Used for primary actions, active navigation states, and brand-level iconography.
- **Secondary (Vista Blue):** A bright, airy blue (`#38BDF8`) used for technical highlights, data visualizations, and secondary interactions.
- **Neutral:** A slate-based scale that ensures readability across both light and dark modes.

### CPCB AQI Standard Colors
The system integrates specific semantic tokens for India’s Central Pollution Control Board (CPCB) standards:
- **Good (0-50):** Green (`#22C55E`)
- **Satisfactory (51-100):** Light Green (`#84CC16`)
- **Moderate (101-200):** Yellow (`#EAB308`)
- **Poor (201-300):** Orange (`#F97316`)
- **Very Poor (301-400):** Red (`#EF4444`)
- **Severe (401-500):** Deep Maroon (`#7F1D1D`)

This design system supports a "Dark First" approach for operational centers, with a high-contrast "Light Mode" for public-facing web portals.

## Typography

This design system employs a dual-font strategy to differentiate between context and intent:

- **Geist:** Used for "Display" and "Headline" levels. Its modern, wide apertures provide a contemporary feel for public-facing dashboards and marketing touchpoints.
- **Inter:** Used for "Body," "Label," and "Data" levels. It provides exceptional legibility for high-density technical reports, map annotations, and operational data tables.

For mobile devices, display sizes are aggressively scaled down to ensure that environmental metrics (like AQI numbers) remain prominent without requiring excessive scrolling.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a base 4px spacing unit. 

- **Desktop:** A 12-column grid with 24px gutters. This allows for complex dashboard configurations where maps can occupy 8 columns and data sidebars occupy 4.
- **Tablet:** An 8-column grid with 16px gutters.
- **Mobile:** A 4-column grid with 16px margins.

Spacing should be used to group related data points. AQI metric cards use "Compact Spacing" (8px between elements) to emphasize their relationship, while section headers use "Sectional Spacing" (48px) to provide clear visual breaks in long reports.

## Elevation & Depth

To maintain a professional and technical aesthetic, the design system avoids heavy shadows. Instead, it utilizes **Tonal Layers and Low-Contrast Outlines**.

In **Dark Mode**, depth is achieved by lightening the surface hex of the container. A primary background might be `#0F172A`, while a card sitting on top is `#1E293B`. 1px borders with 10% opacity are used to define edges.

In **Light Mode**, very soft, ambient shadows (Blur: 12px, Opacity: 4%) are used to lift cards from the background, creating a clean, airy feel.

## Shapes

The shape language is **Soft (0.25rem base)**. This provides a professional, "tooled" look that feels more like an industrial instrument than a social app. 

- Small components (Buttons, Inputs) use `rounded`.
- Medium components (Data Cards, Modals) use `rounded-lg` (0.5rem).
- Large containers (Side Panels, Bottom Sheets) use `rounded-xl` (0.75rem).

## Components

### Buttons
- **Primary:** Filled with Atmospheric Green. Text is white/off-white.
- **Secondary:** Outlined with Vista Blue. High-precision for technical toggles.
- **Tertiary:** Ghost style for low-priority actions like "Cancel" or "Details."

### AQI Status Chips
These are a core component. They must feature a high-contrast background using the CPCB color tokens. Text should be high-contrast (dark text on light status colors, light text on dark status colors).

### Data Cards
Cards are the primary container for environmental metrics. They should feature a clear "Header" for the metric name (Inter Label-Caps) and a "Display" value (Geist Display-LG).

### Input Fields
Utilize a "technical" style: 1px solid borders, Geist Mono for numerical inputs, and 12px padding. In Dark Mode, backgrounds should be slightly darker than the surface they sit on.

### Lists & Tables
Designed for density. Row heights are minimized, and borders are only used for horizontal separation. Use Geist for numerical columns to ensure alignment and readability.