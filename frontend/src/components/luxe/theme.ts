import { Playfair_Display } from "next/font/google";

/**
 * Shared "Luxora" luxe design system.
 *
 * Applied per-page (via the LuxePage wrapper) so it never overrides the global
 * light theme used by admin/staff/dashboard pages. This keeps the new dark UI
 * additive and conflict-free with existing pages.
 */
export const playfair = Playfair_Display({
  subsets: ["vietnamese", "latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

/** Serif display font class, use on headings. */
export const displayFont = playfair.className;

export const luxe = {
  bg: "#070706",
  bgSoft: "#0b0b0a",
  bgPanel: "#11100d",
  card: "#0e0d0b",
  gold: "#d4aa61",
  goldBright: "#efcf88",
  ink: "#f5ead9",
  muted: "#b7aea3",
  mutedDim: "#9d948a",
  line: "rgba(255,255,255,0.10)",
} as const;
