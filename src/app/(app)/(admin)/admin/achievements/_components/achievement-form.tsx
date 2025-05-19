'use client';

import type React from 'react';
import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import {
    ArrowLeft,
    Award,
    BadgeCheck,
    BookOpen,
    CheckCircle2,
    Crown,
    Eye,
    EyeOff,
    Globe,
    ImageIcon,
    Key,
    Layers,
    Loader2,
    MessageSquareText,
    PlusCircle,
    Settings,
    Sparkles,
    Star,
    Target,
    Trash2,
    TrendingUp,
    Trophy,
    Type,
} from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { usePermissions } from '@/hooks/use-permissions';
import { adminApiClient } from '@/server/admin-api-client';
import { AchievementRarity, AchievementTriggerType } from '@/types/achievements';
import type {
    AdminAchievementDTO,
    AdminCreateAchievementDTO,
    AdminUpdateAchievementDTO,
} from '@/types/achievementsAdmin';

const achievementFormSchema = z.object({
    key: z
        .string()
        .min(3, 'Ключ должен содержать минимум 3 символа')
        .max(100, 'Ключ не должен превышать 100 символов')
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Ключ может содержать только строчные латинские буквы, цифры и дефисы'),
    name: z.string().min(1, 'Название обязательно').max(255),
    description: z.string().min(1, 'Описание обязательно').max(1000),
    iconUrl: z.string().url('Некорректный URL иконки').min(1, 'URL иконки обязателен'),
    triggerType: z.nativeEnum(AchievementTriggerType, { errorMap: () => ({ message: 'Выберите тип триггера' }) }),
    triggerThreshold: z.coerce.number().min(0, 'Порог не может быть отрицательным'),
    triggerThresholdValue: z.string().max(255).nullable().optional(),
    xpBonus: z.coerce.number().min(0, 'XP бонус не может быть отрицательным').default(0),
    rarity: z.nativeEnum(AchievementRarity).default(AchievementRarity.COMMON),
    isGlobal: z.boolean().default(true),
    order: z.coerce.number().min(0, 'Порядок не может быть отрицательным').default(0),
    category: z.string().max(100).nullable().optional(),
    isHidden: z.boolean().default(false),
    prerequisites: z.array(z.string().min(1, 'Ключ предусловия не может быть пустым')).optional().default([]),
});

type AchievementFormData = z.infer<typeof achievementFormSchema>;

interface AchievementFormProps {
    initialData?: AdminAchievementDTO | null;
    onFormSubmitSuccess: (data: AdminAchievementDTO) => void;
}

