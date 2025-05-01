'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { FaStar } from 'react-icons/fa6';
import { toast } from 'sonner';
import { z } from 'zod';

import { cn } from '@/lib/utils';
import ReviewsApiClient from '@/server/reviews';
import { CreateReviewRequestDTO, ReviewDTO, UpdateReviewRequestDTO } from '@/types/review';

import { Button } from '../ui/button';
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Textarea } from '../ui/textarea';

const reviewFormSchema = z.object({
    rating: z.number().min(1, 'Рейтинг обязателен').max(5),
    text: z.string().optional(),
});

type ReviewFormData = z.infer<typeof reviewFormSchema>;

interface ReviewFormProps {
    courseId: string;
    existingReview?: ReviewDTO;
    onClose: () => void;
    onSuccess: (updatedReview: ReviewDTO) => void;
    onDeleteSuccess: () => void;
}

const ReviewForm = ({ courseId, existingReview, onClose, onSuccess, onDeleteSuccess }: ReviewFormProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [hoverRating, setHoverRating] = useState<number>(0);

    const isEditing = !!existingReview;
    const apiClient = new ReviewsApiClient();

    const form = useForm<ReviewFormData>({
        resolver: zodResolver(reviewFormSchema),
        defaultValues: {
            rating: existingReview?.rating ?? 0,
            text: existingReview?.text ?? '',
        },
    });

    const currentRating = form.watch('rating');

    const onSubmit = async (values: ReviewFormData) => {
        setIsLoading(true);
        try {
            let result: ReviewDTO | null;
            if (isEditing && existingReview) {
                const updateData: UpdateReviewRequestDTO = values;
                result = await apiClient.updateReview(courseId, existingReview.id, updateData);
                toast.success('Отзыв успешно обновлен!');
            } else {
                const createData: CreateReviewRequestDTO = values;
                result = await apiClient.createReview(courseId, createData);
                toast.success('Отзыв успешно добавлен!');
            }
            if (result) {
                onSuccess(result);
            } else {
                throw new Error('Не удалось сохранить отзыв');
            }
        } catch (error: any) {
            console.error('Ошибка сохранения отзыва:', error);
            toast.error(error?.response?.data?.message || error?.message || 'Не удалось сохранить отзыв.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!existingReview || !confirm('Вы уверены, что хотите удалить этот отзыв?')) return;
        setIsDeleting(true);
        try {
            await apiClient.deleteReview(courseId, existingReview.id);
            toast.success('Отзыв удален');
            onDeleteSuccess();
        } catch (error: any) {
            console.error('Ошибка удаления отзыва:', error);
            toast.error(error?.response?.data?.message || error?.message || 'Не удалось удалить отзыв.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{isEditing ? 'Редактировать отзыв' : 'Написать отзыв'}</DialogTitle>
                <DialogDescription>Поделитесь своим мнением о курсе.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ваша оценка</FormLabel>
                                <FormControl>
                                    <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <FaStar
                                                key={star}
                                                className={cn(
                                                    'cursor-pointer transition-colors',
                                                    (hoverRating || currentRating) >= star
                                                        ? 'text-yellow-400'
                                                        : 'text-gray-300'
                                                )}
                                                size={24}
                                                onClick={() => field.onChange(star)}
                                                onMouseEnter={() => setHoverRating(star)}
                                            />
                                        ))}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="text"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ваш отзыв (необязательно)</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Расскажите подробнее..."
                                        {...field}
                                        value={field.value ?? ''}
                                        rows={5}
                                        disabled={isLoading || isDeleting}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <DialogFooter className="sm:justify-between">
                        {isEditing && (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDelete}
                                isLoading={isDeleting}
                                disabled={isLoading}
                            >
                                Удалить отзыв
                            </Button>
                        )}
                        <div className={cn(!isEditing && 'w-full', 'flex sm:justify-end gap-2')}>
                            <DialogClose asChild>
                                <Button type="button" variant="outline" disabled={isLoading || isDeleting}>
                                    Отмена
                                </Button>
                            </DialogClose>
                            <Button type="submit" isLoading={isLoading} disabled={currentRating === 0 || isDeleting}>
                                {isEditing ? 'Сохранить изменения' : 'Отправить отзыв'}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    );
};

export default ReviewForm;
