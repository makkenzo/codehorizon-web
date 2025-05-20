'use client';

import { useState } from 'react';

import { Info } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/providers/auth-provider';
import { useUserStore } from '@/stores/user/user-store-provider';

import { Button } from './ui/button';

const GlobalVerificationBanner = () => {
    const { isAuthenticated, isPending: isAuthPending } = useAuth();
    const { user, resendVerificationEmail } = useUserStore((state) => ({
        user: state.user,
        resendVerificationEmail: state.resendVerificationEmail,
    }));

    const [isResending, setIsResending] = useState(false);
    const [showBanner, setShowBanner] = useState(true);

    const handleResend = async () => {
        setIsResending(true);
        const result = await resendVerificationEmail();
        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
        setIsResending(false);
    };

    if (isAuthPending || !isAuthenticated || !user || user.isVerified || !showBanner) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-yellow-100 border-t-2 border-yellow-300 text-yellow-800 p-4 shadow-lg dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-200">
            <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between">
                <div className="flex items-center mb-2 sm:mb-0">
                    <Info className="h-6 w-6 mr-3 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
                    <p className="text-sm">
                        Ваш email еще не подтвержден. Пожалуйста, проверьте свою почту или{' '}
                        <button
                            onClick={handleResend}
                            disabled={isResending}
                            className="font-semibold underline hover:text-yellow-700 dark:hover:text-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isResending ? 'Отправка...' : 'отправьте письмо повторно'}
                        </button>
                        .
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBanner(false)}
                    className="text-yellow-700 hover:bg-yellow-200/50 dark:text-yellow-300 dark:hover:bg-yellow-800/50"
                    aria-label="Закрыть уведомление о верификации"
                >
                    Закрыть
                </Button>
            </div>
        </div>
    );
};

export default GlobalVerificationBanner;
