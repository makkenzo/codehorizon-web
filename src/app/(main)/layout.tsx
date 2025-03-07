import Footer from '@/components/navigation/footer';
import Header from '@/components/navigation/header';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/providers/auth-provider';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <div className="relative flex h-dvh max-h-dvh w-screen max-w-[100dvw] flex-col overflow-y-auto overflow-x-hidden bg-background-contrast dark:bg-background">
                <Header />
                <div className="flex-1">{children}</div>
                <Toaster />
                <Footer />
            </div>
        </AuthProvider>
    );
}
