const requiredServer = ['SAEG_WC_BASE_URL', 'SAEG_WC_CONSUMER_KEY', 'SAEG_WC_CONSUMER_SECRET'] as const;

type RequiredServerKey = (typeof requiredServer)[number];

function getEnv(name: string, fallback = ''): string {
  return process.env[name] ?? fallback;
}

function getWpPublicUrl(): string {
  return process.env.NEXT_PUBLIC_WP_URL ?? process.env.NEXT_PUBLIC_WP_PUBLIC_URL ?? 'http://localhost:8080';
}

export const env = {
  siteUrl: getEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000'),
  wpPublicUrl: getWpPublicUrl(),
  gaMeasurementId: getEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', ''),
  defaultCurrency: getEnv('SAEG_DEFAULT_CURRENCY', 'XAF'),
  whatsappShareNumber: getEnv('SAEG_WHATSAPP_SHARE_NUMBER', '24177638864'),
  orderStatusOnCreate: getEnv('SAEG_ORDER_STATUS_ON_CREATE', 'pending'),
  wcBaseUrl: getEnv('SAEG_WC_BASE_URL', ''),
  wcKey: getEnv('SAEG_WC_CONSUMER_KEY', ''),
  wcSecret: getEnv('SAEG_WC_CONSUMER_SECRET', ''),
};

export function hasWooEnv(): boolean {
  return requiredServer.every((k: RequiredServerKey) => Boolean(process.env[k]));
}
