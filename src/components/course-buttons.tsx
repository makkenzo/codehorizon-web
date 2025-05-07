'use client';

import { useEffect, useState, useTransition } from 'react';

import { loadStripe } from '@stripe/stripe-js';
import { isAxiosError } from 'axios';
import { BookOpen } from 'lucide-react';
import { FaRegHeart } from 'react-icons/fa6';
import { toast } from 'sonner';

import { useRouter } from 'next/navigation';

import { cn, getPercentDifference } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import CoursesApiClient from '@/server/courses';
import PaymentsApiClient from '@/server/payments';
import { useUserStore } from '@/stores/user/user-store-provider';
import { Course, Lesson, UserCourseDTO, UserSpecificCourseProgressDetails } from '@/types';

import Price from './reusable/price';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CourseButtonsProps {
    course: {
        id: string;
        slug: string;
        price: number;
        discount: number;
        lessons: Pick<Lesson, 'title' | 'slug' | 'id' | 'videoLength'>[];
    };

    currentCourseProgressDetails?: UserSpecificCourseProgressDetails | null;
    className?: string;
}

const CourseButtons = ({
    course,

    currentCourseProgressDetails,
    className,
}: CourseButtonsProps) => {
    const { isAuthenticated, isPending: isAuthPending } = useAuth();
    const router = useRouter();
    const user = useUserStore((state) => state.user);
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
    const [access, setAccess] = useState<boolean | null>(null);

    const [isInWishlist, setIsInWishlist] = useState(false);
    const [isWishlistPending, startWishlistTransition] = useTransition();

    const apiClient = new CoursesApiClient();

    useEffect(() => {
        const fetchWishlistStatus = async () => {
            if (!isAuthenticated || !user) {
                setIsInWishlist(false);
                return;
            }

            try {
                const status = await apiClient.isCourseInWishlist(course.id);
                setIsInWishlist(status);
            } catch (err) {
                console.error(`Ошибка проверки вишлиста для курса ${course.id}:`, err);
                setIsInWishlist(false);
            }
        };

        const fetchAccess = async () => {
            const response = await apiClient.checkCourseAccess(course.id).catch((error) => {
                console.error(`Ошибка при проверке доступа к курсу ${course.id}:`, error);
            });
            setAccess(!!response);
        };

        fetchAccess();
        fetchWishlistStatus();
    }, [isAuthenticated, user, course.id, apiClient]);

    const handleCheckout = async () => {
        if (!isAuthenticated || !user) {
            router.push(`/sign-in?from=/courses/${course.slug}`);
            return;
        }

        setIsCheckoutLoading(true);

        try {
            const sessionId = await new PaymentsApiClient().createCheckoutSession(course.id, user!.id);
            if (!sessionId) throw new Error('Ошибка при создании сессии оплаты');

            const stripe = await stripePromise;
            const result = await stripe?.redirectToCheckout({ sessionId });

            if (result?.error) {
                toast.error(result.error.message || 'Ошибка при перенаправлении на Stripe');
            }
        } catch (error) {
            console.error('Ошибка при покупке курса', error);
            toast.error('Ошибка при покупке курса');
        } finally {
            setIsCheckoutLoading(false);
        }
    };

    const handleToggleWishlist = () => {
        if (!isAuthenticated || !user) {
            router.push(`/sign-in?from=/courses/${course.slug}`);
            return;
        }

        startWishlistTransition(async () => {
            const action = isInWishlist ? 'удаления' : 'добавления';

            try {
                if (isInWishlist) {
                    await apiClient.removeFromWishlist(course.id);
                    toast.success('Курс удален из желаемого');
                } else {
                    await apiClient.addToWishlist(course.id);
                    toast.success('Курс добавлен в желаемое');
                }
                setIsInWishlist(!isInWishlist);
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

    const handleGoToLearning = () => {
        const completedLessonIds = currentCourseProgressDetails?.completedLessons ?? [];
        let targetLessonSlug = course.lessons?.[0]?.slug;

        if (course.lessons && course.lessons.length > 0) {
            if (completedLessonIds.length < course.lessons.length) {
                const firstUncompleted = course.lessons.find((l) => !completedLessonIds.includes(l.id));
                if (firstUncompleted) {
                    targetLessonSlug = firstUncompleted.slug;
                }
            } else if (completedLessonIds.length === course.lessons.length && course.lessons.length > 0) {
                targetLessonSlug = course.lessons[course.lessons.length - 1].slug;
            }
        }

        if (targetLessonSlug) {
            router.push(`/courses/${course.slug}/learn/${targetLessonSlug}`);
        } else {
            toast.error('В этом курсе пока нет уроков или не удалось определить следующий урок.');
        }
    };

    if (isAuthPending) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-28 mb-2" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        );
    }

    if (access) {
        const progressPercentage = currentCourseProgressDetails?.progress ?? 0;
        const buttonText =
            progressPercentage > 0 && progressPercentage < 100 ? 'Продолжить обучение' : 'Перейти к изучению';

        return (
            <div className={className}>
                <Button id="course-buttons-go-to-learning" size="lg" className="w-full" onClick={handleGoToLearning}>
                    <BookOpen className="mr-2 h-5 w-5" />
                    {buttonText}
                </Button>
            </div>
        );
    }

    return (
        <div className={cn('space-y-4', className)}>
            <div className="mb-4">
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
            </div>
            <div className="w-full flex flex-col gap-4 mt-8">
                <Button
                    id="course-buttons-buy-main-action"
                    size="lg"
                    onClick={handleCheckout}
                    isLoading={isCheckoutLoading}
                >
                    Купить курс
                </Button>
                <Button
                    variant={isInWishlist ? 'secondary' : 'outline'}
                    size="lg"
                    onClick={handleToggleWishlist}
                    isLoading={isWishlistPending}
                    aria-live="polite"
                >
                    {isWishlistPending ? (
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
        </div>
    );
};

export default CourseButtons;
