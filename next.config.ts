import type { NextConfig } from 'next';
import { withNextVideo } from 'next-video/process';

const nextConfig: NextConfig = {
    output: 'standalone',
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'codehorizon-bucket.makkenzo.com',
            },
        ],
    },
};

export default withNextVideo(nextConfig);
