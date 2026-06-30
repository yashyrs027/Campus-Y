---
name: Campus-Y Identity
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434655'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#525657'
  on-tertiary: '#ffffff'
  tertiary-container: '#6b6e70'
  on-tertiary-container: '#eff1f3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style
The design system is engineered to feel like a high-utility OS for campus life. It blends the intellectual rigor of an academic environment with the frictionless speed of modern developer tools. The aesthetic is rooted in **Corporate Modernism** with a **Minimalist** finish, prioritizing clarity, information density, and a premium "Pro" feel.

The personality is reliable yet energetic. By utilizing heavy whitespace and a restricted color palette, the UI recedes to let student-generated content and event media take center stage. Key visual flourishes include subtle glassmorphism for top-level navigation and a "container-within-container" architecture that mimics the structured organization found in productivity suites like Notion or Linear.

**Target Audience Emotional Response:**
- **Students:** Empowerment and excitement.
- **Clubs:** Professionalism and ease of management.
- **Faculty/Admin:** Trust, stability, and organizational clarity.

## Colors
The palette is anchored by a vibrant **Primary Blue (#2563EB)**, used strategically for primary actions and brand signifiers to maintain high affordance. 

- **Surface System:** We utilize a "Zinc" scale for neutrals. Backgrounds are pure white (#FFFFFF), while secondary surfaces and sidebar navigation use a soft gray (#F8FAFC).
- **Accents:** Semantic colors (Success, Warning, Error) follow standard SaaS conventions but are desaturated to maintain the professional aesthetic.
- **Interactive States:** Hover states on primary elements should darken by 10%, while ghost buttons use a 5% opacity tint of the primary blue.

## Typography
The typography system uses a tri-font pairing to distinguish between brand expression, utility, and data.

1.  **Hanken Grotesk (Headlines):** A sharp, contemporary grotesque that provides the "modern SaaS" feel. It is used for all major page headings and promotional hero sections.
2.  **Inter (Body):** The workhorse for the platform. Chosen for its exceptional legibility in data-heavy views and student schedules.
3.  **JetBrains Mono (Labels):** Used sparingly for metadata, tags, and small utility labels to evoke the "technical/smart" nature of the platform.

Maintain a tight vertical rhythm. Large headlines should always use negative letter spacing to feel "locked in."

## Layout & Spacing
The design system employs a **12-column fluid grid** for main content areas, with a max-width of 1280px to prevent line lengths from becoming unreadable on ultra-wide monitors.

- **The 4px Rule:** All spacing (padding, margins, gaps) must be multiples of 4px. Use `16px` (4 units) for standard component padding and `24px` (6 units) for section gaps.
- **Sidebar Architecture:** For administrative and club dashboards, use a fixed 240px left-hand navigation with a fluid content area.
- **Mobile Reflow:** On mobile devices, the 12-column grid collapses to a single column with 16px side margins. Cards become full-width with a slight 8px inset if used within a grouped list.

## Elevation & Depth
Depth is created through a mix of **Tonal Layering** and **Ambient Shadows**.

- **Level 0 (Base):** #F8FAFC (Secondary background) or #FFFFFF (Primary background).
- **Level 1 (Cards):** White background with a 1px border in #E2E8F0 and a very soft, diffused shadow: `0 4px 6px -1px rgb(0 0 0 / 0.05)`.
- **Level 2 (Dropdowns/Modals):** High-contrast white background with a more pronounced shadow: `0 10px 15px -3px rgb(0 0 0 / 0.1)`.
- **Glassmorphism:** Reserved exclusively for the Global Header and Hero sections. Apply a `backdrop-blur: 12px` and a `background: rgba(255, 255, 255, 0.8)`. This creates a sense of spatial awareness as content scrolls beneath the navigation.

## Shapes
The shape language is consistently **Rounded (8px / 0.5rem)**. This provides a friendly, modern approachable feel without appearing overly "bubbly" or juvenile.

- **Standard Elements (Buttons, Inputs):** 8px (0.5rem).
- **Large Containers (Event Cards, Modals):** 16px (1rem).
- **Badges/Tags:** Use a full pill-shape (999px) to distinguish them from interactive buttons.
- **Interactive States:** Focus rings should follow the border radius of the element with a 2px offset.

## Components
- **Buttons:** Primary buttons use the brand blue with white text. High-emphasis actions use a subtle inner-glow (1px white top-border at 20% opacity) to create a premium tactile feel.
- **Event Cards:** Should feature a fixed-aspect-ratio image at the top (16:9), followed by a 16px padded content area. Use the `title-sm` for event names and `label-caps` for the category tag.
- **Input Fields:** Use a 1px border (#E2E8F0). On focus, the border transitions to Primary Blue with a 3px soft blue outer glow.
- **Chips/Tags:** For event categories (e.g., "Workshop", "Social"), use low-contrast backgrounds (e.g., light blue background with dark blue text) to keep the UI from feeling cluttered.
- **Status Indicators:** Use small, high-chroma dots (Green for "Active", Yellow for "Draft", Red for "Full") next to list items for quick scanning.
- **Lists:** Use "Divided Lists" for dashboard views, where each row is separated by a 1px #F1F5F9 border, avoiding alternating row colors to maintain a clean aesthetic.