export const TIP_TIERS = [
  { id: 'tip.small',  emoji: '☕', label: 'Small treat',  desc: 'Buy Gemi a coffee'   },
  { id: 'tip.medium', emoji: '🧇', label: 'Warm thanks',  desc: 'Buy Gemi breakfast'  },
  { id: 'tip.large',  emoji: '🎉', label: 'Big love',     desc: 'Celebrate with Gemi' },
] as const;

// Product IDs derived from TIP_TIERS so there's a single source of truth.
export const TIP_PRODUCT_IDS = TIP_TIERS.map(t => t.id) as [
  'tip.small',
  'tip.medium',
  'tip.large',
];
