import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: 'standalone',
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'codehorizon-bucket.makkenzo.com',
            },
            {
                protocol: 'http',
                hostname: 'marchenzo',
            },
        ],
    },
};

export default nextConfig;
