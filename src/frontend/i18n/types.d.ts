/* eslint-disable @typescript-eslint/no-empty-object-type */
/**
 * TypeScript types cho next-intl translations.
 * Auto-complete và type checking cho translation keys.
 */

type Messages = typeof import("../messages/vi.json");

declare global {
  // Use type safe message keys with `next-intl`
  interface IntlMessages extends Messages {}
}

export {};