const AchievementForm: React.FC<AchievementFormProps> = ({ initialData, onFormSubmitSuccess }) => {
    const router = useRouter();
    const { hasPermission } = usePermissions();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [activeSection, setActiveSection] = useState<string>('basic');
    const [currentRarity, setCurrentRarity] = useState<AchievementRarity>(
        initialData?.rarity || AchievementRarity.COMMON
    );

    const isEditMode = !!initialData?.id;

    const form = useForm<AchievementFormData>({
        resolver: zodResolver(achievementFormSchema),
        defaultValues: initialData
            ? {
                  ...initialData,
                  triggerThresholdValue: initialData.triggerThresholdValue || undefined,
                  category: initialData.category || undefined,
                  prerequisites: initialData.prerequisites || [],
                  triggerType: initialData.triggerType,
                  rarity: initialData.rarity,
              }
            : {
                  key: '',
                  name: '',
                  description: '',
                  iconUrl: '',
                  triggerThreshold: 0,
                  triggerThresholdValue: undefined,
                  xpBonus: 0,
                  rarity: AchievementRarity.COMMON,
                  isGlobal: true,
                  order: 0,
                  category: undefined,
                  isHidden: false,
                  prerequisites: [],
                  triggerType: AchievementTriggerType.COURSE_COMPLETION_COUNT,
              },
    });

    // Отслеживаем изменение редкости
    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name === 'rarity' && value.rarity) {
                setCurrentRarity(value.rarity as AchievementRarity);
            }
        });
        return () => subscription.unsubscribe();
    }, [form.watch]);

    const {
        fields: prerequisiteFields,
        append: appendPrerequisite,
        remove: removePrerequisite,
    } = useFieldArray({
        control: form.control,
        name: 'prerequisites' as never,
    });

    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoadingCategories(true);
            try {
                const cats = await adminApiClient.getAchievementCategories();
                setAvailableCategories(cats || []);
            } catch (error) {
                toast.error('Не удалось загрузить категории достижений.');
            } finally {
                setIsLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (initialData) {
            form.reset({
                ...initialData,
                triggerThresholdValue: initialData.triggerThresholdValue || undefined,
                category: initialData.category || undefined,
                prerequisites: initialData.prerequisites || [],
            });
            setCurrentRarity(initialData.rarity);
        } else {
            form.reset({
                key: '',
                name: '',
                description: '',
                iconUrl: '',
                triggerType: undefined,
                triggerThreshold: 0,
                triggerThresholdValue: undefined,
                xpBonus: 0,
                rarity: AchievementRarity.COMMON,
                isGlobal: true,
                order: 0,
                category: undefined,
                isHidden: false,
                prerequisites: [],
            });
            setCurrentRarity(AchievementRarity.COMMON);
        }
    }, [initialData, form]);

    const onSubmit = async (data: AchievementFormData) => {
        if (!hasPermission('achievement:admin:manage')) {
            toast.error('У вас нет прав для выполнения этого действия.');
            return;
        }
        setIsSubmitting(true);
        try {
            const payload = {
                ...data,
                triggerThresholdValue: data.triggerThresholdValue?.trim() === '' ? null : data.triggerThresholdValue,
                category: data.category?.trim() === '' ? null : data.category,
            };

            let result: AdminAchievementDTO;
            if (isEditMode && initialData) {
                result = await adminApiClient.updateAchievementDefinition(
                    initialData.id,
                    payload as AdminUpdateAchievementDTO
                );
                toast.success(`Достижение "${result.name}" успешно обновлено!`);
            } else {
                result = await adminApiClient.createAchievementDefinition(payload as AdminCreateAchievementDTO);
                toast.success(`Достижение "${result.name}" успешно создано!`);
            }
            onFormSubmitSuccess(result);
        } catch (err: unknown) {
            let errorMsg = 'Произошла ошибка.';
            if (isAxiosError(err)) {
                errorMsg = err.response?.data?.message || err.message || errorMsg;
            } else if (err instanceof Error) {
                errorMsg = err.message;
            }
            toast.error(`Ошибка: ${errorMsg}`);
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Функции для получения цветов и градиентов на основе редкости
    function getRarityGradient(rarity: AchievementRarity): string {
        switch (rarity) {
            case AchievementRarity.COMMON:
                return 'from-cyan-500 to-blue-500';
            case AchievementRarity.UNCOMMON:
                return 'from-emerald-500 to-green-600';
            case AchievementRarity.RARE:
                return 'from-blue-500 to-indigo-600';
            case AchievementRarity.EPIC:
                return 'from-purple-500 to-pink-500';
            case AchievementRarity.LEGENDARY:
                return 'from-amber-400 to-orange-500';
            default:
                return 'from-cyan-500 to-blue-500';
        }
    }

    function getRarityGradientHover(rarity: AchievementRarity): string {
        switch (rarity) {
            case AchievementRarity.COMMON:
                return 'from-cyan-600 to-blue-600';
            case AchievementRarity.UNCOMMON:
                return 'from-emerald-600 to-green-700';
            case AchievementRarity.RARE:
                return 'from-blue-600 to-indigo-700';
            case AchievementRarity.EPIC:
                return 'from-purple-600 to-pink-600';
            case AchievementRarity.LEGENDARY:
                return 'from-amber-500 to-orange-600';
            default:
                return 'from-cyan-600 to-blue-600';
        }
    }

    function getRarityLightGradient(rarity: AchievementRarity): string {
        switch (rarity) {
            case AchievementRarity.COMMON:
                return 'from-cyan-100 to-blue-100';
            case AchievementRarity.UNCOMMON:
                return 'from-emerald-100 to-green-100';
            case AchievementRarity.RARE:
                return 'from-blue-100 to-indigo-100';
            case AchievementRarity.EPIC:
                return 'from-purple-100 to-pink-100';
            case AchievementRarity.LEGENDARY:
                return 'from-amber-100 to-orange-100';
            default:
                return 'from-cyan-100 to-blue-100';
        }
    }

    function getRarityColor(rarity: AchievementRarity): string {
        switch (rarity) {
            case AchievementRarity.COMMON:
                return 'text-cyan-500';
            case AchievementRarity.UNCOMMON:
                return 'text-emerald-500';
            case AchievementRarity.RARE:
                return 'text-blue-500';
            case AchievementRarity.EPIC:
                return 'text-purple-500';
            case AchievementRarity.LEGENDARY:
                return 'text-amber-500';
            default:
                return 'text-cyan-500';
        }
    }

    function getRarityBgColor(rarity: AchievementRarity): string {
        switch (rarity) {
            case AchievementRarity.COMMON:
                return 'bg-cyan-500';
            case AchievementRarity.UNCOMMON:
                return 'bg-emerald-500';
            case AchievementRarity.RARE:
                return 'bg-blue-500';
            case AchievementRarity.EPIC:
                return 'bg-purple-500';
            case AchievementRarity.LEGENDARY:
                return 'bg-amber-500';
            default:
                return 'bg-cyan-500';
        }
    }

    function getRarityIcon(rarity: AchievementRarity) {
        switch (rarity) {
            case AchievementRarity.COMMON:
                return <BadgeCheck className="h-5 w-5" />;
            case AchievementRarity.UNCOMMON:
                return <Award className="h-5 w-5" />;
            case AchievementRarity.RARE:
                return <Trophy className="h-5 w-5" />;
            case AchievementRarity.EPIC:
                return <Sparkles className="h-5 w-5" />;
            case AchievementRarity.LEGENDARY:
                return <Crown className="h-5 w-5" />;
            default:
                return <BadgeCheck className="h-5 w-5" />;
        }
    }

    const rarityOptions = Object.values(AchievementRarity).map((rarity) => ({
        value: rarity,
        label: rarity.charAt(0) + rarity.slice(1).toLowerCase(),
        icon: getRarityIcon(rarity),
        color: getRarityColor(rarity),
        bgColor: getRarityBgColor(rarity),
    }));

    function getTriggerIcon(type: AchievementTriggerType) {
        switch (type) {
            case AchievementTriggerType.COURSE_COMPLETION_COUNT:
                return <BookOpen className="h-5 w-5" />;
            case AchievementTriggerType.SPECIFIC_COURSE_COMPLETED:
                return <CheckCircle2 className="h-5 w-5" />;
            case AchievementTriggerType.CATEGORY_COURSES_COMPLETED:
                return <Layers className="h-5 w-5" />;
            default:
                return <Target className="h-5 w-5" />;
        }
    }

    const triggerTypeOptions = Object.values(AchievementTriggerType).map((type) => ({
        value: type,
        label: type
            .replace(/_/g, ' ')
            .split(' ')
            .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
            .join(' '),
        icon: getTriggerIcon(type),
    }));

    const sections = [
        { id: 'basic', label: 'Основная информация', icon: <Trophy /> },
        { id: 'trigger', label: 'Условия получения', icon: <Target /> },
        { id: 'reward', label: 'Награда и отображение', icon: <Star /> },
        { id: 'prerequisites', label: 'Предусловия', icon: <Layers /> },
    ];

    // Текущий градиент на основе выбранной редкости
    const currentGradient = getRarityGradient(currentRarity);
    const currentGradientHover = getRarityGradientHover(currentRarity);
    const currentLightGradient = getRarityLightGradient(currentRarity);

    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="relative">
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-br from-purple-600/30 to-pink-500/30 rounded-full blur-3xl opacity-70 animate-pulse"></div>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gradient-to-br from-blue-600/30 to-cyan-500/30 rounded-full blur-3xl opacity-70 animate-pulse"></div>

                <div className="relative backdrop-blur-sm">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-64 bg-black/5 backdrop-blur-md rounded-3xl p-6 h-fit sticky top-0">
                            <div className="flex items-center gap-3 mb-8">
                                <div
                                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${currentGradient} flex items-center justify-center text-white transition-colors duration-500`}
                                >
                                    <Trophy className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold">{isEditMode ? 'Редактирование' : 'Создание'}</h2>
                                    <p className="text-sm text-gray-500">Достижения</p>
                                </div>
                            </div>

                            <nav className="space-y-2">
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-500 ${
                                            activeSection === section.id
                                                ? `bg-gradient-to-r ${currentGradient} text-white shadow-lg shadow-${getRarityBgColor(currentRarity)}/20 scale-105`
                                                : 'hover:bg-black/5 text-gray-700'
                                        }`}
                                    >
                                        <div
                                            className={`h-10 w-10 rounded-md px-2 shrink-0 flex items-center justify-center ${
                                                activeSection === section.id ? 'bg-white/20' : 'bg-black/5'
                                            }`}
                                        >
                                            {section.icon}
                                        </div>
                                        <span className="font-medium">{section.label}</span>
                                    </button>
                                ))}
                            </nav>

                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push('/admin/achievements')}
                                    className="w-full bg-white/80 hover:bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Назад к списку
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1">
                            <Card className="border-0 py-0 bg-white/70 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden">
                                <CardHeader
                                    className={`bg-gradient-to-r ${currentGradient} p-8 transition-colors duration-500`}
                                >
                                    <CardTitle className="flex items-center gap-3 text-3xl text-white">
                                        {isEditMode ? (
                                            <>
                                                <Settings className="h-8 w-8" />
                                                Редактировать Достижение
                                            </>
                                        ) : (
                                            <>
                                                <Trophy className="h-8 w-8" />
                                                Создать Новое Достижение
                                            </>
                                        )}
                                    </CardTitle>
                                    <CardDescription className="text-white/80 text-lg">
                                        {isEditMode
                                            ? `Изменение данных для "${initialData?.name}"`
                                            : 'Заполните детали нового достижения.'}
                                    </CardDescription>
                                </CardHeader>

                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)}>
                                        <CardContent className="p-8">
                                            {/* Basic Information Section */}
                                            <div className={activeSection === 'basic' ? 'block' : 'hidden'}>
                                                <div className="relative mb-10">
                                                    <h3
                                                        className={`inline-block text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${currentGradient} transition-colors duration-500`}
                                                    >
                                                        Основная информация
                                                    </h3>
                                                    <div
                                                        className={`absolute -bottom-3 left-0 w-20 h-1 bg-gradient-to-r ${currentGradient} rounded-full transition-colors duration-500`}
                                                    ></div>
                                                </div>

                                                <div className="space-y-8">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <FormField
                                                            control={form.control}
                                                            name="key"
                                                            render={({ field }) => (
                                                                <FormItem className="group">
                                                                    <FormLabel className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-2">
                                                                        <div
                                                                            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentGradient} flex items-center justify-center text-white transition-colors duration-500`}
                                                                        >
                                                                            <Key className="h-4 w-4" />
                                                                        </div>
                                                                        Уникальный ключ *
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <div className="relative">
                                                                            <Input
                                                                                placeholder="first-course-completed"
                                                                                {...field}
                                                                                disabled={isSubmitting || isEditMode}
                                                                                className="h-12 pl-4 pr-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white/80 backdrop-blur-sm shadow-sm group-hover:shadow-md transition-all duration-300"
                                                                            />
                                                                        </div>
                                                                    </FormControl>
                                                                    <FormDescription className="text-gray-500 text-sm mt-2">
                                                                        Латиница, цифры, дефисы. Не меняется после
                                                                        создания.
                                                                    </FormDescription>
                                                                    <FormMessage className="text-red-500 text-sm mt-1" />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name="name"
                                                            render={({ field }) => (
                                                                <FormItem className="group">
                                                                    <FormLabel className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-2">
                                                                        <div
                                                                            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentGradient} flex items-center justify-center text-white transition-colors duration-500`}
                                                                        >
                                                                            <Type className="h-4 w-4" />
                                                                        </div>
                                                                        Название *
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <div className="relative">
                                                                            <Input
                                                                                placeholder="Первопроходец"
                                                                                {...field}
                                                                                disabled={isSubmitting}
                                                                                className="h-12 pl-4 pr-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white/80 backdrop-blur-sm shadow-sm group-hover:shadow-md transition-all duration-300"
                                                                            />
                                                                        </div>
                                                                    </FormControl>
                                                                    <FormMessage className="text-red-500 text-sm mt-1" />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>

                                                    <FormField
                                                        control={form.control}
                                                        name="description"
                                                        render={({ field }) => (
                                                            <FormItem className="group">
                                                                <FormLabel className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-2">
                                                                    <div
                                                                        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentGradient} flex items-center justify-center text-white transition-colors duration-500`}
                                                                    >
                                                                        <MessageSquareText className="h-4 w-4" />
                                                                    </div>
                                                                    Описание *
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <div className="relative">
                                                                        <Textarea
                                                                            placeholder="Завершите свой первый курс на платформе"
                                                                            {...field}
                                                                            disabled={isSubmitting}
                                                                            rows={3}
                                                                            className="pl-4 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white/80 backdrop-blur-sm shadow-sm group-hover:shadow-md transition-all duration-300"
                                                                        />
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage className="text-red-500 text-sm mt-1" />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="iconUrl"
                                                        render={({ field }) => (
                                                            <FormItem className="group">
                                                                <FormLabel className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-2">
                                                                    <div
                                                                        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentGradient} flex items-center justify-center text-white transition-colors duration-500`}
                                                                    >
                                                                        <ImageIcon className="h-4 w-4" />
                                                                    </div>
                                                                    URL иконки *
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <div className="relative">
                                                                        <Input
                                                                            placeholder="https://example.com/icon.png"
                                                                            {...field}
                                                                            disabled={isSubmitting}
                                                                            className="h-12 pl-4 pr-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white/80 backdrop-blur-sm shadow-sm group-hover:shadow-md transition-all duration-300"
                                                                        />
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage className="text-red-500 text-sm mt-1" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            {/* Trigger Conditions Section */}
                                            <div className={activeSection === 'trigger' ? 'block' : 'hidden'}>
                                                <div className="relative mb-10">
                                                    <h3
                                                        className={`inline-block text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${currentGradient} transition-colors duration-500`}
                                                    >
                                                        Условия получения
                                                    </h3>
                                                    <div
                                                        className={`absolute -bottom-3 left-0 w-20 h-1 bg-gradient-to-r ${currentGradient} rounded-full transition-colors duration-500`}
                                                    ></div>
                                                </div>

                                                <div className="space-y-8">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <FormField
                                                            control={form.control}
                                                            name="triggerType"
                                                            render={({ field }) => (
                                                                <FormItem className="group">
                                                                    <FormLabel className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-2">
                                                                        <div
                                                                            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentGradient} flex items-center justify-center text-white transition-colors duration-500`}
                                                                        >
                                                                            <Settings className="h-4 w-4" />
                                                                        </div>
                                                                        Тип триггера *
                                                                    </FormLabel>
                                                                    <Select
                                                                        onValueChange={field.onChange}
                                                                        defaultValue={field.value}
                                                                        disabled={isSubmitting}
                                                                    >
                                                                        <FormControl>
                                                                            <SelectTrigger className="h-12 pl-4 pr-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white/80 backdrop-blur-sm shadow-sm group-hover:shadow-md transition-all duration-300">
                                                                                <SelectValue placeholder="Выберите тип" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent className="bg-white/90 backdrop-blur-md border-gray-200 rounded-xl shadow-xl">
                                                                            {triggerTypeOptions.map((opt) => (
                                                                                <SelectItem
                                                                                    key={opt.value}
                                                                                    value={opt.value}
                                                                                    className="flex items-center gap-2 py-3 px-2 focus:bg-purple-50 rounded-lg my-1 cursor-pointer"
                                                                                >
                                                                                    <div
                                                                                        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentGradient} flex items-center justify-center text-white transition-colors duration-500`}
                                                                                    >
                                                                                        {opt.icon}
                                                                                    </div>
                                                                                    <span className="font-medium">
                                                                                        {opt.label}
                                                                                    </span>
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage className="text-red-500 text-sm mt-1" />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name="triggerThreshold"
                                                            render={({ field }) => (
                                                                <FormItem className="group">
                                                                    <FormLabel className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-2">
                                                                        <div
                                                                            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentGradient} flex items-center justify-center text-white transition-colors duration-500`}
                                                                        >
                                                                            <TrendingUp className="h-4 w-4" />
                                                                        </div>
                                                                        Порог срабатывания *
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <div className="relative">
                                                                            <Input
                                                                                type="number"
                                                                                placeholder="5"
                                                                                {...field}
                                                                                disabled={isSubmitting}
                                                                                className="h-12 pl-4 pr-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white/80 backdrop-blur-sm shadow-sm group-hover:shadow-md transition-all duration-300"
                                                                            />
                                                                        </div>
                                                                    </FormControl>
                                                                    <FormMessage className="text-red-500 text-sm mt-1" />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>

                                                    <FormField
                                                        control={form.control}
                                                        name="triggerThresholdValue"
                                                        render={({ field }) => (
                                                            <FormItem className="group">
                                                                <FormLabel className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-2">
                                                                    <div
                                                                        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentGradient} flex items-center justify-center text-white transition-colors duration-500`}
                                                                    >
                                                                        <Layers className="h-4 w-4" />
                                                                    </div>
                                                                    Значение для порога (если применимо)
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <div className="relative">
                                                                        <Input
                                                                            placeholder="ID курса, ключ события, название категории..."
                                                                            {...field}
                                                                            value={field.value ?? ''}
                                                                            disabled={isSubmitting}
                                                                            className="h-12 pl-4 pr-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white/80 backdrop-blur-sm shadow-sm group-hover:shadow-md transition-all duration-300"
                                                                        />
                                                                    </div>
                                                                </FormControl>
                                                                <FormDescription className="text-gray-500 text-sm mt-2">
                                                                    Например, ID курса для `SPECIFIC_COURSE_COMPLETED`
                                                                    или название категории для
                                                                    `CATEGORY_COURSES_COMPLETED`.
                                                                </FormDescription>
                                                                <FormMessage className="text-red-500 text-sm mt-1" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            {/* Reward and Display Section */}
                                            <div className={activeSection === 'reward' ? 'block' : 'hidden'}>
                                                <div className="relative mb-10">
                                                    <h3
                                                        className={`inline-block text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${currentGradient} transition-colors duration-500`}
                                                    >
                                                        Награда и отображение
                                                    </h3>
                                                    <div
                                                        className={`absolute -bottom-3 left-0 w-20 h-1 bg-gradient-to-r ${currentGradient} rounded-full transition-colors duration-500`}
                                                    ></div>
                                                </div>

                                                <div className="space-y-8">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                        <FormField
                                                            control={form.control}
                                                            name="xpBonus"
                                                            render={({ field }) => (
                                                                <FormItem className="group">
                                                                    <FormLabel className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-2">
                                                                        <div
                                                                            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentGradient} flex items-center justify-center text-white transition-colors duration-500`}
                                                                        >
                                                                            <Sparkles className="h-4 w-4" />
                                                                        </div>
                                                                        XP Бонус
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <div className="relative">
                                                                            <Input
                                                                                type="number"
                                                                                placeholder="100"
                                                                                {...field}
                                                                                disabled={isSubmitting}
                                                                                className="h-12 pl-4 pr-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white/80 backdrop-blur-sm shadow-sm group-hover:shadow-md transition-all duration-300"
                                                                            />
                                                                        </div>
                                                                    </FormControl>
                                                                    <FormMessage className="text-red-500 text-sm mt-1" />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name="rarity"
                                                            render={({ field }) => (
                                                                <FormItem className="group">
                                                                    <FormLabel className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-2">
                                                                        <div
                                                                            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentGradient} flex items-center justify-center text-white transition-colors duration-500`}
                                                                        >
                                                                            <Crown className="h-4 w-4" />
                                                                        </div>
                                                                        Редкость
                                                                    </FormLabel>
                                                                    <Select
                                                                        onValueChange={field.onChange}
                                                                        defaultValue={field.value}
                                                                        disabled={isSubmitting}
                                                                    >
                                                                        <FormControl>
                                                                            <SelectTrigger className="h-12 pl-4 pr-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white/80 backdrop-blur-sm shadow-sm group-hover:shadow-md transition-all duration-300">
                                                                                <SelectValue placeholder="Выберите редкость" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent className="bg-white/90 backdrop-blur-md border-gray-200 rounded-xl shadow-xl">
                                                                            {rarityOptions.map((opt) => (
                                                                                <SelectItem
                                                                                    key={opt.value}
                                                                                    value={opt.value}
                                                                                    className="flex items-center gap-2 py-3 px-2 focus:bg-purple-50 rounded-lg my-1 cursor-pointer"
                                                                                >
                                                                                    <div
                                                                                        className={`w-8 h-8 rounded-lg ${opt.bgColor} flex items-center justify-center text-white`}
                                                                                    >
                                                                                        {opt.icon}
                                                                                    </div>
                                                                                    <span
                                                                                        className={`font-medium ${opt.color}`}
                                                                                    >
                                                                                        {opt.label}
                                                                                    </span>
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage className="text-red-500 text-sm mt-1" />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name="order"
                                                            render={({ field }) => (
                                                                <FormItem className="group">
                                                                    <FormLabel className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-2">
                                                                        <div
                                                                            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentGradient} flex items-center justify-center text-white transition-colors duration-500`}
                                                                        >
                                                                            <Layers className="h-4 w-4" />
                                                                        </div>
                                                                        Порядок отображения
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <div className="relative">
                                                                            <Input
                                                                                type="number"
                                                                                placeholder="0"
                                                                                {...field}
                                                                                disabled={isSubmitting}
                                                                                className="h-12 pl-4 pr-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white/80 backdrop-blur-sm shadow-sm group-hover:shadow-md transition-all duration-300"
                                                                            />
                                                                        </div>
                                                                    </FormControl>
                                                                    <FormMessage className="text-red-500 text-sm mt-1" />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>

                                                    <FormField
                                                        control={form.control}
                                                        name="category"
                                                        render={({ field }) => (
                                                            <FormItem className="group">
                                                                <FormLabel className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-2">
                                                                    <div
                                                                        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentGradient} flex items-center justify-center text-white transition-colors duration-500`}
                                                                    >
                                                                        <Layers className="h-4 w-4" />
                                                                    </div>
                                                                    Категория
                                                                </FormLabel>
                                                                <Select
                                                                    onValueChange={field.onChange}
                                                                    value={field.value ?? ''}
                                                                    disabled={isSubmitting || isLoadingCategories}
                                                                >
                                                                    <FormControl>
                                                                        <SelectTrigger className="h-12 pl-4 pr-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white/80 backdrop-blur-sm shadow-sm group-hover:shadow-md transition-all duration-300">
                                                                            <SelectValue
                                                                                placeholder={
                                                                                    isLoadingCategories
                                                                                        ? 'Загрузка...'
                                                                                        : 'Выберите или введите новую'
                                                                                }
                                                                            />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent className="bg-white/90 backdrop-blur-md border-gray-200 rounded-xl shadow-xl">
                                                                        {availableCategories.map((cat) => (
                                                                            <SelectItem
                                                                                key={cat}
                                                                                value={cat}
                                                                                className="py-2 px-2 focus:bg-purple-50 rounded-lg my-1 cursor-pointer"
                                                                            >
                                                                                {cat}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <div className="mt-3">
                                                                    <Input
                                                                        placeholder="Или введите новую категорию"
                                                                        onChange={(e) => field.onChange(e.target.value)}
                                                                        value={field.value ?? ''}
                                                                        className="h-12 pl-4 pr-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white/80 backdrop-blur-sm shadow-sm group-hover:shadow-md transition-all duration-300"
                                                                        disabled={isSubmitting}
                                                                    />
                                                                </div>
                                                                <FormDescription className="text-gray-500 text-sm mt-2">
                                                                    Выберите существующую или введите новую. Пустое
                                                                    значение - без категории.
                                                                </FormDescription>
                                                                <FormMessage className="text-red-500 text-sm mt-1" />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                                        <FormField
                                                            control={form.control}
                                                            name="isGlobal"
                                                            render={({ field }) => (
                                                                <FormItem className="flex items-start gap-4 p-4 rounded-xl bg-white/80 backdrop-blur-sm border-2 border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group">
                                                                    <div
                                                                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentGradient} flex items-center justify-center text-white shrink-0 transition-colors duration-500`}
                                                                    >
                                                                        <Globe className="h-6 w-6" />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center justify-between">
                                                                            <FormLabel className="text-lg font-medium text-gray-700">
                                                                                Глобальное
                                                                            </FormLabel>
                                                                            <FormControl>
                                                                                <div className="relative">
                                                                                    <Checkbox
                                                                                        checked={field.value}
                                                                                        onCheckedChange={field.onChange}
                                                                                        disabled={isSubmitting}
                                                                                        className={`h-6 w-6 rounded-md border-2 border-${getRarityColor(currentRarity).replace('text-', '')}/30 data-[state=checked]:bg-gradient-to-r data-[state=checked]:${currentGradient} data-[state=checked]:border-0 focus:ring-${getRarityColor(currentRarity).replace('text-', '')} transition-colors duration-500`}
                                                                                    />
                                                                                </div>
                                                                            </FormControl>
                                                                        </div>
                                                                        <FormDescription className="text-gray-500 text-sm mt-1">
                                                                            Доступно всем пользователям.
                                                                        </FormDescription>
                                                                    </div>
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name="isHidden"
                                                            render={({ field }) => (
                                                                <FormItem className="flex items-start gap-4 p-4 rounded-xl bg-white/80 backdrop-blur-sm border-2 border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group">
                                                                    <div
                                                                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentGradient} flex items-center justify-center text-white shrink-0 transition-colors duration-500`}
                                                                    >
                                                                        {field.value ? (
                                                                            <EyeOff className="h-6 w-6" />
                                                                        ) : (
                                                                            <Eye className="h-6 w-6" />
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center justify-between">
                                                                            <FormLabel className="text-lg font-medium text-gray-700">
                                                                                Скрытое
                                                                            </FormLabel>
                                                                            <FormControl>
                                                                                <div className="relative">
                                                                                    <Checkbox
                                                                                        checked={field.value}
                                                                                        onCheckedChange={field.onChange}
                                                                                        disabled={isSubmitting}
                                                                                        className={`h-6 w-6 rounded-md border-2 border-${getRarityColor(currentRarity).replace('text-', '')}/30 data-[state=checked]:bg-gradient-to-r data-[state=checked]:${currentGradient} data-[state=checked]:border-0 focus:ring-${getRarityColor(currentRarity).replace('text-', '')} transition-colors duration-500`}
                                                                                    />
                                                                                </div>
                                                                            </FormControl>
                                                                        </div>
                                                                        <FormDescription className="text-gray-500 text-sm mt-1">
                                                                            Не отображается в общем списке.
                                                                        </FormDescription>
                                                                    </div>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Prerequisites Section */}
                                            <div className={activeSection === 'prerequisites' ? 'block' : 'hidden'}>
                                                <div className="relative mb-10">
                                                    <h3
                                                        className={`inline-block text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${currentGradient} transition-colors duration-500`}
                                                    >
                                                        Предусловия (ключи достижений)
                                                    </h3>
                                                    <div
                                                        className={`absolute -bottom-3 left-0 w-20 h-1 bg-gradient-to-r ${currentGradient} rounded-full transition-colors duration-500`}
                                                    ></div>
                                                </div>

                                                <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                                                    <FormDescription className="text-gray-500 text-base mb-6">
                                                        Список ключей других достижений, которые должны быть получены
                                                        перед этим.
                                                    </FormDescription>

                                                    <div className="space-y-4">
                                                        {prerequisiteFields.map((item, index) => (
                                                            <div key={item.id} className="flex items-center gap-3">
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`prerequisites.${index}`}
                                                                    render={({ field }) => (
                                                                        <FormItem className="flex-grow">
                                                                            <FormControl>
                                                                                <div className="relative">
                                                                                    <Key
                                                                                        className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${getRarityColor(currentRarity)} h-5 w-5 transition-colors duration-500`}
                                                                                    />
                                                                                    <Input
                                                                                        placeholder="Ключ предусловия"
                                                                                        {...field}
                                                                                        disabled={isSubmitting}
                                                                                        className="h-12 pl-12 pr-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
                                                                                    />
                                                                                </div>
                                                                            </FormControl>
                                                                            <FormMessage className="text-red-500 text-sm mt-1" />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => removePrerequisite(index)}
                                                                    disabled={isSubmitting}
                                                                    className="h-12 w-12 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 border-2 border-red-200 hover:border-red-300 transition-all duration-300"
                                                                >
                                                                    <Trash2 className="h-5 w-5" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => appendPrerequisite('')}
                                                        disabled={isSubmitting}
                                                        className={`mt-6 h-12 px-6 rounded-xl bg-gradient-to-r ${currentLightGradient} hover:from-${getRarityColor(currentRarity).replace('text-', '')}/20 hover:to-${getRarityColor(currentRarity).replace('text-', '')}/20 ${getRarityColor(currentRarity)} border-2 border-${getRarityColor(currentRarity).replace('text-', '')}/20 hover:border-${getRarityColor(currentRarity).replace('text-', '')}/30 shadow-sm hover:shadow-md transition-all duration-500`}
                                                    >
                                                        <PlusCircle className="mr-2 h-5 w-5" /> Добавить предусловие
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>

                                        <CardFooter
                                            className={`p-8 bg-gradient-to-r ${currentLightGradient} border-t border-gray-200 transition-colors duration-500`}
                                        >
                                            <div className="w-full flex justify-between items-center">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        const currentIndex = sections.findIndex(
                                                            (s) => s.id === activeSection
                                                        );
                                                        const prevSection = sections[currentIndex - 1];
                                                        if (prevSection) {
                                                            setActiveSection(prevSection.id);
                                                        }
                                                    }}
                                                    disabled={activeSection === sections[0].id || isSubmitting}
                                                    className="h-12 px-6 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-300"
                                                >
                                                    <ArrowLeft className="mr-2 h-5 w-5" /> Назад
                                                </Button>

                                                {activeSection === sections[sections.length - 1].id ? (
                                                    <Button
                                                        type="submit"
                                                        disabled={isSubmitting}
                                                        className={`h-12 px-8 rounded-xl bg-gradient-to-r ${currentGradient} hover:${currentGradientHover} text-white shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1`}
                                                    >
                                                        {isSubmitting && (
                                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                        )}
                                                        {isEditMode ? 'Сохранить изменения' : 'Создать достижение'}
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        onClick={() => {
                                                            const currentIndex = sections.findIndex(
                                                                (s) => s.id === activeSection
                                                            );
                                                            const nextSection = sections[currentIndex + 1];
                                                            if (nextSection) {
                                                                setActiveSection(nextSection.id);
                                                            }
                                                        }}
                                                        className={`h-12 px-8 rounded-xl bg-gradient-to-r ${currentGradient} hover:${currentGradientHover} text-white shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1`}
                                                    >
                                                        Далее
                                                    </Button>
                                                )}
                                            </div>
                                        </CardFooter>
                                    </form>
                                </Form>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AchievementForm;
