'use client';

import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Activity, BookOpen, CheckCircle, Eye, Loader2, Lock, Mail, MessageCircle, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { settingsApiClient } from '@/server/settings';
import { ProfileVisibility, UpdatePrivacySettingsRequest } from '@/types/settings';

import { InteractiveHoverButton } from '../magicui/interactive-hover-button';
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

const privacyFields: Array<{
    name: keyof PrivacyFormData;
    label: string;
    description: string;
    icon: React.ReactNode;
    isRadioGroup?: boolean;
    radioOptions?: Array<{ value: ProfileVisibility; label: string; description?: string }>;
}> = [
    {
        name: 'profileVisibility',
        label: 'Видимость профиля',
        description: 'Кто может просматривать вашу страницу профиля.',
        icon: <Eye className="h-5 w-5" />,
        isRadioGroup: true,
        radioOptions: [
            {
                value: ProfileVisibility.PUBLIC,
                label: 'Публичный',
                description: 'Виден всем, включая незарегистрированных пользователей.',
            },
            {
                value: ProfileVisibility.REGISTERED_USERS,
                label: 'Зарегистрированные пользователи',
                description: 'Виден только тем, кто вошел в систему.',
            },
            {
                value: ProfileVisibility.PRIVATE,
                label: 'Приватный',
                description: 'Виден только вам и администраторам.',
            },
        ],
    },
    {
        name: 'showEmailOnProfile',
        label: 'Показывать Email в профиле',
        description: 'Если включено, ваш email будет виден на вашей публичной странице профиля.',
        icon: <Mail className="h-5 w-5" />,
    },
    {
        name: 'showCoursesInProgressOnProfile',
        label: 'Показывать курсы в процессе',
        description: 'Отображать на вашей публичной странице курсы, которые вы сейчас проходите.',
        icon: <BookOpen className="h-5 w-5" />,
    },
    {
        name: 'showCompletedCoursesOnProfile',
        label: 'Показывать пройденные курсы',
        description: 'Отображать на вашей публичной странице курсы, которые вы успешно завершили.',
        icon: <CheckCircle className="h-5 w-5" />,
    },
    {
        name: 'showActivityFeedOnProfile',
        label: 'Показывать ленту активности',
        description: 'Отображать вашу активность (например, завершение уроков) в профиле.',
        icon: <Activity className="h-5 w-5" />,
    },
    {
        name: 'allowDirectMessages',
        label: 'Разрешить личные сообщения',
        description: 'Позволить другим пользователям отправлять вам личные сообщения на платформе.',
        icon: <MessageCircle className="h-5 w-5" />,
    },
];

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

    const renderSwitchField = (
        fieldName: keyof PrivacyFormData,
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
                            checked={field.value as boolean}
                            onCheckedChange={field.onChange}
                            disabled={disabledCondition || isSubmitting}
                            aria-label={label}
                            aria-readonly={disabledCondition || isSubmitting}
                        />
                    </FormControl>
                </FormItem>
            )}
        />
    );

    if (isLoading) {
        return (
            <div className="relative min-h-screen">
                <div className="fixed inset-0 -z-10 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#3eccb2]/5 via-transparent to-transparent"></div>
                    <div className="absolute top-1/4 right-0 w-[40vw] h-[40vw] bg-gradient-to-bl from-[hsl(58,83%,62%)]/5 via-[hsl(68,27%,74%)]/5 to-transparent rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-1/3 w-[30vw] h-[30vw] bg-gradient-to-tr from-[hsl(173,58%,39%)]/5 via-[hsl(197,37%,24%)]/5 to-transparent rounded-full blur-3xl\"></div>
                </div>
                <div className="max-w-5xl mx-auto p-6">
                    <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-950/90 border border-gray-200/50 dark:border-gray-800/50 shadow-md overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Lock className="h-6 w-6 text-[#3eccb2]" />
                                <span className="bg-gradient-to-r from-[#3eccb2] to-[hsl(173,58%,39%)] bg-clip-text text-transparent">
                                    Настройки конфиденциальности
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

    return (
        <div className="relative min-h-screen">
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#3eccb2]/5 via-transparent to-transparent"></div>
                <div className="absolute top-1/4 right-0 w-[40vw] h-[40vw] bg-gradient-to-bl from-[hsl(58,83%,62%)]/5 via-[hsl(68,27%,74%)]/5 to-transparent rounded-full blur-3xl\"></div>
                <div className="absolute bottom-0 left-1/3 w-[30vw] h-[30vw] bg-gradient-to-tr from-[hsl(173,58%,39%)]/5 via-[hsl(197,37%,24%)]/5 to-transparent rounded-full blur-3xl\"></div>
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
                                <Lock className="h-6 w-6 text-[#3eccb2]" />
                                <span className="bg-gradient-to-r from-[#3eccb2] to-[hsl(173,58%,39%)] bg-clip-text text-transparent">
                                    Настройки конфиденциальности
                                </span>
                            </CardTitle>
                            <CardDescription>
                                Управляйте тем, какую информацию о вас видят другие пользователи.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                    {privacyFields.map((item, index) => (
                                        <motion.div
                                            key={item.name}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                        >
                                            {item.isRadioGroup ? (
                                                <FormField
                                                    control={form.control}
                                                    name={item.name as 'profileVisibility'}
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-3 rounded-xl border border-gray-200/50 dark:border-gray-800/50 p-4 shadow-sm backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
                                                            <div className="flex items-start gap-3">
                                                                <div className="flex-shrink-0 p-2 rounded-full bg-gradient-to-r from-[#3eccb2]/20 to-[hsl(173,58%,39%)]/20 text-[#3eccb2] transition-colors">
                                                                    {item.icon}
                                                                </div>
                                                                <div>
                                                                    <FormLabel className="text-base font-medium">
                                                                        {item.label}
                                                                    </FormLabel>
                                                                    <FormDescription className="text-sm text-muted-foreground">
                                                                        {item.description}
                                                                    </FormDescription>
                                                                </div>
                                                            </div>
                                                            <FormControl>
                                                                <RadioGroup
                                                                    onValueChange={field.onChange}
                                                                    value={field.value}
                                                                    className="flex flex-col space-y-2 pt-2 pl-12"
                                                                    disabled={isSubmitting}
                                                                >
                                                                    {item.radioOptions?.map((option) => (
                                                                        <FormItem
                                                                            key={option.value}
                                                                            className="flex items-center space-x-3 space-y-0"
                                                                        >
                                                                            <FormControl>
                                                                                <RadioGroupItem value={option.value} />
                                                                            </FormControl>
                                                                            <div className="grid gap-0.5">
                                                                                <FormLabel className="font-normal cursor-pointer">
                                                                                    {option.label}
                                                                                </FormLabel>
                                                                                {option.description && (
                                                                                    <FormDescription className="text-xs">
                                                                                        {option.description}
                                                                                    </FormDescription>
                                                                                )}
                                                                            </div>
                                                                        </FormItem>
                                                                    ))}
                                                                </RadioGroup>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            ) : (
                                                renderSwitchField(item.name, item.label, item.description, item.icon)
                                            )}
                                            {index < privacyFields.length - 1 && <Separator className="my-6" />}
                                        </motion.div>
                                    ))}

                                    <motion.div
                                        className="flex justify-end pt-6 border-t border-gray-200/50 dark:border-gray-800/50"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: privacyFields.length * 0.1 }}
                                    >
                                        <InteractiveHoverButton
                                            type="submit"
                                            disabled={isSubmitting}
                                            icon={<Save className="h-4 w-4" />}
                                        >
                                            {isSubmitting ? 'Сохранение...' : 'Сохранить настройки'}
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

export default PrivacySettingsForm;
