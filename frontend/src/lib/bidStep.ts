/** Mirrors backend StepCalculator — fixed step from starting price for the whole auction. */

const TIER_1_THRESHOLD = 100_000_000;
const TIER_2_THRESHOLD = 1_000_000_000;

export const STEP_SMALL = 5_000_000;
export const STEP_MEDIUM = 10_000_000;
export const STEP_LARGE = 50_000_000;

export function calculateBidStep(startingPrice: number): number {
  if (startingPrice < TIER_1_THRESHOLD) return STEP_SMALL;
  if (startingPrice < TIER_2_THRESHOLD) return STEP_MEDIUM;
  return STEP_LARGE;
}

export function computeMinNextBid(
  startingPrice: number,
  currentHighestBid: number,
  step: number,
): number {
  const base = Math.max(currentHighestBid, startingPrice);
  return base + step;
}

export function isOnBidGrid(startingPrice: number, bidAmount: number, step: number): boolean {
  return (bidAmount - startingPrice) % step === 0;
}
