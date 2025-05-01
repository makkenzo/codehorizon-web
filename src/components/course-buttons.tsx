'use client';

import { useEffect, useState, useTransition } from 'react';

import { loadStripe } from '@stripe/stripe-js';
import { isAxiosError } from 'axios';
import { FaRegHeart } from 'react-icons/fa6';
import { toast } from 'sonner';

import { useRouter } from 'next/navigation';

import { getPercentDifference } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import CoursesApiClient from '@/server/courses';
import PaymentsApiClient from '@/server/payments';
import { useUserStore } from '@/stores/user/user-store-provider';
import { Course, Lesson } from '@/types';

import Price from './reusable/price';
import { Button } from './ui/button';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CourseButtonsProps {
    course: {
        id: string;
        slug: string;
        price: number;
        discount: number;
    };
}

const CourseButtons = ({ course }: CourseButtonsProps) => {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const user = useUserStore((state) => state.user);
    const [loading, setLoading] = useState(false);

    const [isInWishlist, setIsInWishlist] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [access, setAccess] = useState(false);

    const apiClient = new CoursesApiClient();

    useEffect(() => {
        const fetchData = async () => {
            const isInWishlist = await apiClient.isCourseInWishlist(course.id).catch((err) => {
                console.error(`Ошибка проверки вишлиста для курса ${course.id}:`, err);
                return false;
            });

            setIsInWishlist(isInWishlist);
        };
        const fetchAccess = async () => {
            const response = await apiClient.checkCourseAccess(course.id).catch((error) => {
                console.error(`Ошибка при проверке доступа к курсу ${course.id}:`, error);
            });
            setAccess(!!response);
        };

        fetchAccess();
        fetchData();
    }, []);

    const handleCheckout = async () => {
        if (!isAuthenticated) {
            router.push(`/sign-in?from=/courses/${course.slug}`);
        }
        setLoading(true);
        try {
            const sessionId = await new PaymentsApiClient().createCheckoutSession(course.id, user!.id);
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

    const handleToggleWishlist = () => {
        startTransition(async () => {
            const action = isInWishlist ? 'удаления' : 'добавления';
            const currentWishlistStatus = isInWishlist;

            try {
                if (currentWishlistStatus) {
                    await apiClient.removeFromWishlist(course.id);
                    toast.success('Курс удален из желаемого');
                    setIsInWishlist(false);
                } else {
                    await apiClient.addToWishlist(course.id);
                    toast.success('Курс добавлен в желаемое');
                    setIsInWishlist(true);
                }
            } catch (error: unknown) {
                console.error(`Ошибка ${action} курса (${course.id}) в желаемое:`, error);

                let errorMsg = `Не удалось ${action.replace('ия', 'ить')} курс ${action === 'удаления' ? 'из' : 'в'} желаемое`;

                if (isAxiosError(error)) {
                    errorMsg =
                        error?.response?.data?.message ||
                        error.message ||
                        `Не удалось ${action.replace('ия', 'ить')} курс ${action === 'удаления' ? 'из' : 'в'} желаемое`;
                } else if (error instanceof Error) {
                    errorMsg = error.message;
                }

                toast.error(errorMsg);
            }
        });
    };

    if (access) return null;

    return (
        <>
            <>
                <Price
                    discount={course.discount}
                    price={course.price}
                    priceClassName="text-2xl"
                    discountPriceClassName="text-xl ml-4"
                />
                {course.discount ? (
                    <div className="bg-warning text-white font-bold w-fit p-1 rounded-[2px]">
                        СКИДКА {getPercentDifference(course.price, course.price - course.discount)}
                    </div>
                ) : null}
            </>
            <div className="w-full flex flex-col gap-4 mt-8">
                <Button size="lg" onClick={handleCheckout} isLoading={loading}>
                    Купить
                </Button>
                <Button
                    variant={isInWishlist ? 'secondary' : 'outline'}
                    size="lg"
                    onClick={handleToggleWishlist}
                    isLoading={isPending}
                    aria-live="polite"
                >
                    {isPending ? (
                        <>
                            <span>Обновление...</span>
                        </>
                    ) : isInWishlist ? (
                        <>
                            <FaRegHeart className="size-5" />В желаемом
                        </>
                    ) : (
                        <>
                            <FaRegHeart className="size-5" />В желаемое
                        </>
                    )}
                </Button>
            </div>
        </>
    );
};

export default CourseButtons;
