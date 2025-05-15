'use client';

import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { AlertTriangle, Bell, CheckCircle, Info, Loader2, Lock, Megaphone, Save, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { InteractiveHoverButton } from '@/components/magicui/interactive-hover-button';
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
    icon: React.ReactNode;
    isMarketing?: boolean;
    isSecurity?: boolean;
}> = [
    {
        name: 'emailGlobalOnOff',
        label: 'Все Email-уведомления',
        description: 'Главный переключатель для всех писем от платформы.',
        icon: <Bell className="h-5 w-5" />,
    },
    {
        name: 'emailMentorshipStatusChange',
        label: 'Статус заявки на менторство',
        description: 'Получать письма об одобрении или отклонении вашей заявки.',
        icon: <Info className="h-5 w-5" />,
    },
    {
        name: 'emailCoursePurchaseConfirmation',
        label: 'Подтверждение покупки курса',
        description: 'Письма с деталями ваших покупок.',
        icon: <CheckCircle className="h-5 w-5" />,
    },
    {
        name: 'emailCourseCompletion',
        label: 'Завершение курса',
        description: 'Уведомления о завершении вами курсов и доступности сертификатов.',
        icon: <CheckCircle className="h-5 w-5" />,
    },
    {
        name: 'emailNewReviewOnMyCourse',
        label: 'Новые отзывы на мои курсы (для менторов)',
        description: 'Получать уведомления, когда студенты оставляют отзывы на ваши курсы.',
        icon: <Info className="h-5 w-5" />,
    },
    {
        name: 'emailStudentCompletedMyCourse',
        label: 'Студент завершил мой курс (для менторов)',
        description: 'Уведомления, когда студенты полностью проходят ваши курсы.',
        icon: <Info className="h-5 w-5" />,
    },
    {
        name: 'emailProgressReminders',
        label: 'Напоминания о прогрессе',
        description: 'Периодические напоминания для продолжения обучения на курсах.',
        icon: <AlertTriangle className="h-5 w-5" />,
    },
    {
        name: 'emailMarketingNewCourses',
        label: 'Новые курсы и акции',
        description: 'Информация о новых курсах, специальных предложениях и скидках.',
        icon: <Megaphone className="h-5 w-5" />,
        isMarketing: true,
    },
    {
        name: 'emailMarketingUpdates',
        label: 'Обновления платформы',
        description: 'Новости об улучшениях и новых возможностях CodeHorizon.',
        icon: <Megaphone className="h-5 w-5" />,
        isMarketing: true,
    },
    {
        name: 'emailSecurityAlerts',
        label: 'Оповещения безопасности',
        description: 'Важные уведомления, связанные с безопасностью вашего аккаунта (например, попытки входа).',
        icon: <Shield className="h-5 w-5" />,
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
            <div className="relative min-h-screen">
                <div className="fixed inset-0 -z-10 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#3eccb2]/5 via-transparent to-transparent"></div>
                    <div className="absolute top-1/4 right-0 w-[40vw] h-[40vw] bg-gradient-to-bl from-[hsl(58,83%,62%)]/5 via-[hsl(68,27%,74%)]/5 to-transparent rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-1/3 w-[30vw] h-[30vw] bg-gradient-to-tr from-[hsl(173,58%,39%)]/5 via-[hsl(197,37%,24%)]/5 to-transparent rounded-full blur-3xl"></div>
                </div>

                <div className="max-w-5xl mx-auto p-6">
                    <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-950/90 border border-gray-200/50 dark:border-gray-800/50 shadow-md overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Bell className="h-6 w-6 text-[#3eccb2]" />
                                <span className="bg-gradient-to-r from-[#3eccb2] to-[hsl(173,58%,39%)] bg-clip-text text-transparent">
                                    Настройки уведомлений
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-center items-center py-20">
                            <div className="relative">
                                <div className="absolute inset-0 rounded-full bg-[#3eccb2]/20 blur-md"></div>
                                <Loader2 className="h-12 w-12 animate-spin text-[#3eccb2] relative" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const renderSwitchField = (
        fieldName: keyof NotificationFormData,
        label: string,
        description: string,
        icon: React.ReactNode,
        disabledCondition?: boolean
    ) => (
        <FormField
            control={form.control}
            name={fieldName}
            render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-xl border border-gray-200/50 dark:border-gray-800/50 p-4 shadow-sm hover:shadow-md transition-all backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
                    <div className="space-y-1 flex items-start gap-3">
                        <div
                            className={`flex-shrink-0 p-2 rounded-full ${field.value ? 'bg-gradient-to-r from-[#3eccb2]/20 to-[hsl(173,58%,39%)]/20 text-[#3eccb2]' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'} transition-colors`}
                        >
                            {icon}
                        </div>
                        <div>
                            <FormLabel
                                className="text-base cursor-pointer font-medium"
                                onClick={() => !(disabledCondition || isSubmitting) && field.onChange(!field.value)}
                            >
                                {label}
                            </FormLabel>
                            <FormDescription className="text-sm text-muted-foreground">{description}</FormDescription>
                        </div>
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
        <div className="relative min-h-screen">
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#3eccb2]/5 via-transparent to-transparent"></div>
                <div className="absolute top-1/4 right-0 w-[40vw] h-[40vw] bg-gradient-to-bl from-[hsl(58,83%,62%)]/5 via-[hsl(68,27%,74%)]/5 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-1/3 w-[30vw] h-[30vw] bg-gradient-to-tr from-[hsl(173,58%,39%)]/5 via-[hsl(197,37%,24%)]/5 to-transparent rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-5xl mx-auto p-6 mb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-950/90 border border-gray-200/50 dark:border-gray-800/50 shadow-md overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Bell className="h-6 w-6 text-[#3eccb2]" />
                                <span className="bg-gradient-to-r from-[#3eccb2] to-[hsl(173,58%,39%)] bg-clip-text text-transparent">
                                    Настройки уведомлений
                                </span>
                            </CardTitle>
                            <CardDescription>
                                Выберите, какие уведомления вы хотите получать по электронной почте.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {renderSwitchField(
                                            'emailGlobalOnOff',
                                            preferenceFields.find((f) => f.name === 'emailGlobalOnOff')!.label,
                                            preferenceFields.find((f) => f.name === 'emailGlobalOnOff')!.description,
                                            preferenceFields.find((f) => f.name === 'emailGlobalOnOff')!.icon
                                        )}
                                    </motion.div>

                                    {globalEmailEnabled && (
                                        <>
                                            <Separator className="my-6" />
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.5 }}
                                            >
                                                <h3 className="text-lg font-medium bg-gradient-to-r from-[#3eccb2] to-[hsl(173,58%,39%)] bg-clip-text text-transparent flex items-center gap-2 mb-4">
                                                    <Info className="h-5 w-5 text-[#3eccb2]" />
                                                    Основные уведомления
                                                </h3>
                                                <div className="space-y-4">
                                                    {preferenceFields
                                                        .filter(
                                                            (f) =>
                                                                f.name !== 'emailGlobalOnOff' &&
                                                                !f.isMarketing &&
                                                                !f.isSecurity
                                                        )
                                                        .map((item, index) => (
                                                            <motion.div
                                                                key={item.name}
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                                            >
                                                                {renderSwitchField(
                                                                    item.name,
                                                                    item.label,
                                                                    item.description,
                                                                    item.icon,
                                                                    !globalEmailEnabled
                                                                )}
                                                            </motion.div>
                                                        ))}
                                                </div>
                                            </motion.div>

                                            <Separator className="my-6" />
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.5, delay: 0.2 }}
                                            >
                                                <h3 className="text-lg font-medium bg-gradient-to-r from-[#3eccb2] to-[hsl(173,58%,39%)] bg-clip-text text-transparent flex items-center gap-2 mb-4">
                                                    <Megaphone className="h-5 w-5 text-[#3eccb2]" />
                                                    Маркетинговые уведомления
                                                </h3>
                                                <div className="space-y-4">
                                                    {preferenceFields
                                                        .filter((f) => f.isMarketing)
                                                        .map((item, index) => (
                                                            <motion.div
                                                                key={item.name}
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                                            >
                                                                {renderSwitchField(
                                                                    item.name,
                                                                    item.label,
                                                                    item.description,
                                                                    item.icon,
                                                                    !globalEmailEnabled
                                                                )}
                                                            </motion.div>
                                                        ))}
                                                </div>
                                            </motion.div>

                                            <Separator className="my-6" />
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.5, delay: 0.4 }}
                                            >
                                                <h3 className="text-lg font-medium bg-gradient-to-r from-[#3eccb2] to-[hsl(173,58%,39%)] bg-clip-text text-transparent flex items-center gap-2 mb-4">
                                                    <Shield className="h-5 w-5 text-[#3eccb2]" />
                                                    Оповещения безопасности
                                                </h3>
                                                <div className="space-y-4">
                                                    {preferenceFields
                                                        .filter((f) => f.isSecurity)
                                                        .map((item, index) => (
                                                            <motion.div
                                                                key={item.name}
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                                            >
                                                                {renderSwitchField(
                                                                    item.name,
                                                                    item.label,
                                                                    item.description,
                                                                    item.icon,
                                                                    !globalEmailEnabled
                                                                )}
                                                            </motion.div>
                                                        ))}
                                                </div>
                                            </motion.div>
                                        </>
                                    )}

                                    <motion.div
                                        className="flex justify-end pt-6 border-t border-gray-200/50 dark:border-gray-800/50"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.5 }}
                                    >
                                        <InteractiveHoverButton
                                            type="submit"
                                            disabled={isSubmitting}
                                            icon={<Save className="h-4 w-4" />}
                                        >
                                            {isSubmitting ? 'Сохранение...' : 'Сохранить настройки уведомлений'}
                                        </InteractiveHoverButton>
                                    </motion.div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default NotificationSettingsForm;
