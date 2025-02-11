import { createMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

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
            <body className={`antialiased`}>{children}</body>
        </html>
    );
}
