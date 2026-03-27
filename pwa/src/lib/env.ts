function getEnv(name: string, fallback = ''): string {
  return process.env[name] ?? fallback;
}

function getFirstEnv(names: string[], fallback = ''): string {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.trim()) {
      return value;
    }
  }
  return fallback;
}

function getWpPublicUrl(): string {
  return process.env.NEXT_PUBLIC_WP_URL ?? process.env.NEXT_PUBLIC_WP_PUBLIC_URL ?? 'https://admin.store.saeggabon.ga';
}

export const env = {
  siteUrl: getEnv('NEXT_PUBLIC_SITE_URL', 'https://store.saeggabon.ga'),
  wpPublicUrl: getWpPublicUrl(),
  gaMeasurementId: getEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', ''),
  defaultCurrency: getEnv('AGROPAG_DEFAULT_CURRENCY', 'XAF'),
  whatsappShareNumber: getEnv('AGROPAG_WHATSAPP_SHARE_NUMBER', '24177638864'),
  orderStatusOnCreate: getEnv('AGROPAG_ORDER_STATUS_ON_CREATE', 'pending'),
  wcBaseUrl: getFirstEnv(['AGROPAG_WC_BASE_URL', 'WP_BASE_URL', 'NEXT_PUBLIC_WP_URL', 'NEXT_PUBLIC_WP_PUBLIC_URL'], ''),
  wcKey: getFirstEnv(['AGROPAG_WC_CONSUMER_KEY', 'WC_CONSUMER_KEY'], ''),
  wcSecret: getFirstEnv(['AGROPAG_WC_CONSUMER_SECRET', 'WC_CONSUMER_SECRET'], ''),
};

export function hasWooEnv(): boolean {
  return Boolean(env.wcBaseUrl && env.wcKey && env.wcSecret);
}
