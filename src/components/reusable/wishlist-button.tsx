'use client';

import { useEffect, useState, useTransition } from 'react';

import { Loader2 } from 'lucide-react';
import { FaRegHeart } from 'react-icons/fa6';
import { toast } from 'sonner';

import CoursesApiClient from '@/server/courses';

import { Button } from '../ui/button';

interface WishlistButtonProps {
    courseId: string;
}

const WishlistButton = ({ courseId }: WishlistButtonProps) => {
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [isPending, startTransition] = useTransition();

    const apiClient = new CoursesApiClient();

    useEffect(() => {
        const fetchData = async () => {
            const isInWishlist = await apiClient.isCourseInWishlist(courseId).catch((err) => {
                console.error(`Ошибка проверки вишлиста для курса ${courseId}:`, err);
                return false;
            });

            setIsInWishlist(isInWishlist);
        };

        fetchData();
    }, []);

    const handleToggleWishlist = () => {
        startTransition(async () => {
            const action = isInWishlist ? 'удаления' : 'добавления';
            const currentWishlistStatus = isInWishlist;

            try {
                if (currentWishlistStatus) {
                    await apiClient.removeFromWishlist(courseId);
                    toast.success('Курс удален из желаемого');
                    setIsInWishlist(false);
                } else {
                    await apiClient.addToWishlist(courseId);
                    toast.success('Курс добавлен в желаемое');
                    setIsInWishlist(true);
                }
            } catch (error: any) {
                console.error(`Ошибка ${action} курса (${courseId}) в желаемое:`, error);

                toast.error(
                    error.response?.data?.message ||
                        `Не удалось ${action.replace('ия', 'ить')} курс ${action === 'удаления' ? 'из' : 'в'} желаемое`
                );
            }
        });
    };

    return (
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
    );
};

export default WishlistButton;
