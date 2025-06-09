import { useSwetrix } from '@swetrix/nextjs';
import type { Metadata } from 'next';

import { createMetadata } from '@/lib/metadata';

import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
    const metadata = createMetadata({
        path: '/',
        title: 'CodeHorizon',
        description: 'CodeHorizon - современная платформа для изучения программирования.',
        imageUrl: 'opengraph-image.jpg',
    });

    return metadata;
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    useSwetrix('yb0k2wtASU3K');

    return (
        <html lang="ru" suppressHydrationWarning>
            <head>
                <meta property="og:image" content="/opengraph-image.jpg" />
                <meta property="og:image:type" content="image/jpeg" />
                <meta property="og:image:width" content="<generated>" />
                <meta property="og:image:height" content="<generated>" />
                <meta name="apple-mobile-web-app-title" content="CodeHorizon" />
            </head>
            <body className={`antialiased`}>{children}</body>
        </html>
    );
}
