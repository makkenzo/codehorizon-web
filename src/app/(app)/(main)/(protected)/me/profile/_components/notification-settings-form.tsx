'use client';

import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import PageWrapper from '@/components/reusable/page-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { settingsApiClient } from '@/server/settings';
import { UpdateNotificationPreferencesRequest } from '@/types/settings';

const notificationSettingsFormSchema = z.object({
    emailGlobalOnOff: z.boolean(),
    emailMentorshipStatusChange: z.boolean(),
    emailCoursePurchaseConfirmation: z.boolean(),
    emailCourseCompletion: z.boolean(),
    emailNewReviewOnMyCourse: z.boolean(),
    emailStudentCompletedMyCourse: z.boolean(),
    emailMarketingNewCourses: z.boolean(),
    emailMarketingUpdates: z.boolean(),
    emailProgressReminders: z.boolean(),
    emailSecurityAlerts: z.boolean(),
});

type NotificationFormData = z.infer<typeof notificationSettingsFormSchema>;

const preferenceFields: Array<{
    name: keyof NotificationFormData;
    label: string;
    description: string;
    isMarketing?: boolean;
    isSecurity?: boolean;
}> = [
    {
        name: 'emailGlobalOnOff',
        label: 'Все Email-уведомления',
        description: 'Главный переключатель для всех писем от платформы.',
    },
    {
        name: 'emailMentorshipStatusChange',
        label: 'Статус заявки на менторство',
        description: 'Получать письма об одобрении или отклонении вашей заявки.',
    },
    {
        name: 'emailCoursePurchaseConfirmation',
        label: 'Подтверждение покупки курса',
        description: 'Письма с деталями ваших покупок.',
    },
    {
        name: 'emailCourseCompletion',
        label: 'Завершение курса',
        description: 'Уведомления о завершении вами курсов и доступности сертификатов.',
    },
    {
        name: 'emailNewReviewOnMyCourse',
        label: 'Новые отзывы на мои курсы (для менторов)',
        description: 'Получать уведомления, когда студенты оставляют отзывы на ваши курсы.',
    },
    {
        name: 'emailStudentCompletedMyCourse',
        label: 'Студент завершил мой курс (для менторов)',
        description: 'Уведомления, когда студенты полностью проходят ваши курсы.',
    },
    {
        name: 'emailProgressReminders',
        label: 'Напоминания о прогрессе',
        description: 'Периодические напоминания для продолжения обучения на курсах.',
    },
    {
        name: 'emailMarketingNewCourses',
        label: 'Новые курсы и акции',
        description: 'Информация о новых курсах, специальных предложениях и скидках.',
        isMarketing: true,
    },
    {
        name: 'emailMarketingUpdates',
        label: 'Обновления платформы',
        description: 'Новости об улучшениях и новых возможностях CodeHorizon.',
        isMarketing: true,
    },
    {
        name: 'emailSecurityAlerts',
        label: 'Оповещения безопасности',
        description: 'Важные уведомления, связанные с безопасностью вашего аккаунта (например, попытки входа).',
        isSecurity: true,
    },
];

const NotificationSettingsForm = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<NotificationFormData>({
        resolver: zodResolver(notificationSettingsFormSchema),
        defaultValues: {
            emailGlobalOnOff: true,
            emailMentorshipStatusChange: true,
            emailCoursePurchaseConfirmation: true,
            emailCourseCompletion: true,
            emailNewReviewOnMyCourse: true,
            emailStudentCompletedMyCourse: true,
            emailMarketingNewCourses: true,
            emailMarketingUpdates: true,
            emailProgressReminders: false,
            emailSecurityAlerts: true,
        },
    });

    const globalEmailEnabled = form.watch('emailGlobalOnOff');

    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            try {
                const currentSettings = await settingsApiClient.getNotificationPreferences();
                if (currentSettings) {
                    form.reset(currentSettings);
                } else {
                    toast.info('Используются настройки уведомлений по умолчанию.');
                }
            } catch (error) {
                toast.error('Не удалось загрузить текущие настройки уведомлений.');
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, [form]);

    const onSubmit = async (data: NotificationFormData) => {
        setIsSubmitting(true);
        const updateRequest: UpdateNotificationPreferencesRequest = data;
        try {
            await settingsApiClient.updateNotificationPreferences(updateRequest);
            toast.success('Настройки уведомлений успешно обновлены!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Ошибка при обновлении настроек уведомлений.');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <PageWrapper>
                <Card>
                    <CardHeader>
                        <CardTitle>Настройки уведомлений</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center py-20">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </CardContent>
                </Card>
            </PageWrapper>
        );
    }

    const renderSwitchField = (
        fieldName: keyof NotificationFormData,
        label: string,
        description: string,
        disabledCondition?: boolean
    ) => (
        <FormField
            control={form.control}
            name={fieldName}
            render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="space-y-0.5">
                        <FormLabel
                            className="text-base cursor-pointer"
                            onClick={() => !(disabledCondition || isSubmitting) && field.onChange(!field.value)}
                        >
                            {label}
                        </FormLabel>
                        <FormDescription>{description}</FormDescription>
                    </div>
                    <FormControl>
                        <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={disabledCondition || isSubmitting}
                            aria-label={label}
                        />
                    </FormControl>
                </FormItem>
            )}
        />
    );

    return (
        <PageWrapper>
            <Card className="mb-12">
                <CardHeader>
                    <CardTitle>Настройки уведомлений</CardTitle>
                    <CardDescription>
                        Выберите, какие уведомления вы хотите получать по электронной почте.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            {renderSwitchField(
                                'emailGlobalOnOff',
                                preferenceFields.find((f) => f.name === 'emailGlobalOnOff')!.label,
                                preferenceFields.find((f) => f.name === 'emailGlobalOnOff')!.description
                            )}
                            {globalEmailEnabled && (
                                <>
                                    <Separator className="my-6" />
                                    <h3 className="text-lg font-medium text-muted-foreground">Основные уведомления</h3>
                                    <div className="space-y-4">
                                        {preferenceFields
                                            .filter(
                                                (f) => f.name !== 'emailGlobalOnOff' && !f.isMarketing && !f.isSecurity
                                            )
                                            .map((item) =>
                                                renderSwitchField(
                                                    item.name,
                                                    item.label,
                                                    item.description,
                                                    !globalEmailEnabled
                                                )
                                            )}
                                    </div>

                                    <Separator className="my-6" />
                                    <h3 className="text-lg font-medium text-muted-foreground">
                                        Маркетинговые уведомления
                                    </h3>
                                    <div className="space-y-4">
                                        {preferenceFields
                                            .filter((f) => f.isMarketing)
                                            .map((item) =>
                                                renderSwitchField(
                                                    item.name,
                                                    item.label,
                                                    item.description,
                                                    !globalEmailEnabled
                                                )
                                            )}
                                    </div>

                                    <Separator className="my-6" />
                                    <h3 className="text-lg font-medium text-muted-foreground">
                                        Оповещения безопасности
                                    </h3>
                                    <div className="space-y-4">
                                        {preferenceFields
                                            .filter((f) => f.isSecurity)
                                            .map((item) =>
                                                renderSwitchField(
                                                    item.name,
                                                    item.label,
                                                    item.description,
                                                    !globalEmailEnabled
                                                )
                                            )}
                                    </div>
                                </>
                            )}

                            <div className="flex justify-end pt-6 border-t">
                                <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
                                    Сохранить настройки уведомлений
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </PageWrapper>
    );
};

export default NotificationSettingsForm;
