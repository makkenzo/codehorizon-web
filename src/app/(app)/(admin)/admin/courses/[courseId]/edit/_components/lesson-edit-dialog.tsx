'use client';

import React, { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
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
import { Textarea } from '@/components/ui/textarea';
import { adminApiClient } from '@/server/admin-api-client';
import { AdminCourseDetailDTO, AdminCreateUpdateLessonRequestDTO, AdminLessonDTO } from '@/types/admin';

const lessonFormSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    content: z.string().optional().or(z.literal('')),
});

type LessonFormData = z.infer<typeof lessonFormSchema>;

interface LessonEditDialogProps {
    courseId: string;
    lesson?: AdminLessonDTO | null;
    onOpenChange: (open: boolean) => void;
    onSuccess: (updatedCourseData: AdminCourseDetailDTO) => void;
}

export default function LessonEditDialog({ courseId, lesson, onOpenChange, onSuccess }: LessonEditDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = lesson != null;

    const form = useForm<LessonFormData>({
        resolver: zodResolver(lessonFormSchema),
        defaultValues: {
            title: lesson?.title ?? '',
            content: lesson?.content ?? '',
        },
    });

    useEffect(() => {
        form.reset({
            title: lesson?.title ?? '',
            content: lesson?.content ?? '',
        });
    }, [lesson, form]);

    const onSubmit = async (values: LessonFormData) => {
        setIsSubmitting(true);
        try {
            const requestData: AdminCreateUpdateLessonRequestDTO = {
                ...values,
                content: values.content || null,
            };

            let updatedCourse: AdminCourseDetailDTO | null = null;

            if (isEditing && lesson) {
                updatedCourse = await adminApiClient.updateLessonAdmin(courseId, lesson.id, requestData);
                toast.success(`Lesson "${values.title}" updated.`);
            } else {
                updatedCourse = await adminApiClient.addLessonAdmin(courseId, requestData);
                toast.success(`Lesson "${values.title}" added.`);
            }

            if (updatedCourse) {
                onSuccess(updatedCourse);
            }
        } catch (error: any) {
            console.error(`Error ${isEditing ? 'updating' : 'adding'} lesson:`, error);
            const errorMsg = error?.response?.data?.message || error.message || 'Unknown error';
            toast.error(`Failed to ${isEditing ? 'update' : 'add'} lesson: ${errorMsg}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl">
                {' '}
                {/* Еще шире для контента урока */}
                <DialogHeader>
                    <DialogTitle>{isEditing ? `Edit Lesson: ${lesson?.title}` : 'Add New Lesson'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Modify the lesson details.' : 'Fill in the details for the new lesson.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <div className="max-h-[65vh] overflow-y-auto pr-6 pl-1 -mr-6">
                        {' '}
                        {/* Больше высоты */}
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-4">
                            {/* Title */}
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        {' '}
                                        <FormLabel>Lesson Title</FormLabel>{' '}
                                        <FormControl>
                                            {' '}
                                            <Input
                                                placeholder="e.g., Introduction"
                                                {...field}
                                                disabled={isSubmitting}
                                            />{' '}
                                        </FormControl>{' '}
                                        <FormMessage />{' '}
                                    </FormItem>
                                )}
                            />

                            {/* Content (Textarea, но лучше Rich Text Editor) */}
                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        {' '}
                                        <FormLabel>Lesson Content</FormLabel>{' '}
                                        <FormControl>
                                            {/* TODO: Заменить на Rich Text Editor (например, Tiptap, Lexical) */}
                                            <Textarea
                                                placeholder="Lesson content (Markdown or HTML)..."
                                                className="resize-y min-h-[200px]"
                                                {...field}
                                                value={field.value ?? ''}
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>{' '}
                                        <FormMessage />{' '}
                                    </FormItem>
                                )}
                            />

                            {/* TODO: Добавить поля для Code Examples, Tasks, Attachments */}
                            {/* Например, секция для добавления/редактирования задач */}
                            {/* <div className="space-y-2 rounded-lg border p-4"> ... Tasks UI ... </div> */}
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
                            {isEditing ? 'Save Lesson' : 'Add Lesson'}
                        </Button>
                    </DialogFooter>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
