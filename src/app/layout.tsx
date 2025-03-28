import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next';

import { createMetadata } from '@/lib/metadata';
import ZustandProvider from '@/stores/zustand-provider';

import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
    const metadata = createMetadata('/');

    return {
        title: metadata.title,
        description: metadata.description,
        keywords: metadata.keywords,
        openGraph: {
            title: metadata.title,
            description: metadata.description,
            type: 'website',
        },
    };
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ru">
            <head>
                <meta property="og:image" content="/opengraph-image.png" />
                <meta property="og:image:type" content="image/png" />
                <meta property="og:image:width" content="<generated>" />
                <meta property="og:image:height" content="<generated>" />
                <meta name="apple-mobile-web-app-title" content="CodeHorizon" />
            </head>
            <body className={`antialiased`}>
                <ZustandProvider>{children}</ZustandProvider> <Analytics />
            </body>
        </html>
    );
}
