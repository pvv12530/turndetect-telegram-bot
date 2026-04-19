/* eslint-disable style/semi */
/** Credits consumed per Turnitin document upload. */
export const TURNITIN_CREDITS_PER_DOCUMENT = 1;

/** List price for one credit in HKD (custom pack totals use credits × this). */
export const CREDIT_HKD_PER_CREDIT = 36;

/** Bundled packs (fixed HKD totals after discount). */
export const CREDIT_PACK_10_CREDITS = 10;
export const CREDIT_PACK_10_HKD = 270;

export const CREDIT_PACK_100_CREDITS = 100;
export const CREDIT_PACK_100_HKD = 2550;

/** Shown in the custom-credit prompt as an example (must match `calculateCreditPrice`). */
export const CREDIT_PURCHASE_EXAMPLE_CREDITS = 50;

export function calculateCreditPrice(credits: number): number {
  if (credits === CREDIT_PACK_10_CREDITS) {
    return CREDIT_PACK_10_HKD;
  }
  if (credits === CREDIT_PACK_100_CREDITS) {
    return CREDIT_PACK_100_HKD;
  }
  return credits * CREDIT_HKD_PER_CREDIT;
}

/** Variables shared by welcome, help, profile, and credit purchase Fluent strings. */
export function pricingI18nPlaceholders(): Record<string, string> {
  return {
    pricePerCredit: String(CREDIT_HKD_PER_CREDIT),
    creditPack10Hkd: String(CREDIT_PACK_10_HKD),
    creditPack100Hkd: String(CREDIT_PACK_100_HKD),
    creditExampleCredits: String(CREDIT_PURCHASE_EXAMPLE_CREDITS),
    creditExampleHkd: String(
      calculateCreditPrice(CREDIT_PURCHASE_EXAMPLE_CREDITS),
    ),
  };
}
