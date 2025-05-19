import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { ArrowLeft, Loader2, PlusCircle, Trash2 } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { usePermissions } from '@/hooks/use-permissions';
import { adminApiClient } from '@/server/admin-api-client';
import { AchievementRarity, AchievementTriggerType } from '@/types/achievements';
import { AdminAchievementDTO, AdminCreateAchievementDTO, AdminUpdateAchievementDTO } from '@/types/achievementsAdmin';

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
        }
    }, [initialData, form.reset]);

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

    const rarityOptions = Object.values(AchievementRarity).map((rarity) => ({
        value: rarity,
        label: rarity.charAt(0) + rarity.slice(1).toLowerCase(),
    }));

    const triggerTypeOptions = Object.values(AchievementTriggerType).map((type) => ({
        value: type,
        label: type
            .replace(/_/g, ' ')
            .split(' ')
            .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
            .join(' '),
    }));

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>{isEditMode ? 'Редактировать Достижение' : 'Создать Новое Достижение'}</CardTitle>
                        <CardDescription>
                            {isEditMode
                                ? `Изменение данных для "${initialData?.name}"`
                                : 'Заполните детали нового достижения.'}
                        </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => router.push('/admin/achievements')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Назад к списку
                    </Button>
                </div>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="key"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Уникальный ключ *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="first-course-completed"
                                                {...field}
                                                disabled={isSubmitting || isEditMode}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Латиница, цифры, дефисы. Не меняется после создания.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Название *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Первопроходец" {...field} disabled={isSubmitting} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Описание *</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Завершите свой первый курс на платформе"
                                            {...field}
                                            disabled={isSubmitting}
                                            rows={3}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="iconUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL иконки *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="https://example.com/icon.png"
                                            {...field}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Separator />
                        <h3 className="text-lg font-medium">Условия получения</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="triggerType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Тип триггера *</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={isSubmitting}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Выберите тип" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {triggerTypeOptions.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="triggerThreshold"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Порог срабатывания *</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="5" {...field} disabled={isSubmitting} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="triggerThresholdValue"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Значение для порога (если применимо)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="ID курса, ключ события, название категории..."
                                            {...field}
                                            value={field.value ?? ''}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Например, ID курса для `SPECIFIC_COURSE_COMPLETED` или название категории для
                                        `CATEGORY_COURSES_COMPLETED`.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Separator />
                        <h3 className="text-lg font-medium">Награда и отображение</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <FormField
                                control={form.control}
                                name="xpBonus"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>XP Бонус</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="100" {...field} disabled={isSubmitting} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="rarity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Редкость</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={isSubmitting}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Выберите редкость" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {rarityOptions.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="order"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Порядок отображения</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="0" {...field} disabled={isSubmitting} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Категория</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value ?? ''}
                                        disabled={isSubmitting || isLoadingCategories}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue
                                                    placeholder={
                                                        isLoadingCategories
                                                            ? 'Загрузка...'
                                                            : 'Выберите или введите новую'
                                                    }
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {availableCategories.map((cat) => (
                                                <SelectItem key={cat} value={cat}>
                                                    {cat}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        placeholder="Или введите новую категорию"
                                        onChange={(e) => field.onChange(e.target.value)}
                                        value={field.value ?? ''}
                                        className="mt-2"
                                        disabled={isSubmitting}
                                    />
                                    <FormDescription>
                                        Выберите существующую или введите новую. Пустое значение - без категории.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex items-center space-x-4">
                            <FormField
                                control={form.control}
                                name="isGlobal"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 shadow-sm">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Глобальное</FormLabel>
                                            <FormDescription>Доступно всем пользователям.</FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="isHidden"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 shadow-sm">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Скрытое</FormLabel>
                                            <FormDescription>Не отображается в общем списке.</FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Separator />
                        <div>
                            <FormLabel className="text-lg font-medium">Предусловия (ключи достижений)</FormLabel>
                            <FormDescription className="mb-2">
                                Список ключей других достижений, которые должны быть получены перед этим.
                            </FormDescription>
                            {prerequisiteFields.map((item, index) => (
                                <div key={item.id} className="flex items-center gap-2 mb-2">
                                    <FormField
                                        control={form.control}
                                        name={`prerequisites.${index}`}
                                        render={({ field }) => (
                                            <FormItem className="flex-grow">
                                                <FormControl>
                                                    <Input
                                                        placeholder="Ключ предусловия"
                                                        {...field}
                                                        disabled={isSubmitting}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removePrerequisite(index)}
                                        disabled={isSubmitting}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => appendPrerequisite('')}
                                disabled={isSubmitting}
                                className="mt-2"
                            >
                                <PlusCircle className="mr-2 h-4 w-4" /> Добавить предусловие
                            </Button>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditMode ? 'Сохранить изменения' : 'Создать достижение'}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
};

export default AchievementForm;
