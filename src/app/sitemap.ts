import type { MetadataRoute } from 'next';

const BASE_URL = 'https://codehorizon.makkenzo.com';

export default function sitemap(): MetadataRoute.Sitemap {
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${BASE_URL}/courses`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/forgot-password`,
            lastModified: new Date('2025-04-04'),
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/legal/privacy`,
            lastModified: new Date('2025-04-04'),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${BASE_URL}/legal/terms`,
            lastModified: new Date('2025-04-04'),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ];

    return staticPages;
}
