// These product IDs must be created as Consumable IAP products in:
//   App Store Connect → your app → In-App Purchases
//   Google Play Console → your app → Monetize → Products → In-app products
// The strings here must exactly match the product IDs in both consoles.
export const TIP_PRODUCT_IDS = [
  'tip.small',   // $0.99
  'tip.medium',  // $2.99
  'tip.large',   // $4.99
] as const;
