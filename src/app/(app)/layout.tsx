import GlobalVerificationBanner from '@/components/global-verification-banner';
import { AuthProvider } from '@/providers/auth-provider';
import ZustandProvider from '@/stores/zustand-provider';

export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <ZustandProvider>
                <AuthProvider>
                    {children}
                    <GlobalVerificationBanner />{' '}
                </AuthProvider>
            </ZustandProvider>
        </>
    );
}
