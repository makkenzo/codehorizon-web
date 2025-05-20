import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { mentorshipApiClient } from '@/server/mentorship';
import { useUserStore } from '@/stores/user/user-store-provider';

import { Button } from '../ui/button';
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Textarea } from '../ui/textarea';

interface MentorshipApplicationModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const applicationSchema = z.object({
    reason: z.string().max(1000, 'Причина не должна превышать 1000 символов').optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

const MentorshipApplicationModal: React.FC<MentorshipApplicationModalProps> = ({ onClose, onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useUserStore((state) => state);

    const form = useForm<ApplicationFormData>({
        resolver: zodResolver(applicationSchema),
        defaultValues: {
            reason: '',
        },
    });

    const onSubmit = async (values: ApplicationFormData) => {
        if (!user?.isVerified) {
            toast.error('Пожалуйста, подтвердите ваш email, чтобы подать заявку на менторство.');
            return;
        }

        setIsSubmitting(true);
        try {
            const newApplication = await mentorshipApiClient.applyForMentorship({ reason: values.reason });
            if (newApplication) {
                toast.success('Заявка на менторство успешно подана!');
                onSuccess();
            }
        } catch (error: unknown) {
            if (isAxiosError(error) && error.response?.data?.message) {
                toast.error(`Ошибка: ${error.response.data.message}`);
            } else {
                toast.error('Не удалось подать заявку. Попробуйте позже.');
            }
            console.error('Mentorship application error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
                <DialogTitle>Заявка на менторство</DialogTitle>
                <DialogDescription>
                    Расскажите немного о том, почему вы хотите стать ментором на нашей платформе.
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <FormField
                        control={form.control}
                        name="reason"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Почему вы хотите стать ментором? (необязательно)</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Например, я имею опыт в веб-разработке и хочу помочь начинающим..."
                                        {...field}
                                        rows={5}
                                        disabled={isSubmitting}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <DialogFooter className="pt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={isSubmitting} onClick={onClose}>
                                Отмена
                            </Button>
                        </DialogClose>
                        <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
                            Отправить заявку
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    );
};

export default MentorshipApplicationModal;
