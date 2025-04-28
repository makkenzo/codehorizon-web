'use client';

import React, { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { adminApiClient } from '@/server/admin-api-client';
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
});

type CourseDetailsFormData = z.infer<typeof courseDetailsFormSchema>;

interface CourseDetailsFormProps {
    course: AdminCourseDetailDTO;
    onSuccess: (updatedCourse: AdminCourseDetailDTO) => void;
}

export default function CourseDetailsForm({ course, onSuccess }: CourseDetailsFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [authors, setAuthors] = useState<AdminUser[]>([]);

    useEffect(() => {
        const fetchAuthors = async () => {
            try {
                const authorList = await adminApiClient.getPotentialAuthors();
                setAuthors(authorList);
            } catch (error: any) {
                console.error('Failed to fetch authors:', error);
                toast.error(`Could not load authors list: ${error.message || 'Unknown error'}`);
            }
        };
        fetchAuthors();
    }, []);

    const form = useForm<CourseDetailsFormData>({
        resolver: zodResolver(courseDetailsFormSchema),
        defaultValues: {
            title: course.title ?? '',
            description: course.description ?? '',
            price: course.price ?? 0,
            discount: course.discount ?? 0,
            difficulty: course.difficulty ?? CourseDifficultyLevels.BEGINNER,
            category: course.category ?? '',
            authorId: course.authorId ?? '',
        },
    });

    useEffect(() => {
        form.reset({
            title: course.title ?? '',
            description: course.description ?? '',
            price: course.price ?? 0,
            discount: course.discount ?? 0,
            difficulty: course.difficulty ?? CourseDifficultyLevels.BEGINNER,
            category: course.category ?? '',
            authorId: course.authorId ?? '',
        });
    }, [course, form]);

    const onSubmit = async (values: CourseDetailsFormData) => {
        setIsSubmitting(true);
        try {
            const requestData: AdminCreateUpdateCourseRequestDTO = {
                ...values,
                description: values.description || null,
                category: values.category || null,
                imagePreview: course.imagePreview,
                videoPreview: course.videoPreview,
            };
            const updatedCourseData = await adminApiClient.updateCourseAdmin(course.id, requestData);
            toast.success(`Course "${values.title}" details updated.`);
            onSuccess(updatedCourseData);
        } catch (error: any) {
            console.error(`Error updating course details:`, error);
            const errorMsg = error?.response?.data?.message || error.message || 'Unknown error';
            toast.error(`Failed to update course: ${errorMsg}`);
        } finally {
            setIsSubmitting(false);
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
                                <Input {...field} disabled={isSubmitting} />
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
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price ($)</FormLabel>
                                <FormControl>
                                    <Input type="text" inputMode="decimal" {...field} disabled={isSubmitting} />
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
                                            <SelectValue />
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
                                    <Input {...field} value={field.value ?? ''} disabled={isSubmitting} />
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
                                            <SelectValue />
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
                <div className="space-y-2">
                    <FormItem>
                        <FormLabel>Image Preview URL</FormLabel>
                        <Input value={course.imagePreview ?? 'Not set'} readOnly disabled />
                    </FormItem>
                    <FormItem>
                        <FormLabel>Video Preview URL</FormLabel>
                        <Input value={course.videoPreview ?? 'Not set'} readOnly disabled />
                    </FormItem>
                </div>
                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Details
                    </Button>
                </div>
            </form>
        </Form>
    );
}
