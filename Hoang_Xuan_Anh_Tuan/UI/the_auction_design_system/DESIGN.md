---
name: The Auction Design System
colors:
  surface: '#fbf9fb'
  surface-dim: '#dbd9db'
  surface-bright: '#fbf9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f5'
  surface-container: '#efedef'
  surface-container-high: '#eae7ea'
  surface-container-highest: '#e4e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#44474d'
  inverse-surface: '#303032'
  inverse-on-surface: '#f2f0f2'
  outline: '#75777e'
  outline-variant: '#c5c6cd'
  surface-tint: '#515f78'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#0d1c32'
  on-primary-container: '#76849f'
  inverse-primary: '#b9c7e4'
  secondary: '#775a19'
  on-secondary: '#ffffff'
  secondary-container: '#fed488'
  on-secondary-container: '#785a1a'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#002116'
  on-tertiary-container: '#479175'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#b9c7e4'
  on-primary-fixed: '#0d1c32'
  on-primary-fixed-variant: '#39475f'
  secondary-fixed: '#ffdea5'
  secondary-fixed-dim: '#e9c176'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4201'
  tertiary-fixed: '#a6f2d1'
  tertiary-fixed-dim: '#8bd6b6'
  on-tertiary-fixed: '#002116'
  on-tertiary-fixed-variant: '#00513b'
  background: '#fbf9fb'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e4'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Montserrat
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
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style
This design system is engineered for a high-stakes, premium auction environment where trust and real-time precision are paramount. The brand personality is authoritative yet innovative, blending the heritage of elite auction houses with the velocity of modern fintech.

The visual style is **Corporate Modern with Glassmorphism accents**. It utilizes expansive whitespace and a rigid structural grid to convey stability, while employing frosted glass overlays for real-time bidding components to create a sense of depth and technological sophistication. The emotional goal is to make users feel like they are in a secure, exclusive digital ballroom.

## Colors
The palette is anchored by **Deep Navy Blue**, serving as the foundation for headers and primary navigation to establish institutional trust. **Elegant Gold** is reserved for high-value actions, such as "Place Bid" or "Premium Lot" indicators, signaling luxury and exclusivity. 

**Emerald Green** is used strategically for positive financial confirmations and active auction statuses, while **Vibrant Red** is strictly limited to urgent countdowns (under 60 seconds) and outbid warnings. Backgrounds utilize cool grays and pure whites to ensure the focus remains entirely on the high-fidelity product imagery of the auction lots.

## Typography
The typography strategy pairs the geometric confidence of **Montserrat** for headlines with the functional clarity of **Inter** for data-heavy interfaces. 

Headlines use a tighter letter-spacing and bold weights to command attention during live events. Body text prioritizes legibility with generous line heights, essential for reading legal terms and item descriptions. Label styles, particularly for bid increments and timers, utilize semi-bold weights to ensure data is digestible at a glance. On mobile devices, display sizes scale down aggressively to keep critical auction controls "above the fold."

## Layout & Spacing
This design system follows a **12-column fluid grid** for desktop and a **4-column grid** for mobile. The layout philosophy is "Product First," where the auction lot imagery takes precedence, followed by the real-time data panel.

Spacing is based on an 8px modular scale. We use wider margins (64px+) on desktop to create a "gallery" feel, preventing the interface from feeling cluttered or overwhelming. In the real-time bidding dashboard, padding is tightened to `md` (24px) to maximize the information density of the bid history and live stream.

## Elevation & Depth
Visual hierarchy is established through **Tonal Layers** and **Glassmorphism**.

1.  **Base Layer:** The light-gray background (#F8FAFC) serves as the canvas.
2.  **Surface Layer:** Cards and main content areas use pure white with a very soft, diffused shadow (15% opacity Navy tint, 20px blur) to appear slightly lifted.
3.  **Overlay Layer:** Live bidding panels and countdown alerts use a frosted glass effect (Backdrop Blur: 12px, White Opacity: 70%). This allows the user to maintain context of the item while interacting with high-priority UI.
4.  **Action Layer:** Primary buttons and active bid indicators have a "Glow" effect using the Accent Gold to signify they are the most important interactive elements on the screen.

## Shapes
The shape language uses **Rounded** corners (0.5rem/8px base) to soften the professional aesthetic, making the high-tech platform feel more approachable. 

- Large containers like auction cards use `rounded-lg` (1rem).
- Input fields and standard buttons use the base `rounded` (0.5rem).
- Status badges (e.g., "Live", "Sold") use a pill-shape to distinguish them from interactive buttons.
- Images of auction lots should always carry the `rounded-lg` treatment to maintain consistency with the container.

## Components
### Buttons
- **Primary:** Navy Blue background with White text for standard actions.
- **Premium (Place Bid):** Gold background with Navy text. This button uses a subtle pulse animation during the final 10 seconds of an auction.
- **Secondary:** Transparent with a 1px Navy border.

### Input Fields
Inputs are clean with a 1px cool gray border. On focus, the border transitions to Navy with a subtle Gold outer glow. Error states use the Vibrant Red for both the border and the helper text.

### Cards
Auction lot cards feature a full-bleed image at the top, followed by a padded section for the title (Montserrat) and the current bid (Inter, Bold). Shadows are applied only to the card container, not internal elements.

### Bidding Bar
A persistent footer component on mobile. It uses a Glassmorphism effect with a blur of 16px. It contains the current high bid on the left and the "Place Bid" gold button on the right.

### Chips & Badges
"Live" badges use the Emerald Green with a small radiating dot icon. "Ended" badges use a neutral medium gray. All badges use the `label-sm` typography style for maximum clarity in small spaces.