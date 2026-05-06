---
name: Modern Finance Persona
colors:
  surface: '#f3fcf1'
  surface-dim: '#d4dcd2'
  surface-bright: '#f3fcf1'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef6eb'
  surface-container: '#e8f0e5'
  surface-container-high: '#e2ebe0'
  surface-container-highest: '#dce5da'
  on-surface: '#161d17'
  on-surface-variant: '#3d4a3e'
  inverse-surface: '#2b322b'
  inverse-on-surface: '#ebf3e8'
  outline: '#6c7b6d'
  outline-variant: '#bbcbbb'
  surface-tint: '#006d37'
  primary: '#006d37'
  on-primary: '#ffffff'
  primary-container: '#2ecc71'
  on-primary-container: '#005027'
  inverse-primary: '#4ae183'
  secondary: '#006397'
  on-secondary: '#ffffff'
  secondary-container: '#5cb8fd'
  on-secondary-container: '#00476e'
  tertiary: '#98472a'
  on-tertiary: '#ffffff'
  tertiary-container: '#ff9875'
  on-tertiary-container: '#772e14'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6bfe9c'
  primary-fixed-dim: '#4ae183'
  on-primary-fixed: '#00210c'
  on-primary-fixed-variant: '#005228'
  secondary-fixed: '#cce5ff'
  secondary-fixed-dim: '#92ccff'
  on-secondary-fixed: '#001d31'
  on-secondary-fixed-variant: '#004b73'
  tertiary-fixed: '#ffdbd0'
  tertiary-fixed-dim: '#ffb59d'
  on-tertiary-fixed: '#390c00'
  on-tertiary-fixed-variant: '#793015'
  background: '#f3fcf1'
  on-background: '#161d17'
  surface-variant: '#dce5da'
typography:
  display:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  h1:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  h2:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
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
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  container-padding: 20px
---

## Brand & Style

This design system is built on the principles of **Minimalism** and **Modern Corporate** aesthetics. The goal is to transform the often-stressful task of money management into a calm, encouraging experience. By utilizing high whitespace and a "Growth Green" primary palette, the interface suggests prosperity and clarity.

The brand personality is **Trustworthy**, **Encouraging**, and **Clarity-focused**. It avoids the cluttered density of traditional banking apps in favor of a breathable layout that guides the user’s eye to their financial health. The target audience is the modern Vietnamese professional who values efficiency and a premium digital feel. Visual elements prioritize soft transitions and a sense of "airiness" to reduce cognitive load.

## Colors

The palette is anchored by **Growth Green (#2ECC71)**, used for primary actions, success states, and positive growth indicators. **Soft Blue (#3498DB)** is reserved specifically for income-related data, providing a cool contrast to the primary green. **Warm Orange (#E67E22)** acts as a functional warning color for overspending or low balances, designed to be noticeable without being alarming.

The neutral scale utilizes a range of "Slate Grays" rather than pure blacks. Backgrounds use a very light off-white to reduce glare, while surfaces remain pure white to create a distinct layered effect. This subtle contrast is essential for maintaining the minimal look while ensuring structural clarity.

## Typography

The typography system uses **Manrope** for headlines to provide a modern, slightly geometric personality that feels premium and balanced. For body text and functional labels, **Inter** is utilized for its exceptional legibility and neutral, systematic tone, which is critical for displaying financial figures and Vietnamese diacritics clearly.

Information hierarchy is established through weight and color rather than just size. Primary balances are set in `display` or `h1` using the `Manrope` font with tight letter spacing. Descriptive text and transaction details use `Inter` at `body-md` or `body-sm`. All Vietnamese text should ensure proper line-height (1.5x for body) to accommodate tone marks without overlapping.

## Layout & Spacing

The layout follows a **Fluid Grid** model optimized for mobile viewports. A standard 4-column grid is used for internal card structures, while the main container padding is set to a generous 20px to emphasize the high-whitespace aesthetic.

Spacing follows an 8pt rhythm. Use `lg` (24px) for spacing between major sections (e.g., between the Header and the Spending Chart). Use `md` (16px) for internal card padding. This extra "breathing room" ensures that numerical data doesn't feel cramped, allowing the user to focus on one metric at a time.

## Elevation & Depth

This design system uses **Ambient Shadows** and **Tonal Layers** to create a sense of depth. Instead of harsh borders, surfaces are defined by their elevation above the background.

Shadows are extremely soft, using the primary text color at very low opacity (3-5%) with a large blur radius (20px+) and a slight vertical offset (4px-8px). This creates a "loating" effect for cards. Secondary containers, such as search bars or transaction line items, use a subtle light-gray stroke (1px) or a slightly different tonal background rather than a shadow to maintain a clean, flat hierarchy within a parent card.

## Shapes

The shape language is defined by a **Large Radius** (Value 2). Standard UI components like buttons and input fields use a 12px-16px radius (0.75rem - 1rem). 

Main dashboard cards use `rounded-xl` (1.5rem / 24px) to create a friendly, "squircle" feel that aligns with modern mobile OS patterns. This extreme roundness softens the financial nature of the app, making it feel more like a lifestyle tool than a rigid accounting spreadsheet.

## Components

- **Buttons:** Primary buttons are filled with Growth Green, using white text (Semi-bold). Height is 56px for main CTAs to ensure ease of tapping. Secondary buttons use a light green tint (10% opacity) with green text.
- **Cards:** The primary container for information. Always white with `rounded-xl` corners and a soft ambient shadow. Vietnamese labels within cards should use `label-sm` in a muted gray.
- **Input Fields:** Large, rounded text fields with a light gray background (#F1F5F9). On focus, the border transitions to Growth Green. Use clear Vietnamese placeholders like "Nhập số tiền" (Enter amount).
- **Chips/Badges:** Used for categories (e.g., Ăn uống, Di chuyển). These are pill-shaped with high-contrast text and low-contrast backgrounds.
- **Transaction Lists:** Clean rows with 16px vertical padding. Use icons with soft-colored circular backgrounds to the left of the description.
- **Progress Bars:** Use a thick 8px height with fully rounded caps. The track should be a very light gray, while the progress fill uses the primary green.
- **Bottom Navigation:** A clean, white frosted-glass effect (Backdrop Blur) with active states highlighted in Growth Green. Icons should be a consistent line style (2px stroke).