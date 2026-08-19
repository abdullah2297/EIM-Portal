/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    // Silences the Dart Sass 3.0 deprecation notices from @import chains.
    quietDeps: true,
    silenceDeprecations: ['import', 'global-builtin', 'legacy-js-api'],
  },
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
