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
                <AuthProvider>{children}</AuthProvider>
            </ZustandProvider>
        </>
    );
}
