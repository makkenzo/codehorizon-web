import type { MetadataRoute } from 'next';

const BASE_URL = 'https://codehorizon.makkenzo.com';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/me/', '/payment/'],
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}
