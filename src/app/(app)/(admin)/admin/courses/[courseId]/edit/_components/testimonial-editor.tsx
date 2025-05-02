'use client';

import { useState } from 'react';

import { Loader2, Trash2 } from 'lucide-react';
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
        <div className="space-y-4 rounded-md border border-border/50 p-4 bg-card shadow-inner">
            <FormLabel className="text-base font-semibold block mb-2">Отзыв (Testimonial)</FormLabel>
            <div className="grid grid-cols-1 gap-6">
                <FormField
                    control={control}
                    name="testimonial.quote"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs">Цитата *</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Текст отзыва..."
                                    className="min-h-[100px]"
                                    {...field}
                                    value={field.value ?? ''}
                                    disabled={disabled}
                                />
                            </FormControl>
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
                                <FormLabel className="text-xs">Имя автора *</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Иван Иванов"
                                        {...field}
                                        value={field.value ?? ''}
                                        disabled={disabled}
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
                                <FormLabel className="text-xs">Должность автора *</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Студент курса"
                                        {...field}
                                        value={field.value ?? ''}
                                        disabled={disabled}
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
                            <FormLabel className="text-xs">Аватар автора</FormLabel>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16 border">
                                    {avatarField.value ? (
                                        <AvatarImage src={avatarField.value} alt="Аватар автора отзыва" />
                                    ) : null}
                                    <AvatarFallback>
                                        {/* Можно использовать инициалы из testimonial.authorName */}?
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-2">
                                    <FormControl>
                                        <Input
                                            type="file"
                                            accept="image/png, image/jpeg, image/webp"
                                            onChange={(e) => onAvatarFileChange(e, avatarField.onChange)}
                                            disabled={disabled || isUploadingAvatar}
                                        />
                                    </FormControl>
                                    {avatarField.value && (
                                        <Button
                                            type="button"
                                            variant="link"
                                            size="sm"
                                            className="text-xs text-destructive p-0 h-auto"
                                            onClick={() => avatarField.onChange(null)}
                                            disabled={disabled || isUploadingAvatar}
                                        >
                                            <Trash2 className="h-3 w-3 mr-1" /> Удалить аватар
                                        </Button>
                                    )}
                                </div>
                                {isUploadingAvatar && (
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                )}
                            </div>
                            <FormDescription className="text-xs mt-1">
                                Загрузите изображение для аватара.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
};

export default TestimonialEditor;
