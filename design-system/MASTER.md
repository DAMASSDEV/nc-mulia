# NC MULIA — Design System

## Design Direction

**Personality:** Premium wellness, clinical trust, modern nutrition. Clean, professional, and warm — not sterile.

**Core brand colors:**
- Emerald green (#087F5B) as primary — communicates health, growth, vitality
- Gold (#E9B949) as accent — communicates premium, quality, trust
- Warm neutrals for backgrounds and surfaces
- Dark text for readability and hierarchy

**Design principles:**
1. **Hierarchy over decoration** — every element earns its place
2. **Whitespace is breathing room** — not empty space
3. **Typography does heavy lifting** — size, weight, and spacing create structure
4. **Cards have purpose** — vary card treatment, not everything needs a border or same shape
5. **Motion enhances, never distracts** — subtle, purposeful animations
6. **Responsive first** — mobile, tablet, desktop

---

## Color System

### Brand Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-brand-primary` | #087F5B | CTAs, active states, primary actions |
| `--color-brand-primary-hover` | #066A4B | Hover state for primary |
| `--color-brand-primary-active` | #055640 | Active/pressed state |
| `--color-brand-primary-soft` | #DDF4EA | Soft backgrounds, badges |
| `--color-brand-secondary` | #2F9E74 | Secondary highlights |
| `--color-brand-accent` | #E9B949 | Premium accents, special callouts |
| `--color-brand-accent-soft` | #FFF5D6 | Soft accent backgrounds |

### Neutrals
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-background` | #F6F8F6 | Page background |
| `--color-surface` | #FFFFFF | Cards, modals, panels |
| `--color-surface-secondary` | #EDF3EF | Subtle sections, table headers |
| `--color-foreground` | #17211C | Primary text |
| `--color-foreground-muted` | #66736C | Secondary text, descriptions |
| `--color-foreground-subtle` | #8A968F | Tertiary text, placeholders |
| `--color-border` | #D9E2DC | Borders, dividers |

### Status Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-success` | #2B8A5A | Success states |
| `--color-success-soft` | #D1EADD | Success backgrounds |
| `--color-warning` | #D99018 | Warning states |
| `--color-warning-soft` | #FFF0C0 | Warning backgrounds |
| `--color-danger` | #D64545 | Error, destructive |
| `--color-danger-soft` | #FAD7D7 | Danger backgrounds |
| `--color-information` | #3578C8 | Informational |
| `--color-information-soft` | #D6E6F7 | Info backgrounds |

### Admin Sidebar
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-sidebar-bg` | #0D3D31 | Sidebar background |
| `--color-sidebar-text` | #DCEAE4 | Sidebar primary text |
| `--color-sidebar-muted` | #7FA394 | Sidebar secondary text |
| `--color-sidebar-active` | #087F5B | Active nav item background |
| `--color-sidebar-hover` | rgba(255,255,255,0.08) | Hover background |

---

## Typography

**Font family:** `Montserrat` (Google Fonts) — clean, modern, trustworthy

**Scale:**
- Display: 3xl-6xl (hero headlines)
- Heading: 2xl-3xl (page titles, section headers)
- Subheading: lg-xl (card titles)
- Body: sm-base (descriptions, paragraphs)
- Caption: xs (labels, metadata, timestamps)
- Micro: text-[10px] (badges, tags)

**Weight:**
- Bold (700): headlines, strong emphasis
- Semibold (600): subheadlines, button labels
- Medium (500): nav items, table headers
- Regular (400): body text

---

## Spacing & Layout

**Container max-widths:**
- Content: `max-w-5xl` (admin pages)
- Wide: `max-w-7xl` (public pages)
- Narrow: `max-w-2xl` (forms, settings)

**Section spacing:**
- Page sections: `py-12` to `py-20`
- Card padding: `p-5` to `p-6`
- Component gaps: `gap-4` to `gap-6`

**Border radius:**
- Small: `rounded-lg` (inputs, small cards)
- Medium: `rounded-xl` (cards, buttons, badges)
- Large: `rounded-2xl` (sections, modals, hero elements)

---

## Components

### Cards
- **Standard:** white background, subtle border, rounded-xl, shadow-sm hover
- **Elevated:** no border, shadow-md, used for emphasis
- **Soft background:** colored background (brand-primary-soft), used for callout sections
- **Bordered accent:** thin colored border, no shadow, used for category or feature highlights

### Buttons
- **Primary:** green background, white text, rounded-xl
- **Secondary:** white background, green border, green text
- **Ghost:** transparent, text color only
- **Danger:** red variant for destructive actions
- **Sizes:** sm (tables, inline), md (default), lg (hero CTAs)

### Badges
- Rounded-full pills
- Color-coded by variant: success, danger, warning, neutral, information
- Optional dot indicator for status

### Tables
- Clean, minimal borders
- Subtle header background
- Hover highlight on rows
- Responsive with horizontal scroll on mobile

### Modals
- Centered, max-w-2xl
- Backdrop blur
- Rounded-2xl corners
- Sticky header with title
- Scrollable content area

---

## Motion

**Philosophy:** Motion should guide attention and confirm interactions — not entertain.

**Allowed animations:**
- Page enter: fade + translateY (150-300ms)
- Hero stagger: sequential reveal of elements
- Card hover: subtle elevation (shadow change)
- Modal: fade + scale from center
- Skeleton loading: gentle pulse
- Scroll reveal: subtle fade-up for sections

**Timing:**
- Micro (hover, focus): 150-200ms
- Standard (page transitions, modals): 200-400ms
- Slow (hero reveals): 400-600ms

**Easing:** `ease-out` for most, `ease-in-out` for toggles

**Reduced motion:** All animations wrapped with `prefers-reduced-motion` check

---

## Accessibility

- Color contrast ratio minimum 4.5:1 for text
- Focus states visible with 2px outline
- Semantic HTML (buttons for actions, links for navigation)
- ARIA labels on icon-only buttons
- Skip navigation for keyboard users

---

## Page-Specific Notes

See `pages/` for individual page design specifications.
