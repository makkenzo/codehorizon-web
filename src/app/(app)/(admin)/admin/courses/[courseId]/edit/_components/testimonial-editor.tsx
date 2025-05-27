'use client';

import { useState } from 'react';

import { motion } from 'framer-motion';
import { Heart, Loader2, Quote, Star, Trash2, Upload, User } from 'lucide-react';
import { Control } from 'react-hook-form';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import S3ApiClient from '@/server/s3';

import { CourseDetailsFormData } from './course-details-form';

interface TestimonialEditorProps {
    control: Control<CourseDetailsFormData>;
    disabled?: boolean;
}

const TestimonialEditor: React.FC<TestimonialEditorProps> = ({ control, disabled }) => {
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const s3ApiClient = new S3ApiClient();

    const handleAvatarUpload = async (file: File, onChange: (value: string | null) => void) => {
        if (!file) return;
        setIsUploadingAvatar(true);
        try {
            const response = await s3ApiClient.uploadFile(file, 'testimonials');
            if (response?.url) {
                onChange(response.url);
                toast.success('Аватар отзыва успешно загружен!');
            } else {
                throw new Error('Ошибка загрузки, URL не получен.');
            }
        } catch (error) {
            console.error('Ошибка загрузки аватара отзыва:', error);
            toast.error('Не удалось загрузить аватар отзыва.');
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const onAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string | null) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            handleAvatarUpload(file, onChange);
        }
    };

    return (
        <motion.div
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-50/80 to-pink-50/80 backdrop-blur-sm border border-rose-200/50 shadow-lg group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-pink-500/5"></div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-rose-500/10 to-pink-500/10 rounded-full blur-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-gradient-to-tr from-pink-500/10 to-rose-500/10 rounded-full blur-2xl opacity-40 group-hover:opacity-80 transition-opacity duration-700"></div>

            <div className="relative z-10 flex items-center gap-3 p-6 bg-gradient-to-r from-rose-500/10 to-pink-500/10 border-b border-rose-200/30">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-pink-500/20 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-2">
                        <Quote className="h-5 w-5 text-rose-600" />
                    </div>
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                        Отзыв студента
                    </h3>
                    <p className="text-sm text-rose-600/70">Добавьте вдохновляющий отзыв о вашем курсе</p>
                </div>
                <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4 text-rose-500" />
                    <Star className="h-4 w-4 text-pink-500" />
                </div>
            </div>

            <div className="relative z-10 p-6 space-y-6">
                <FormField
                    control={control}
                    name="testimonial.quote"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-rose-700 font-medium flex items-center gap-2">
                                <Quote className="h-4 w-4" />
                                Цитата отзыва *
                            </FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Textarea
                                        placeholder="Этот курс полностью изменил мой подход к программированию. Рекомендую всем!"
                                        className="min-h-[120px] bg-white/80 backdrop-blur-sm border-rose-200/50 focus:border-rose-500/50 focus:ring-rose-500/20 pl-8"
                                        {...field}
                                        value={field.value ?? ''}
                                        disabled={disabled}
                                    />
                                    <Quote className="absolute top-3 left-3 h-4 w-4 text-rose-400" />
                                </div>
                            </FormControl>
                            <FormDescription className="text-rose-600/70">
                                Напишите искренний отзыв, который мотивирует будущих студентов
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={control}
                        name="testimonial.authorName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-rose-700 font-medium flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Имя автора *
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Анна Петрова"
                                        {...field}
                                        value={field.value ?? ''}
                                        disabled={disabled}
                                        className="bg-white/80 backdrop-blur-sm border-rose-200/50 focus:border-rose-500/50 focus:ring-rose-500/20 rounded-t-sm pl-2"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="testimonial.authorTitle"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-rose-700 font-medium flex items-center gap-2">
                                    <Star className="h-4 w-4" />
                                    Должность автора *
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Frontend разработчик"
                                        {...field}
                                        value={field.value ?? ''}
                                        disabled={disabled}
                                        className="bg-white/80 backdrop-blur-sm border-rose-200/50 focus:border-rose-500/50 focus:ring-rose-500/20 rounded-t-sm pl-2"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={control}
                    name="testimonial.avatarSrc"
                    render={({ field: avatarField }) => (
                        <FormItem>
                            <FormLabel className="text-rose-700 font-medium flex items-center gap-2">
                                <Upload className="h-4 w-4" />
                                Аватар автора
                            </FormLabel>
                            <div className="flex items-center gap-6">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-pink-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <Avatar className="relative h-20 w-20 border-4 border-white shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                                        {avatarField.value ? (
                                            <AvatarImage
                                                src={avatarField.value || '/placeholder.svg'}
                                                alt="Аватар автора отзыва"
                                                className="object-cover"
                                            />
                                        ) : null}
                                        <AvatarFallback className="bg-gradient-to-br from-rose-100 to-pink-100 text-rose-600 text-lg font-semibold">
                                            <User className="h-8 w-8" />
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="flex-1 space-y-3">
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type="file"
                                                accept="image/png, image/jpeg, image/webp"
                                                onChange={(e) => onAvatarFileChange(e, avatarField.onChange)}
                                                disabled={disabled || isUploadingAvatar}
                                                className="bg-white/80 backdrop-blur-sm border-rose-200/50 focus:border-rose-500/50 focus:ring-rose-500/20 file:bg-rose-100 file:text-rose-700 file:border-0 file:rounded-md file:mr-4"
                                            />
                                            {isUploadingAvatar && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    <Loader2 className="h-4 w-4 animate-spin text-rose-600" />
                                                </div>
                                            )}
                                        </div>
                                    </FormControl>
                                    {avatarField.value && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 p-0 h-auto"
                                            onClick={() => avatarField.onChange(null)}
                                            disabled={disabled || isUploadingAvatar}
                                        >
                                            <Trash2 className="h-3 w-3 mr-1" />
                                            Удалить аватар
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <FormDescription className="text-rose-600/70">
                                Загрузите фотографию автора отзыва для большей достоверности
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                <Quote className="h-16 w-16 text-rose-500 transform rotate-12" />
            </div>
        </motion.div>
    );
};

export default TestimonialEditor;
