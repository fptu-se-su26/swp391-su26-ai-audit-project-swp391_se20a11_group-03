/** Client-side payment window helpers (mirrors backend AWAITING_PAYMENT / FORFEITED). */

export function isPaymentExpired(
  paymentStatus: string | null | undefined,
  paymentDeadline: string | null | undefined,
): boolean {
  const status = paymentStatus?.toUpperCase();
  if (status === "FORFEITED") return true;
  if (status === "PAID") return false;
  if (paymentDeadline) {
    return new Date(paymentDeadline).getTime() <= Date.now();
  }
  return false;
}

export function canPayForWonAuction(
  paymentStatus: string | null | undefined,
  paymentDeadline: string | null | undefined,
): boolean {
  const status = paymentStatus?.toUpperCase();
  if (status === "PAID" || status === "FORFEITED") return false;
  if (paymentDeadline && new Date(paymentDeadline).getTime() <= Date.now()) return false;
  return status === "AWAITING_PAYMENT" || !status;
}

export function isForfeitedPayment(
  paymentStatus: string | null | undefined,
  paymentDeadline: string | null | undefined,
): boolean {
  return isPaymentExpired(paymentStatus, paymentDeadline);
}
