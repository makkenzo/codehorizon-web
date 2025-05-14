import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next';

import { createMetadata } from '@/lib/metadata';

import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
    const metadata = createMetadata({
        path: '/',
        title: 'CodeHorizon',
        description: 'CodeHorizon - современная платформа для изучения программирования.',
    });

    return metadata;
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ru" suppressHydrationWarning>
            <head>
                <meta property="og:image" content="/opengraph-image.jpg" />
                <meta property="og:image:type" content="image/jpeg" />
                <meta property="og:image:width" content="<generated>" />
                <meta property="og:image:height" content="<generated>" />
                <meta name="apple-mobile-web-app-title" content="CodeHorizon" />
            </head>
            <body className={`antialiased`}>
                {children} <Analytics />
            </body>
        </html>
    );
}
