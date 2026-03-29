function toRemotePattern(urlLike) {
  if (!urlLike) return null;
  try {
    const parsed = new URL(urlLike);
    const pattern = {
      protocol: parsed.protocol.replace(':', ''),
      hostname: parsed.hostname,
    };
    if (parsed.port) {
      pattern.port = parsed.port;
    }
    return pattern;
  } catch {
    return null;
  }
}

const dynamicSources = [
  process.env.NEXT_PUBLIC_WP_URL,
  process.env.NEXT_PUBLIC_WP_PUBLIC_URL,
  process.env.AGROPAG_WC_BASE_URL,
];

const dynamicPatterns = dynamicSources
  .map((source) => toRemotePattern(source))
  .filter(Boolean)
  .filter((pattern) => pattern.protocol === 'https');

const remotePatterns = [
  { protocol: 'https', hostname: 'admin.agropag.ga' },
  { protocol: 'https', hostname: 'www.admin.agropag.ga' },
  { protocol: 'https', hostname: 'boutique.agropag.ga' },
  { protocol: 'https', hostname: 'www.boutique.agropag.ga' },
  { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
  ...dynamicPatterns,
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true
  },
  images: {
    remotePatterns,
  }
};

export default nextConfig;
