export interface SubscriptionPlan {
  id: string;
  name: string;
  durationMonths: number;
  durationDays: number;
  priceINR: number;
  priceUSD: number;
  dataPackMB: number; // e.g. 2048 MB = 2 GB
  dataPackGB: number; // e.g. 2.0
  dailyLimitMB: number; // e.g. 800 MB daily speed limit
  badge?: string;
  popular?: boolean;
  features: string[];
  customField1?: string;
  customField2?: string;
  customField3?: string;
  customField4?: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-1m',
    name: '1 Month Starter Pack',
    durationMonths: 1,
    durationDays: 30,
    priceINR: 399,
    priceUSD: 4.99,
    dataPackMB: 2048, // 2 GB
    dataPackGB: 2.0,
    dailyLimitMB: 800,
    badge: 'Starter',
    features: [
      '2 GB Total High-Speed AI Data Pack',
      '800 MB Daily High-Speed Usage Limit',
      'Access to ALL 26 AI Models',
      'Instant Gateway Auto-Activation',
      'Reverse Proxy Gateway Access',
      'Live Token-to-MB Magic Receipts'
    ]
  },
  {
    id: 'plan-2m',
    name: '2 Months Pro Pack',
    durationMonths: 2,
    durationDays: 60,
    priceINR: 699,
    priceUSD: 8.49,
    dataPackMB: 5120, // 5 GB
    dataPackGB: 5.0,
    dailyLimitMB: 1200,
    popular: true,
    badge: 'Most Popular',
    features: [
      '5 GB Total High-Speed AI Data Pack',
      '1.2 GB Daily High-Speed Usage Limit',
      'Access to ALL 26 AI Models',
      'Instant Gateway Auto-Activation',
      'Priority Gateway Bandwidth',
      'Live Token-to-MB Magic Receipts',
      '24/7 Priority Gateway Proxy Routing'
    ]
  },
  {
    id: 'plan-3m',
    name: '3 Months Ultra Pack',
    durationMonths: 3,
    durationDays: 90,
    priceINR: 999,
    priceUSD: 11.99,
    dataPackMB: 10240, // 10 GB
    dataPackGB: 10.0,
    dailyLimitMB: 2048,
    badge: 'Best Value',
    features: [
      '10 GB Total High-Speed AI Data Pack',
      '2 GB Daily High-Speed Usage Limit',
      'Access to ALL 26 AI Models (Including o1, Opus & Brahmastra)',
      'Instant Gateway Auto-Activation',
      'Unlimited Key Regeneration',
      'Live Token-to-MB Magic Receipts',
      'Dedicated Gateway Channel'
    ]
  }
];

export interface TopUpPack {
  id: string;
  name: string;
  priceINR: number;
  dataMB: number;
  description: string;
}

export const TOP_UP_PACKS: TopUpPack[] = [
  {
    id: 'topup-500mb',
    name: 'Micro Recharge Top-Up',
    priceINR: 99,
    dataMB: 500,
    description: 'Instantly add 500 MB data pack to your active subscription without changing validity.'
  },
  {
    id: 'topup-1gb',
    name: 'Standard Boost Pack',
    priceINR: 179,
    dataMB: 1024,
    description: 'Instantly add 1 GB (1,024 MB) data pack for high-volume developer coding sessions.'
  },
  {
    id: 'topup-2gb',
    name: 'Power Booster Pack',
    priceINR: 299,
    dataMB: 2048,
    description: 'Instantly add 2 GB (2,048 MB) turbo data pack for extended model execution.'
  },
  {
    id: 'topup-5gb',
    name: 'Ultra Data Vault',
    priceINR: 599,
    dataMB: 5120,
    description: 'Instantly add 5 GB (5,120 MB) massive data reservoir for production workloads.'
  },
  {
    id: 'topup-10gb',
    name: 'Mega Cloud Pack',
    priceINR: 999,
    dataMB: 10240,
    description: 'Instantly add 10 GB (10,240 MB) enterprise-grade AI tokens data allocation.'
  }
];
