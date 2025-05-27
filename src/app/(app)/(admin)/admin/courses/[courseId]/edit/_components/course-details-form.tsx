'use client';

import React, { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { motion } from 'framer-motion';
import { Award, BookOpen, Check, ImageIcon, Loader2, Sparkles, Star, Target, Users, Video, X } from 'lucide-react';
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

const getDifficultyColor = (difficulty: CourseDifficultyLevels) => {
    switch (difficulty) {
        case CourseDifficultyLevels.BEGINNER:
            return 'from-emerald-500 to-teal-500';
        case CourseDifficultyLevels.INTERMEDIATE:
            return 'from-amber-500 to-orange-500';
        case CourseDifficultyLevels.ADVANCED:
            return 'from-rose-500 to-pink-500';
        default:
            return 'from-slate-500 to-gray-500';
    }
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
                <div className="mt-3 flex items-center justify-center aspect-video w-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-dashed border-slate-300 text-slate-400">
                    <div className="text-center">
                        {type === 'image' ? (
                            <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                        ) : (
                            <Video className="h-8 w-8 mx-auto mb-2" />
                        )}
                        <p className="text-sm">Нет превью</p>
                    </div>
                </div>
            );
        }
        if (type === 'image') {
            return (
                <div className="mt-3 relative group">
                    <Image
                        src={url || '/placeholder.svg'}
                        alt="Превью изображения"
                        width={508}
                        height={286}
                        className="rounded-xl object-cover w-full aspect-video border shadow-md group-hover:shadow-lg transition-shadow duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-colors duration-300"></div>
                </div>
            );
        }
        if (type === 'video') {
            return (
                <div className="mt-3 p-4 border rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-violet-100 rounded-lg">
                            <Video className="h-5 w-5 text-violet-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-violet-700">Видео превью загружено</p>
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-violet-500 hover:text-violet-700 truncate block transition-colors"
                            >
                                {url}
                            </a>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <motion.div
                        className="space-y-6 p-6 rounded-2xl bg-gradient-to-br from-white/80 to-slate-50/80 backdrop-blur-sm border border-white/50 shadow-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg blur opacity-75"></div>
                                <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-2">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                Основная информация
                            </h3>
                        </div>

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-700 font-medium">Название курса *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Например, Введение в React"
                                            {...field}
                                            disabled={isSubmitting}
                                            className="bg-white/80 backdrop-blur-sm border-white/50 focus:border-primary/50 focus:ring-primary/20"
                                        />
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
                                    <FormLabel className="text-slate-700 font-medium">Описание</FormLabel>
                                    <FormControl>
                                        <div className="bg-white/80 backdrop-blur-sm rounded-lg border w-full border-white/50">
                                            <RichTextEditor
                                                value={field.value ?? ''}
                                                onChange={field.onChange}
                                                disabled={isSubmitting}
                                                editorClassName="min-h-[120px] max-h-[400px] overflow-y-auto w-full"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormDescription className="text-slate-500">
                                        Краткое описание содержания курса.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </motion.div>

                    <motion.div
                        className="space-y-6 p-6 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-teal-50/80 backdrop-blur-sm border border-emerald-200/50 shadow-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-lg blur opacity-75"></div>
                                <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-2">
                                    <Target className="h-5 w-5 text-emerald-600" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                Ценообразование
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-emerald-700 font-medium">Цена ($) *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                inputMode="decimal"
                                                placeholder="49.99"
                                                {...field}
                                                disabled={isSubmitting || formIsFree}
                                                className="bg-white/80 backdrop-blur-sm border-emerald-200/50 focus:border-emerald-500/50 focus:ring-emerald-500/20 pl-2 rounded-t-sm"
                                            />
                                        </FormControl>
                                        <FormDescription className="text-emerald-600">Стоимость курса</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="discount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-emerald-700 font-medium">Скидка ($)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                inputMode="decimal"
                                                placeholder="0.00"
                                                {...field}
                                                value={field.value ?? 0}
                                                disabled={isSubmitting || formIsFree}
                                                className="bg-white/80 backdrop-blur-sm border-emerald-200/50 focus:border-emerald-500/50 focus:ring-emerald-500/20 pl-2 rounded-t-sm"
                                            />
                                        </FormControl>
                                        <FormDescription className="text-emerald-600">Сумма скидки</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isFree"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col justify-center">
                                        <div className="flex items-center space-x-3 p-4 rounded-lg bg-white/60 backdrop-blur-sm border border-emerald-200/50">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value ?? false}
                                                    onCheckedChange={field.onChange}
                                                    disabled={isSubmitting}
                                                    className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                                />
                                            </FormControl>
                                            <div className="space-y-1">
                                                <FormLabel className="text-emerald-700 font-medium cursor-pointer">
                                                    Бесплатный курс
                                                </FormLabel>
                                                <FormDescription className="text-emerald-600 text-xs">
                                                    Курс будет доступен бесплатно
                                                </FormDescription>
                                            </div>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </motion.div>

                    <motion.div
                        className="space-y-6 p-6 rounded-2xl bg-gradient-to-br from-amber-50/80 to-orange-50/80 backdrop-blur-sm border border-amber-200/50 shadow-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-lg blur opacity-75"></div>
                                <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-2">
                                    <Award className="h-5 w-5 text-amber-600" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                Детали курса
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField
                                control={form.control}
                                name="difficulty"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-amber-700 font-medium">
                                            Уровень сложности *
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={isSubmitting}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-white/80 backdrop-blur-sm border-amber-200/50 focus:border-amber-500/50 focus:ring-amber-500/20">
                                                    <SelectValue placeholder="Выберите..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-white/90 backdrop-blur-lg border border-amber-200/50">
                                                {Object.values(CourseDifficultyLevels).map((level) => (
                                                    <SelectItem key={level} value={level} className="hover:bg-amber-50">
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className={`w-3 h-3 rounded-full bg-gradient-to-r ${getDifficultyColor(level)}`}
                                                            ></div>
                                                            {difficultyLabels[level]}
                                                        </div>
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
                                        <FormLabel className="text-amber-700 font-medium">Категория</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Например, Веб-разработка"
                                                {...field}
                                                value={field.value ?? ''}
                                                disabled={isSubmitting}
                                                className="bg-white/80 backdrop-blur-sm border-amber-200/50 focus:border-amber-500/50 focus:ring-amber-500/20 pl-2 rounded-t-sm"
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
                                        <FormLabel className="text-amber-700 font-medium">Автор *</FormLabel>
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
                                                <SelectTrigger className="bg-white/80 backdrop-blur-sm border-amber-200/50 focus:border-amber-500/50 focus:ring-amber-500/20">
                                                    <SelectValue
                                                        placeholder={isLoadingAuthors ? 'Загрузка...' : 'Выберите...'}
                                                    />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-white/90 backdrop-blur-lg border border-amber-200/50">
                                                {isLoadingAuthors ? (
                                                    <div className="flex items-center justify-center p-2">
                                                        <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                                                    </div>
                                                ) : authors.length > 0 ? (
                                                    authors.map((author) => (
                                                        <SelectItem
                                                            key={author.id}
                                                            value={author.id!}
                                                            className="hover:bg-amber-50"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Users className="h-4 w-4 text-amber-600" />
                                                                {author.username}{' '}
                                                                {author.email ? `(${author.email})` : ''}
                                                            </div>
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
                                            <FormDescription className="text-xs text-amber-600">
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
                    </motion.div>

                    <motion.div
                        className="space-y-6 p-6 rounded-2xl bg-gradient-to-br from-violet-50/80 to-purple-50/80 backdrop-blur-sm border border-violet-200/50 shadow-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-lg blur opacity-75"></div>
                                <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-2">
                                    <Sparkles className="h-5 w-5 text-violet-600" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                                Медиа превью
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormField
                                control={form.control}
                                name="imagePreview"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-violet-700 font-medium">
                                            Превью изображение
                                        </FormLabel>
                                        {renderPreview(field.value, 'image')}
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type="file"
                                                    accept="image/png, image/jpeg, image/webp"
                                                    onChange={(e) =>
                                                        onFileChange(e, 'image', setIsUploadingImage, 'imagePreview')
                                                    }
                                                    disabled={isSubmitting || isUploadingImage}
                                                    className="bg-white/80 backdrop-blur-sm border-violet-200/50 focus:border-violet-500/50 focus:ring-violet-500/20 file:bg-violet-100 file:text-violet-700 file:border-0 file:rounded-md file:mr-4"
                                                />
                                                {isUploadingImage && (
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                        <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
                                                    </div>
                                                )}
                                            </div>
                                        </FormControl>
                                        {field.value && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs text-red-500 hover:text-red-700 p-0 h-auto"
                                                onClick={() => field.onChange(null)}
                                                type="button"
                                            >
                                                <X className="h-3 w-3 mr-1" />
                                                Удалить изображение
                                            </Button>
                                        )}
                                        <FormDescription className="text-violet-600">
                                            Рекомендуемый размер: 1920x1080 (16:9)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="videoPreview"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-violet-700 font-medium">Превью видео</FormLabel>
                                        {renderPreview(field.value, 'video')}
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type="file"
                                                    accept="video/mp4, video/webm"
                                                    onChange={(e) =>
                                                        onFileChange(e, 'video', setIsUploadingVideo, 'videoPreview')
                                                    }
                                                    disabled={isSubmitting || isUploadingVideo}
                                                    className="bg-white/80 backdrop-blur-sm border-violet-200/50 focus:border-violet-500/50 focus:ring-violet-500/20 file:bg-violet-100 file:text-violet-700 file:border-0 file:rounded-md file:mr-4"
                                                />
                                                {isUploadingVideo && (
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                        <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
                                                    </div>
                                                )}
                                            </div>
                                        </FormControl>
                                        {field.value && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs text-red-500 hover:text-red-700 p-0 h-auto"
                                                onClick={() => field.onChange(null)}
                                                type="button"
                                            >
                                                <X className="h-3 w-3 mr-1" />
                                                Удалить видео
                                            </Button>
                                        )}
                                        <FormDescription className="text-violet-600">
                                            Короткое видео для демонстрации курса
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <Accordion type="multiple" className="w-full space-y-4">
                            <AccordionItem
                                value="features-section"
                                className="border-0 bg-gradient-to-br from-blue-50/80 to-cyan-50/80 backdrop-blur-sm rounded-2xl border-blue-200/50 shadow-lg overflow-hidden"
                            >
                                <AccordionTrigger className="text-lg font-medium hover:no-underline px-6 py-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg blur opacity-75"></div>
                                            <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-2">
                                                <Star className="h-5 w-5 text-blue-600" />
                                            </div>
                                        </div>
                                        <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                            Секция "Ключевые темы"
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-6 space-y-6 pt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="featuresBadge"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-blue-700 font-medium">
                                                        Текст значка
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Например, Новинка"
                                                            {...field}
                                                            value={field.value ?? ''}
                                                            disabled={isSubmitting}
                                                            className="bg-white/80 backdrop-blur-sm border-blue-200/50 focus:border-blue-500/50 focus:ring-blue-500/20 rounded-t-sm pl-2"
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
                                                    <FormLabel className="text-blue-700 font-medium">
                                                        Заголовок секции
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Что вы изучите"
                                                            {...field}
                                                            value={field.value ?? ''}
                                                            disabled={isSubmitting}
                                                            className="bg-white/80 backdrop-blur-sm border-blue-200/50 focus:border-blue-500/50 focus:ring-blue-500/20 rounded-t-sm pl-2"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="featuresSubtitle"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-blue-700 font-medium">
                                                    Подзаголовок секции
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Краткое описание"
                                                        {...field}
                                                        value={field.value ?? ''}
                                                        disabled={isSubmitting}
                                                        className="bg-white/80 backdrop-blur-sm border-blue-200/50 focus:border-blue-500/50 focus:ring-blue-500/20 rounded-t-sm pl-2"
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
                                                <FormLabel className="text-blue-700 font-medium">
                                                    Описание секции
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Подробное описание того, что будет в курсе..."
                                                        className="min-h-[100px] bg-white/80 backdrop-blur-sm border-blue-200/50 focus:border-blue-500/50 focus:ring-blue-500/20"
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
                            <AccordionItem
                                value="benefits-section"
                                className="bg-gradient-to-br from-green-50/80 to-emerald-50/80 backdrop-blur-sm rounded-2xl border-green-200/50 shadow-lg overflow-hidden"
                            >
                                <AccordionTrigger className="text-lg font-medium hover:no-underline px-6 py-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg blur opacity-75"></div>
                                            <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-2">
                                                <Target className="h-5 w-5 text-green-600" />
                                            </div>
                                        </div>
                                        <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                            Секция "Преимущества"
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-6 space-y-6 pt-4">
                                    <FormField
                                        control={form.control}
                                        name="benefitTitle"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-green-700 font-medium">
                                                    Заголовок преимуществ
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Почему этот курс?"
                                                        {...field}
                                                        value={field.value ?? ''}
                                                        disabled={isSubmitting}
                                                        className="bg-white/80 backdrop-blur-sm border-green-200/50 focus:border-green-500/50 focus:ring-green-500/20 rounded-t-sm pl-2"
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
                                                <FormLabel className="text-green-700 font-medium">
                                                    Описание преимуществ
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Расскажите о пользе курса..."
                                                        className="min-h-[100px] bg-white/80 backdrop-blur-sm border-green-200/50 focus:border-green-500/50 focus:ring-green-500/20"
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
                            <AccordionItem
                                value="testimonial-section"
                                className="border-0 bg-gradient-to-br from-rose-50/80 to-pink-50/80 backdrop-blur-sm rounded-2xl border-rose-200/50 shadow-lg overflow-hidden"
                            >
                                <AccordionTrigger className="text-lg font-medium hover:no-underline px-6 py-4 bg-gradient-to-r from-rose-500/10 to-pink-500/10">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-pink-500/20 rounded-lg blur opacity-75"></div>
                                            <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-2">
                                                <Users className="h-5 w-5 text-rose-600" />
                                            </div>
                                        </div>
                                        <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                                            Секция "Отзыв"
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-6 pt-4">
                                    <TestimonialEditor control={form.control} disabled={isSubmitting} />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </motion.div>

                    <motion.div
                        className="flex justify-end pt-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <Button
                            type="submit"
                            disabled={isSubmitting || isUploadingImage || isUploadingVideo}
                            size="lg"
                            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 px-8 py-3"
                        >
                            {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                            {!isSubmitting && <Check className="mr-2 h-5 w-5" />}
                            {isEditing ? 'Сохранить изменения' : 'Создать курс'}
                        </Button>
                    </motion.div>
                </form>
            </Form>
        </div>
    );
}
