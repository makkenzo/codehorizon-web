'use client';

import React, { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import Image from 'next/image';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { adminApiClient } from '@/server/admin-api-client';
import S3ApiClient from '@/server/s3';
import { useUserStore } from '@/stores/user/user-store-provider';
import { CourseDifficultyLevels } from '@/types';
import { AdminCourseDetailDTO, AdminCreateUpdateCourseRequestDTO, AdminUser } from '@/types/admin';

import FeatureEditor from './feature-editor';
import TestimonialEditor from './testimonial-editor';

const featureItemSchema = z.object({
    title: z.string().min(1, 'Заголовок темы обязателен'),
    description: z.string().min(1, 'Описание темы обязательно'),
});

const testimonialSchema = z
    .object({
        quote: z.string().min(1, 'Цитата обязательна'),
        authorName: z.string().min(1, 'Имя автора обязательно'),
        authorTitle: z.string().min(1, 'Должность автора обязательна'),
        avatarSrc: z.string().url('Неверный URL аватара').nullable().optional(),
    })
    .nullable()
    .optional();

const courseDetailsFormSchema = z.object({
    title: z.string().min(3, 'Название должно содержать не менее 3 символов'),
    description: z.string().optional().or(z.literal('')),
    price: z.coerce.number().min(0, 'Цена не может быть отрицательной'),
    discount: z.coerce.number().min(0).optional().default(0),
    isFree: z.boolean().optional().default(false),
    difficulty: z.nativeEnum(CourseDifficultyLevels),
    category: z.string().optional().or(z.literal('')),
    authorId: z.string().min(1, 'Автор обязателен'),
    imagePreview: z.string().nullable().optional(),
    videoPreview: z.string().nullable().optional(),
    featuresBadge: z.string().nullable().optional(),
    featuresTitle: z.string().nullable().optional(),
    featuresSubtitle: z.string().nullable().optional(),
    featuresDescription: z.string().nullable().optional(),
    benefitTitle: z.string().nullable().optional(),
    benefitDescription: z.string().nullable().optional(),
    features: z.array(featureItemSchema).optional().default([]),
    testimonial: testimonialSchema,
});

export type CourseDetailsFormData = z.infer<typeof courseDetailsFormSchema>;

interface CourseDetailsFormProps {
    course?: AdminCourseDetailDTO | null;
    onSuccess: (resultCourse: AdminCourseDetailDTO) => void;
    forcedAuthorId?: string;
}

const difficultyLabels: Record<CourseDifficultyLevels, string> = {
    [CourseDifficultyLevels.BEGINNER]: 'Начинающий',
    [CourseDifficultyLevels.INTERMEDIATE]: 'Средний',
    [CourseDifficultyLevels.ADVANCED]: 'Продвинутый',
};

const defaultValues: Partial<CourseDetailsFormData> = {
    title: '',
    description: '',
    price: 0,
    discount: 0,
    isFree: false,
    difficulty: CourseDifficultyLevels.BEGINNER,
    category: '',
    authorId: '',
    imagePreview: null,
    videoPreview: null,
    featuresBadge: null,
    featuresTitle: null,
    featuresSubtitle: null,
    featuresDescription: null,
    benefitTitle: null,
    benefitDescription: null,
    testimonial: null,
    features: [],
};

export default function CourseDetailsForm({ course, onSuccess, forcedAuthorId }: CourseDetailsFormProps) {
    const { user } = useUserStore((state) => state);
    const isAdmin = user?.roles?.includes('ADMIN') || user?.roles?.includes('ROLE_ADMIN');
    const isCurrentAuthorAndMentorOnly =
        course &&
        user &&
        course.authorId === user.id &&
        (user.roles?.includes('MENTOR') || user.roles?.includes('ROLE_MENTOR')) &&
        !isAdmin;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isUploadingVideo, setIsUploadingVideo] = useState(false);
    const [authors, setAuthors] = useState<AdminUser[]>([]);
    const [isLoadingAuthors, setIsLoadingAuthors] = useState(true);

    const isEditing = !!course;
    const s3ApiClient = new S3ApiClient();

    useEffect(() => {
        const fetchAuthors = async () => {
            setIsLoadingAuthors(true);
            try {
                const authorList = await adminApiClient.getPotentialAuthors();
                setAuthors(authorList);
            } catch (error: unknown) {
                console.error('Failed to fetch authors:', error);

                let errorMsg = 'Unknown error';

                if (isAxiosError(error)) {
                    errorMsg = error?.response?.data?.message || error.message || 'Unknown error';
                } else if (error instanceof Error) {
                    errorMsg = error.message;
                }

                toast.error(`Не удалось загрузить список авторов: ${errorMsg}`);
            } finally {
                setIsLoadingAuthors(false);
            }
        };

        fetchAuthors();
    }, []);

    const form = useForm<CourseDetailsFormData>({
        resolver: zodResolver(courseDetailsFormSchema),
        defaultValues: course
            ? {
                  title: course?.title ?? '',
                  description: course?.description ?? '',
                  price: course?.price ?? 0,
                  discount: course?.discount ?? 0,
                  difficulty: course?.difficulty ?? CourseDifficultyLevels.BEGINNER,
                  category: course?.category ?? '',
                  isFree: course?.isFree ?? false,
                  imagePreview: course?.imagePreview ?? null,
                  videoPreview: course?.videoPreview ?? null,
                  featuresBadge: course.featuresBadge ?? null,
                  featuresTitle: course.featuresTitle ?? null,
                  featuresSubtitle: course.featuresSubtitle ?? null,
                  featuresDescription: course.featuresDescription ?? null,
                  benefitTitle: course.benefitTitle ?? null,
                  benefitDescription: course.benefitDescription ?? null,
                  features: course.features ?? [],
                  testimonial: course.testimonial ?? null,
                  authorId: course?.authorId ?? '',
              }
            : { ...defaultValues, authorId: forcedAuthorId ?? '' },
    });

    const formIsFree = form.watch('isFree');

    useEffect(() => {
        if (course) {
            form.reset({
                ...defaultValues,
                title: course.title ?? '',
                description: course.description ?? '',
                price: course.price ?? 0,
                discount: course.discount ?? 0,
                difficulty: course.difficulty ?? CourseDifficultyLevels.BEGINNER,
                category: course.category ?? '',
                isFree: course.isFree ?? false,
                imagePreview: course.imagePreview ?? null,
                videoPreview: course.videoPreview ?? null,
                featuresBadge: course.featuresBadge ?? null,
                featuresTitle: course.featuresTitle ?? null,
                featuresSubtitle: course.featuresSubtitle ?? null,
                featuresDescription: course.featuresDescription ?? null,
                benefitTitle: course.benefitTitle ?? null,
                benefitDescription: course.benefitDescription ?? null,
                testimonial: course.testimonial ?? null,
                features: course.features ?? [],
                authorId: course.authorId ?? '',
            });
        } else if (forcedAuthorId) {
            form.reset({
                ...defaultValues,
                authorId: forcedAuthorId,
            });
        }
    }, [course, form, forcedAuthorId]);

    const onSubmit = async (values: CourseDetailsFormData) => {
        setIsSubmitting(true);
        try {
            const requestData: AdminCreateUpdateCourseRequestDTO = {
                ...values,
                price: values.isFree ? 0 : values.price,
                discount: values.isFree ? 0 : (values.discount ?? 0),
                description: values.description || null,
                category: values.category || null,
                imagePreview: values.imagePreview,
                videoPreview: values.videoPreview,
                featuresBadge: values.featuresBadge || null,
                featuresTitle: values.featuresTitle || null,
                featuresSubtitle: values.featuresSubtitle || null,
                featuresDescription: values.featuresDescription || null,
                features: values.features,
                benefitTitle: values.benefitTitle || null,
                benefitDescription: values.benefitDescription || null,
                testimonial: values.testimonial,
            };

            let resultCourse: AdminCourseDetailDTO;

            if (isEditing && course) {
                resultCourse = await adminApiClient.updateCourseAdmin(course.id, requestData);
                toast.success(`Курс "${values.title}" обновлен.`);
            } else {
                resultCourse = await adminApiClient.createCourseAdmin(requestData);
                toast.success(`Курс "${values.title}" создан.`);
            }
            onSuccess(resultCourse);
        } catch (error: unknown) {
            console.error(`ОШибка ${isEditing ? 'обновления' : 'создания'} курса:`, error);

            let errorMsg = 'Неизвестная ошибка';

            if (isAxiosError(error)) {
                errorMsg = error?.response?.data?.message || error.message || 'Неизвестная ошибка';
            } else if (error instanceof Error) {
                errorMsg = error.message;
            }

            toast.error(`Не удалось ${isEditing ? 'сохранить' : 'создать'} курс: ${errorMsg}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileUpload = async (
        file: File,
        fileType: 'image' | 'video',
        setLoading: (loading: boolean) => void,
        fieldName: 'imagePreview' | 'videoPreview'
    ) => {
        if (!file) return;
        setLoading(true);
        try {
            const response = await s3ApiClient.uploadFile(file, 'course-previews');
            if (response?.url) {
                form.setValue(fieldName, response.url);
                toast.success(
                    `${fileType === 'image' ? 'Картинка' : 'Видео'} успешно ${fileType === 'image' ? 'загружена' : 'загружено'}!`
                );
            } else {
                throw new Error('Upload failed, URL not received.');
            }
        } catch (error) {
            console.error(`Error uploading ${fileType}:`, error);
            toast.error(`Не удалось загрузить ${fileType}.`);
            form.setValue(fieldName, course?.[fieldName] ?? null);
        } finally {
            setLoading(false);
        }
    };

    const onFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        fileType: 'image' | 'video',
        setLoading: (loading: boolean) => void,
        fieldName: 'imagePreview' | 'videoPreview'
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file, fileType, setLoading, fieldName);
        }
    };

    const renderPreview = (url: string | null | undefined, type: 'image' | 'video') => {
        if (!url) {
            return (
                <div className="mt-2 flex items-center justify-center h-28 w-48 bg-muted rounded-md text-muted-foreground text-xs">
                    Нет превью
                </div>
            );
        }
        if (type === 'image') {
            return (
                <Image
                    src={url}
                    alt="Превью изображения"
                    width={192}
                    height={108}
                    className="rounded-md object-cover mt-2 border"
                />
            );
        }
        if (type === 'video') {
            return (
                <div className="mt-2 p-2 border rounded-md text-sm bg-muted">
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline truncate block"
                    >
                        {url}
                    </a>
                    <span className="text-xs text-muted-foreground">Видео превью загружено</span>
                </div>
            );
        }
        return null;
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Название курса *</FormLabel>
                            <FormControl>
                                <Input placeholder="Например, Введение в React" {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Описание</FormLabel>
                            <FormControl>
                                <RichTextEditor
                                    value={field.value ?? ''}
                                    onChange={field.onChange}
                                    disabled={isSubmitting}
                                    editorClassName="min-h-[100px] max-h-[600px] overflow-y-auto"
                                />
                            </FormControl>
                            <FormDescription>Краткое описание содержания курса.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-6">
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Цена ($) *</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="49.99"
                                        {...field}
                                        disabled={isSubmitting || formIsFree}
                                    />
                                </FormControl>
                                <FormDescription>Сумма</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="discount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Скидка ($)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="0.00"
                                        {...field}
                                        value={field.value ?? 0}
                                        disabled={isSubmitting || formIsFree}
                                    />
                                </FormControl>
                                <FormDescription>Сумма отнимаемая от цены</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="isFree"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Бесплатный курс?</FormLabel>
                                <FormControl>
                                    <Checkbox
                                        checked={field.value ?? false}
                                        onCheckedChange={field.onChange}
                                        disabled={isSubmitting}
                                    />
                                </FormControl>
                                <FormDescription>Если выбрано, цена и скидка не будут учитываться.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="difficulty"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Уровень сложности *</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    disabled={isSubmitting}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Выберите..." />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.values(CourseDifficultyLevels).map((level) => (
                                            <SelectItem key={level} value={level}>
                                                {difficultyLabels[level]}
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
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Категория</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Например, Веб-разработка"
                                        {...field}
                                        value={field.value ?? ''}
                                        disabled={isSubmitting}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="authorId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Автор *</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    disabled={
                                        !!forcedAuthorId ||
                                        (isEditing && isCurrentAuthorAndMentorOnly) ||
                                        isSubmitting ||
                                        isLoadingAuthors
                                    }
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={isLoadingAuthors ? 'Загрузка...' : 'Выберите...'}
                                            />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {isLoadingAuthors ? (
                                            <div className="flex items-center justify-center p-2">
                                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                            </div>
                                        ) : authors.length > 0 ? (
                                            authors.map((author) => (
                                                <SelectItem key={author.id} value={author.id!}>
                                                    {author.username} {author.email ? `(${author.email})` : ''}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="no-authors" disabled>
                                                Нет доступных авторов
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                                {(forcedAuthorId || (isEditing && isCurrentAuthorAndMentorOnly)) && (
                                    <FormDescription className="text-xs text-blue-600">
                                        {forcedAuthorId
                                            ? 'Вы можете создавать курсы только от своего имени.'
                                            : 'Менторы не могут изменять автора курса.'}
                                    </FormDescription>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="pt-6 border-t">
                    <h3 className="text-lg font-medium mb-4">Медиа превью</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="imagePreview"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Превью (Изображение)</FormLabel>
                                    {renderPreview(field.value, 'image')}
                                    <FormControl className="mt-2">
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="file"
                                                accept="image/png, image/jpeg, image/webp"
                                                onChange={(e) =>
                                                    onFileChange(e, 'image', setIsUploadingImage, 'imagePreview')
                                                }
                                                disabled={isSubmitting || isUploadingImage}
                                                className="flex-1"
                                            />
                                            {isUploadingImage && <Loader2 className="h-4 w-4 animate-spin" />}
                                        </div>
                                    </FormControl>
                                    {field.value && (
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="text-xs text-destructive p-0 h-auto mt-1"
                                            onClick={() => field.onChange(null)}
                                            type="button"
                                        >
                                            Удалить изображение
                                        </Button>
                                    )}
                                    <FormDescription>Рекомендуемый размер: 1920x1080 (16:9).</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="videoPreview"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Превью (Видео)</FormLabel>
                                    {renderPreview(field.value, 'video')}
                                    <FormControl className="mt-2">
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="file"
                                                accept="video/mp4, video/webm"
                                                onChange={(e) =>
                                                    onFileChange(e, 'video', setIsUploadingVideo, 'videoPreview')
                                                }
                                                disabled={isSubmitting || isUploadingVideo}
                                                className="flex-1"
                                            />
                                            {isUploadingVideo && <Loader2 className="h-4 w-4 animate-spin" />}
                                        </div>
                                    </FormControl>
                                    {field.value && (
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="text-xs text-destructive p-0 h-auto mt-1"
                                            onClick={() => field.onChange(null)}
                                            type="button"
                                        >
                                            Удалить видео
                                        </Button>
                                    )}
                                    <FormDescription>Короткое видео для демонстрации курса.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <Accordion type="multiple" className="w-full border-t pt-6">
                    <AccordionItem value="features-section" className="border-b-0">
                        <AccordionTrigger className="text-lg font-medium hover:no-underline">
                            Секция &quot;Ключевые темы&quot;
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 space-y-6">
                            <FormField
                                control={form.control}
                                name="featuresBadge"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Текст значка</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Например, Новинка"
                                                {...field}
                                                value={field.value ?? ''}
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="featuresTitle"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Заголовок секции</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Что вы изучите"
                                                {...field}
                                                value={field.value ?? ''}
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="featuresSubtitle"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Подзаголовок секции</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Краткое описание"
                                                {...field}
                                                value={field.value ?? ''}
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="featuresDescription"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Описание секции</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Подробное описание того, что будет в курсе..."
                                                className="min-h-[100px]"
                                                {...field}
                                                value={field.value ?? ''}
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FeatureEditor
                                control={form.control}
                                disabled={isSubmitting}
                                errors={form.formState.errors}
                            />
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="benefits-section" className="border-b-0">
                        <AccordionTrigger className="text-lg font-medium hover:no-underline">
                            Секция &quot;Преимущества&quot;
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 space-y-6">
                            <FormField
                                control={form.control}
                                name="benefitTitle"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Заголовок преимуществ</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Почему этот курс?"
                                                {...field}
                                                value={field.value ?? ''}
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="benefitDescription"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Описание преимуществ</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Расскажите о пользе курса..."
                                                className="min-h-[100px]"
                                                {...field}
                                                value={field.value ?? ''}
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="testimonial-section" className="border-b-0">
                        <AccordionTrigger className="text-lg font-medium hover:no-underline">
                            Секция &quot;Отзыв&quot;
                        </AccordionTrigger>
                        <AccordionContent className="pt-4">
                            <TestimonialEditor control={form.control} disabled={isSubmitting} />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <div className="flex justify-end pt-6 border-t mt-8">
                    <Button type="submit" disabled={isSubmitting || isUploadingImage || isUploadingVideo}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditing ? 'Сохранить изменения' : 'Создать курс'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
