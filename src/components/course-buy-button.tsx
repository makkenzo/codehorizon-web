'use client';

import { useState } from 'react';

import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'sonner';

import { useRouter } from 'next/navigation';

import { useAuth } from '@/providers/auth-provider';
import PaymentsApiClient from '@/server/payments';
import { useUserStore } from '@/stores/user/user-store-provider';

import { Button } from './ui/button';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CourseBuyButtonProps {
    courseId: string;
    courseSlug: string;
}

const CourseBuyButton = ({ courseId, courseSlug }: CourseBuyButtonProps) => {
    const { isAuthenticated } = useAuth();
    const user = useUserStore((state) => state.user);
    const [loading, setLoading] = useState(false);

    if (!courseId) return null;

    const router = useRouter();

    const handleCheckout = async () => {
        if (!isAuthenticated) {
            router.push(`/sign-in?from=/courses/${courseSlug}`);
        }
        setLoading(true);
        try {
            const sessionId = await new PaymentsApiClient().createCheckoutSession(courseId, user!.id);
            if (!sessionId) throw new Error('Ошибка при создании сессии оплаты');

            const stripe = await stripePromise;
            await stripe?.redirectToCheckout({ sessionId });
        } catch (error) {
            console.error('Ошибка при покупке курса', error);
            toast.error('Ошибка при покупке курса');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button size="lg" onClick={handleCheckout} isLoading={loading}>
            Купить
        </Button>
    );
};

export default CourseBuyButton;
