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
                    {children} {/* Сюда будут рендериться layout из (main) или (admin) */}
                </AuthProvider>
            </ZustandProvider>
        </>
    );
}
