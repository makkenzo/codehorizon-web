'use client';

import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { settingsApiClient } from '@/server/settings';
import { ProfileVisibility, UpdatePrivacySettingsRequest } from '@/types/settings';

import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';

const privacySettingsFormSchema = z.object({
    profileVisibility: z.nativeEnum(ProfileVisibility, {
        required_error: 'Выберите видимость профиля',
    }),
    showEmailOnProfile: z.boolean(),
    showCoursesInProgressOnProfile: z.boolean(),
    showCompletedCoursesOnProfile: z.boolean(),
    showActivityFeedOnProfile: z.boolean(),
    allowDirectMessages: z.boolean(),
});

type PrivacyFormData = z.infer<typeof privacySettingsFormSchema>;

const PrivacySettingsForm = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<PrivacyFormData>({
        resolver: zodResolver(privacySettingsFormSchema),
        defaultValues: {
            profileVisibility: ProfileVisibility.PUBLIC,
            showEmailOnProfile: false,
            showCoursesInProgressOnProfile: true,
            showCompletedCoursesOnProfile: true,
            showActivityFeedOnProfile: true,
            allowDirectMessages: true,
        },
    });

    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            try {
                const currentSettings = await settingsApiClient.getPrivacySettings();
                if (currentSettings) {
                    form.reset(currentSettings);
                } else {
                    toast.info('Используются настройки конфиденциальности по умолчанию.');
                }
            } catch (error) {
                toast.error('Не удалось загрузить текущие настройки конфиденциальности.');
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, [form]);

    const onSubmit = async (data: PrivacyFormData) => {
        setIsSubmitting(true);
        try {
            const updateRequest: UpdatePrivacySettingsRequest = data;
            await settingsApiClient.updatePrivacySettings(updateRequest);
            toast.success('Настройки конфиденциальности успешно обновлены!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Ошибка при обновлении настроек.');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Настройки конфиденциальности</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center items-center p-10">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Настройки конфиденциальности</CardTitle>
                <CardDescription>Управляйте тем, какую информацию о вас видят другие пользователи.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="profileVisibility"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel className="text-base font-medium">Видимость профиля</FormLabel>
                                    <FormDescription>Кто может просматривать вашу страницу профиля.</FormDescription>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            className="flex flex-col space-y-2 pt-2"
                                            disabled={isSubmitting}
                                        >
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value={ProfileVisibility.PUBLIC} />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer">
                                                    Публичный (виден всем, включая незарегистрированных пользователей)
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value={ProfileVisibility.REGISTERED_USERS} />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer">
                                                    Зарегистрированные пользователи (виден только тем, кто вошел в
                                                    систему)
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value={ProfileVisibility.PRIVATE} />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer">
                                                    Приватный (виден только вам и администраторам)
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Separator />

                        <FormField
                            control={form.control}
                            name="showEmailOnProfile"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Показывать Email в профиле</FormLabel>
                                        <FormDescription>
                                            Если включено, ваш email будет виден на вашей публичной странице профиля.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isSubmitting}
                                            aria-readonly={isSubmitting}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="showCoursesInProgressOnProfile"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Показывать курсы в процессе</FormLabel>
                                        <FormDescription>
                                            Отображать на вашей публичной странице курсы, которые вы сейчас проходите.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="showCompletedCoursesOnProfile"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Показывать пройденные курсы</FormLabel>
                                        <FormDescription>
                                            Отображать на вашей публичной странице курсы, которые вы успешно завершили.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* <FormField
                            control={form.control}
                            name="showActivityFeedOnProfile"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Показывать ленту активности</FormLabel>
                                        <FormDescription>
                                            (Если будет реализована) Отображать вашу недавнюю активность на платформе.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="allowDirectMessages"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Разрешить личные сообщения</FormLabel>
                                        <FormDescription>
                                            (Если будут реализованы) Позволить другим пользователям отправлять вам
                                            личные сообщения.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        /> */}

                        <div className="flex justify-end pt-4">
                            <Button type="submit" isLoading={isSubmitting} disabled={isLoading}>
                                Сохранить изменения
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default PrivacySettingsForm;
