import { apiUrl } from "./api";

export type PaymentConfig = {
  paymobCheckout: boolean;
};

/**
 * Fetches the public payment gateway readiness flag from the backend.
 * Safe to call from the browser — no secrets are exposed.
 * Falls back to `{ paymobCheckout: false }` when unreachable so UI fails closed.
 */
export async function fetchPaymentConfig(signal?: AbortSignal): Promise<PaymentConfig> {
  try {
    const res = await fetch(apiUrl("/api/payment/config"), { signal });
    if (!res.ok) return { paymobCheckout: false };
    const data = (await res.json()) as Partial<PaymentConfig>;
    return { paymobCheckout: Boolean(data?.paymobCheckout) };
  } catch {
    return { paymobCheckout: false };
  }
}
