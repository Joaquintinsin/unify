/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path((?!auth).*)",
        destination: `${process.env.BACKEND_URL}/api/:path*`,
      },
    ];
  },
  images: {
    domains: ["localhost", "drive.google.com"],
  },
  i18n: {
    locales: ["en", "es"],
    defaultLocale: "en",
    localeDetection: false,
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/login",
        permanent: true,
      },
    ];
  },
  env: {
    BACKEND_URL: process.env.BACKEND_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    ADMIN: process.env.ADMIN,
  },
};

module.exports = nextConfig;