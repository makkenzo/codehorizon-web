'use client';

import React, { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { adminApiClient } from '@/server/admin-api-client';
import S3ApiClient from '@/server/s3';
import { CourseDifficultyLevels } from '@/types';
import { AdminCourseDetailDTO, AdminCreateUpdateCourseRequestDTO, AdminUser } from '@/types/admin';

const courseDetailsFormSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional().or(z.literal('')),
    price: z.coerce.number().min(0, 'Price cannot be negative'),
    discount: z.coerce.number().min(0).optional().default(0),
    difficulty: z.nativeEnum(CourseDifficultyLevels),
    category: z.string().optional().or(z.literal('')),
    authorId: z.string().min(1, 'Author is required'),
    imagePreview: z.string().nullable().optional(),
    videoPreview: z.string().nullable().optional(),
});

type CourseDetailsFormData = z.infer<typeof courseDetailsFormSchema>;

interface CourseDetailsFormProps {
    course?: AdminCourseDetailDTO | null;

    onSuccess: (resultCourse: AdminCourseDetailDTO) => void;
}

export default function CourseDetailsForm({ course, onSuccess }: CourseDetailsFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isUploadingVideo, setIsUploadingVideo] = useState(false);
    const [authors, setAuthors] = useState<AdminUser[]>([]);

    const isEditing = !!course;

    const s3ApiClient = new S3ApiClient();

    useEffect(() => {
        const fetchAuthors = async () => {
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

                toast.error(`Could not load authors list: ${errorMsg}`);
            }
        };
        fetchAuthors();
    }, []);

    const form = useForm<CourseDetailsFormData>({
        resolver: zodResolver(courseDetailsFormSchema),
        defaultValues: {
            title: course?.title ?? '',
            description: course?.description ?? '',
            price: course?.price ?? 0,
            discount: course?.discount ?? 0,
            difficulty: course?.difficulty ?? CourseDifficultyLevels.BEGINNER,
            category: course?.category ?? '',
            authorId: course?.authorId ?? '',
            imagePreview: course?.imagePreview ?? '',
            videoPreview: course?.videoPreview ?? '',
        },
    });

    useEffect(() => {
        form.reset({
            title: course?.title ?? '',
            description: course?.description ?? '',
            price: course?.price ?? 0,
            discount: course?.discount ?? 0,
            difficulty: course?.difficulty ?? CourseDifficultyLevels.BEGINNER,
            category: course?.category ?? '',
            authorId: course?.authorId ?? '',
        });
    }, [course, form]);

    const onSubmit = async (values: CourseDetailsFormData) => {
        setIsSubmitting(true);
        try {
            const requestData: AdminCreateUpdateCourseRequestDTO = {
                ...values,
                description: values.description || null,
                category: values.category || null,
                imagePreview: values.imagePreview,
                videoPreview: values.videoPreview,
            };

            let resultCourse: AdminCourseDetailDTO;

            if (isEditing && course) {
                resultCourse = await adminApiClient.updateCourseAdmin(course.id, requestData);
                toast.success(`Course "${values.title}" updated.`);
            } else {
                resultCourse = await adminApiClient.createCourseAdmin(requestData);
                toast.success(`Course "${values.title}" created.`);
            }
            onSuccess(resultCourse);
        } catch (error: unknown) {
            console.error(`Error ${isEditing ? 'updating' : 'creating'} course:`, error);

            let errorMsg = 'Unknown error';

            if (isAxiosError(error)) {
                errorMsg = error?.response?.data?.message || error.message || 'Unknown error';
            } else if (error instanceof Error) {
                errorMsg = error.message;
            }

            toast.error(`Failed to ${isEditing ? 'save' : 'create'} course: ${errorMsg}`);
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
                toast.success(`${fileType === 'image' ? 'Image' : 'Video'} uploaded successfully!`);
            } else {
                throw new Error('Upload failed, URL not received.');
            }
        } catch (error) {
            console.error(`Error uploading ${fileType}:`, error);
            toast.error(`Failed to upload ${fileType}.`);
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

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Introduction to React" {...field} disabled={isSubmitting} />
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
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Describe the course..."
                                    className="resize-y min-h-[100px]"
                                    {...field}
                                    value={field.value ?? ''}
                                    disabled={isSubmitting}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price ($)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="49.99"
                                        {...field}
                                        disabled={isSubmitting}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="discount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Discount ($)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="0.00"
                                        {...field}
                                        value={field.value ?? 0}
                                        disabled={isSubmitting}
                                    />
                                </FormControl>
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
                                <FormLabel>Difficulty</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    disabled={isSubmitting}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.values(CourseDifficultyLevels).map((level) => (
                                            <SelectItem key={level} value={level}>
                                                {level.charAt(0) + level.slice(1).toLowerCase()}
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
                                <FormLabel>Category</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g., Web Development"
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
                                <FormLabel>Author</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    disabled={isSubmitting || authors.length === 0}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {authors.length > 0 ? (
                                            authors.map((author) => (
                                                <SelectItem key={author.id} value={author.id!}>
                                                    {author.username}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="loading" disabled>
                                                Loading...
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="imagePreview"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Image Preview</FormLabel>
                            {field.value && (
                                <div className="mt-2">
                                    <Image
                                        src={field.value}
                                        alt="Image Preview"
                                        width={200}
                                        height={112}
                                        className="rounded-md object-cover"
                                    />
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="text-xs text-destructive p-0 h-auto mt-1"
                                        onClick={() => field.onChange(null)}
                                    >
                                        Remove Image
                                    </Button>
                                </div>
                            )}
                            <FormControl>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => onFileChange(e, 'image', setIsUploadingImage, 'imagePreview')}
                                        disabled={isUploadingImage || isSubmitting}
                                        className="flex-1"
                                    />
                                    {isUploadingImage && <Loader2 className="h-4 w-4 animate-spin" />}
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="videoPreview"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Video Preview</FormLabel>
                            {field.value && (
                                <div className="mt-2">
                                    <p className="text-xs truncate max-w-xs bg-muted p-1 rounded">
                                        Current: {field.value}
                                    </p>
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="text-xs text-destructive p-0 h-auto mt-1"
                                        onClick={() => field.onChange(null)}
                                    >
                                        Remove Video
                                    </Button>
                                </div>
                            )}
                            <FormControl>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) => onFileChange(e, 'video', setIsUploadingVideo, 'videoPreview')}
                                        disabled={isUploadingVideo || isSubmitting}
                                        className="flex-1"
                                    />
                                    {isUploadingVideo && <Loader2 className="h-4 w-4 animate-spin" />}
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditing ? 'Save Course Details' : 'Create Course'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
