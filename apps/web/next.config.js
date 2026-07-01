const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ESLint runs in CI as a separate step — don't block production builds
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = withNextIntl(nextConfig);
