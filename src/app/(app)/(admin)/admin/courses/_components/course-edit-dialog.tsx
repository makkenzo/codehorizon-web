'use client';

import React, { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { adminApiClient } from '@/server/admin-api-client';
import { CourseDifficultyLevels } from '@/types';
import { AdminCourseListItemDTO, AdminCreateUpdateCourseRequestDTO, AdminUser } from '@/types/admin';

const courseFormSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional().or(z.literal('')),
    price: z.coerce.number().min(0, 'Price cannot be negative'),
    discount: z.coerce.number().min(0).optional().default(0),
    difficulty: z.nativeEnum(CourseDifficultyLevels),
    category: z.string().optional().or(z.literal('')),
    authorId: z.string().min(1, 'Author is required'),
});

type CourseFormData = z.infer<typeof courseFormSchema>;

interface AdminCourseEditDialogProps {
    course?: AdminCourseListItemDTO | null;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export default function AdminCourseEditDialog({ course, onOpenChange, onSuccess }: AdminCourseEditDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [authors, setAuthors] = useState<AdminUser[]>([]);

    const isEditing = course != null;

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

    const form = useForm<CourseFormData>({
        resolver: zodResolver(courseFormSchema),

        defaultValues: {
            title: course?.title ?? '',
            description: course?.description ?? '',
            price: course?.price ?? 0,
            discount: course?.discount ?? 0,
            difficulty: course?.difficulty ?? CourseDifficultyLevels.BEGINNER,
            category: course?.category ?? '',
            authorId: course?.authorId ?? '',
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

    const onSubmit = async (values: CourseFormData) => {
        setIsSubmitting(true);
        try {
            const requestData: AdminCreateUpdateCourseRequestDTO = {
                ...values,
                description: values.description || null,
                category: values.category || null,
                imagePreview: isEditing ? course?.imagePreview : null,
                videoPreview: isEditing ? course?.videoPreview : null,
            };

            if (isEditing && course) {
                await adminApiClient.updateCourseAdmin(course.id, requestData);
                toast.success(`Course "${values.title}" updated.`);
            } else {
                await adminApiClient.createCourseAdmin(requestData);
                toast.success(`Course "${values.title}" created.`);
            }

            onSuccess();
        } catch (error: unknown) {
            console.error(`Error ${isEditing ? 'updating' : 'creating'} course:`, error);

            let errorMsg = 'Unknown error';

            if (isAxiosError(error)) {
                errorMsg = error?.response?.data?.message || error.message || 'Unknown error';
            } else if (error instanceof Error) {
                errorMsg = error.message;
            }

            toast.error(`Failed to ${isEditing ? 'update' : 'create'} course: ${errorMsg}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{isEditing ? `Edit Course: ${course?.title}` : 'Create New Course'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Modify the course details below.' : 'Fill in the details for the new course.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <div className="max-h-[60vh] overflow-y-auto pr-6 pl-1 -mr-6">
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., Introduction to React"
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
                            <div className="grid grid-cols-2 gap-4">
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
                                                        <SelectValue placeholder="Select difficulty" />
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
                                                        <SelectValue placeholder="Select author" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {authors.length > 0 ? (
                                                        authors.map((author) => (
                                                            <SelectItem key={author.id} value={author.id!}>
                                                                {author.username}{' '}
                                                                {author.email ? `(${author.email})` : ''}
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
                        </form>
                    </div>

                    <DialogFooter className="pt-4 border-t mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>

                        <Button type="button" onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? 'Save Changes' : 'Create Course'}
                        </Button>
                    </DialogFooter>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
