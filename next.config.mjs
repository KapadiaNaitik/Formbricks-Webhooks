/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://app.formbricks.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;
