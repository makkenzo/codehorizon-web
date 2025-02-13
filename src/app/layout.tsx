import type { Metadata } from 'next';

import { createMetadata } from '@/lib/metadata';

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
        <html lang="en">
            <head>
                <meta name="apple-mobile-web-app-title" content="CodeHorizon" />
            </head>
            <body className={`antialiased`}>{children}</body>
        </html>
    );
}
