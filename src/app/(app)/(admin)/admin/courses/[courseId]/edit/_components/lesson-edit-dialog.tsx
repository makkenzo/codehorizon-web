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
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Textarea } from '@/components/ui/textarea';
import { adminApiClient } from '@/server/admin-api-client';
import { AdminCourseDetailDTO, AdminCreateUpdateLessonRequestDTO, AdminLessonDTO } from '@/types/admin';

const lessonFormSchema = z.object({
    title: z.string().min(3, 'Lesson title must be at least 3 characters'),
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

            let updatedCourse: AdminCourseDetailDTO;

            if (isEditing && lesson) {
                updatedCourse = await adminApiClient.updateLessonAdmin(courseId, lesson.id, requestData);
                toast.success(`Lesson "${values.title}" updated.`);
            } else {
                updatedCourse = await adminApiClient.addLessonAdmin(courseId, requestData);
                toast.success(`Lesson "${values.title}" added.`);
            }

            onSuccess(updatedCourse);
        } catch (error: any) {
            console.error(`Error ${isEditing ? 'updating' : 'adding'} lesson:`, error);
            const errorMsg = error?.response?.data?.message || error.message || 'Unknown error';
            toast.error(`Failed to ${isEditing ? 'save' : 'add'} lesson: ${errorMsg}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{isEditing ? `Edit Lesson: ${lesson?.title}` : 'Add New Lesson'}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Modify the lesson content and details.'
                            : 'Fill in the details for the new lesson.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-6 pl-1 -mr-6 custom-scrollbar">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Lesson Title</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., Setting up your environment"
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
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Content</FormLabel>
                                        <FormControl>
                                            <RichTextEditor
                                                value={field.value ?? ''}
                                                onChange={field.onChange}
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </div>

                <DialogFooter className="flex-shrink-0 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditing ? 'Save Lesson' : 'Add Lesson'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
