# Design System Specification: The Predictive Interface

## 1. Overview & Creative North Star
**Creative North Star: "The Living Obsidian"**

This design system is not a static set of rules; it is a responsive organism. Moving away from the "template" look of modern SaaS, this system embraces **Organic Intelligence**. We prioritize a "Deep Dark" aesthetic where information doesn't just sit on a screen—it emerges from the shadows. 

By leveraging intentional asymmetry, fluid typography, and overlapping glass surfaces, we create a high-end editorial experience. The interface should feel like a premium concierge: quiet when not needed, but vibrantly alive when performing its intelligent food-intelligence functions. We replace rigid grids with "Atmospheric Layouts," where breathing room (negative space) is as important as the data itself.

---

## 2. Colors & Surface Philosophy
The palette is rooted in an obsidian base, punctuated by high-energy electrical discharges.

### The Palette (Material Design 3 Logic)
*   **Background:** `#0e0e0f` (The Void)
*   **Primary (Electric Indigo):** `#a3a6ff` | **Container:** `#9396ff`
*   **Secondary (Soft Violet):** `#ac8aff` | **Container:** `#5516be`
*   **Tertiary (Vibrant Pink/Status):** `#ff6daf` | **Container:** `#fa53a4`
*   **Error (High Contrast):** `#ff6e84`

### The "No-Line" Rule
**Borders are strictly prohibited for structural sectioning.** We do not use 1px solid lines to separate content. Instead:
1.  **Tonal Shifts:** Use `surface-container-low` against `surface` to define regions.
2.  **Negative Space:** Use the Spacing Scale (specifically `8`, `12`, and `16`) to create "invisible" boundaries.
3.  **The Ghost Border:** If a boundary is vital for accessibility, use the `outline-variant` token at **15% opacity**. It must feel like a suggestion, not a wall.

### Glass & Gradient Signature
To achieve a premium "Food Intelligence" feel, all floating panels (Modals, Hover Cards, Tooltips) must use **Glassmorphism**:
*   **Surface:** `surface-container-high` at 60% opacity.
*   **Blur:** 20px - 40px backdrop-filter.
*   **Accent Glow:** Apply a subtle linear gradient (Primary to Secondary) at 5% opacity to the background of glass cards to give them "soul."

---

## 3. Typography: Fluid Intelligence
We pair the technical precision of *Manrope* with the editorial authority of *Plus Jakarta Sans*.

*   **Display & Headlines (Plus Jakarta Sans):** Used for "Predictive Moments." Use `display-lg` (3.5rem) for hero stats and `headline-md` (1.75rem) for section titles. These should feel bold and intentional.
*   **Body & Labels (Manrope):** Used for data density. *Manrope’s* geometric nature ensures legibility at small scales (e.g., `body-sm` at 0.75rem for nutritional micro-copy).
*   **Hierarchy Note:** Use high contrast in scale. Jump from a `display-lg` headline directly to a `body-md` description to create a sophisticated, asymmetric editorial rhythm.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are too heavy for this system. We use "Ambient Light" and "Nesting."

*   **Layering Principle:** 
    *   Base: `surface` (#0e0e0f)
    *   Sub-section: `surface-container-low` (#131314)
    *   Interactive Card: `surface-container-highest` (#262627)
*   **Ambient Shadows:** For elements that "float" (like a predictive meal suggestion), use a shadow color tinted with `primary` (#a3a6ff) at 6% opacity, with a 40px blur and 0px offset. It should look like the component is emitting light onto the obsidian floor.
*   **The Pulse:** Interactive elements in a "Predictive" state should utilize a CSS box-shadow animation that breathes (pulsing between 4% and 12% opacity of the `primary` color).

---

## 5. Components & Interaction Patterns

### Buttons (The Kinetic Trigger)
*   **Primary:** Solid `primary` background. On-hover, it morphs slightly (increase `border-radius` from `md` to `xl`) and gains a `primary-container` outer glow.
*   **Secondary:** Ghost-style. No background. `primary` text. Use a `surface-variant` background on hover.
*   **Shape:** Default to `0.75rem` (md), but allow "Pill" shapes for action-oriented AI suggestions.

### Inputs (The Listening Field)
*   **State:** The input background should be `surface-container-lowest`. 
*   **Focus:** Upon focus, the "Ghost Border" becomes a 1px `primary` glow, and the label should utilize a `title-sm` fluid transition upward.
*   **Predictive Text:** Ghosted text in `on-surface-variant` suggesting what the user might type next.

### Cards (The Information Vessel)
*   **Rule:** No dividers. Separate the header from the body using a `surface-container-high` header block against a `surface-container` body.
*   **Motion:** Cards should subtly "lift" (scale 1.02x) on hover to indicate they are "Alive."

### Smart Chips
*   Used for food categories or diet tags. Use `secondary-container` for the background with `on-secondary-container` text. Use the `full` roundedness token.

### Additional Component: The "Intelligence Pulse"
A custom status indicator for AI-calculated data. A small 8px circle using `tertiary` with a permanent 1500ms ease-in-out scale animation (0.8x to 1.2x) to signify the system is "thinking" or "actively monitoring."

---

## 6. Do’s and Don’ts

### Do:
*   **Use Asymmetry:** Place high-level stats off-center to create a modern, editorial feel.
*   **Embrace the Dark:** Allow large areas of `#0e0e0f` to exist. It directs the eye to the vibrant glows.
*   **Layer with Glass:** Use backdrop blurs to keep the user grounded in the "Obsidian" environment even when modals are open.

### Don’t:
*   **Don't use 100% white text for everything:** Use `on-surface` (#ffffff) for headers, but `on-surface-variant` (#adaaab) for secondary text to reduce eye strain.
*   **Don't use dividers:** If you feel the need for a line, add `1.4rem` (spacing-4) of vertical whitespace instead.
*   **Don't use "Standard" Grids:** Avoid the 12-column "Bootstrap" look. Shift content blocks to overlap slightly, creating depth and a "custom-built" feel.