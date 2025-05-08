'use client';

import React, { useEffect, useState } from 'react';

import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { javascript } from '@codemirror/lang-javascript';
import { zodResolver } from '@hookform/resolvers/zod';
import CodeMirror from '@uiw/react-codemirror';
import { isAxiosError } from 'axios';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import AttachmentLink from '@/components/course/attachment-link';
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
import { adminApiClient } from '@/server/admin-api-client';
import S3ApiClient from '@/server/s3';
import { TaskType } from '@/types';
import { AdminCourseDetailDTO, AdminCreateUpdateLessonRequestDTO, AdminLessonDTO } from '@/types/admin';

import TaskItem from './task-item';

const attachmentSchema = z.object({
    name: z.string(),
    url: z.string(),
});

const codeExampleSchema = z.object({
    value: z.string().min(1, 'Пример кода обязателен'),
});

const taskSchema = z
    .object({
        id: z.string(),
        description: z.string().min(1, 'Описание задачи обязательно для заполнения'),
        solution: z.string().nullable().optional(),
        tests: z.array(z.string()).nullable().optional(),
        taskType: z.nativeEnum(TaskType),
        options: z.array(z.string()).nullable().optional(),
    })
    .refine(
        (data) => {
            if (data.taskType === TaskType.MULTIPLE_CHOICE) {
                return Array.isArray(data.options) && data.options.length > 1;
            }
            return true;
        },
        {
            message: 'Выберите хотя бы два варианта ответа',
            path: ['options'],
        }
    )
    .refine(
        (data) => {
            if ((data.taskType === TaskType.TEXT_INPUT || data.taskType === TaskType.CODE_INPUT) && !data.solution) {
                return false;
            }

            return true;
        },
        {
            message: 'Ответ не может быть пустым',
            path: ['solution'],
        }
    );

const lessonFormSchema = z.object({
    title: z.string().min(3, 'Заголовок урока обязателен для заполнения'),
    content: z.string().optional().or(z.literal('')),
    codeExamples: z.array(codeExampleSchema).optional().default([]),
    tasks: z.array(taskSchema).optional().default([]),
    attachments: z.array(attachmentSchema).optional().default([]),
    mainAttachment: z.string().url('Неверный формат URL для основного прикрепления').nullable().optional(),
});

export type LessonFormData = z.infer<typeof lessonFormSchema>;

interface LessonEditDialogProps {
    courseId: string;
    lesson?: AdminLessonDTO | null;
    onOpenChange: (open: boolean) => void;
    onSuccess: (updatedCourseData: AdminCourseDetailDTO) => void;
}

export default function LessonEditDialog({ courseId, lesson, onOpenChange, onSuccess }: LessonEditDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = lesson != null;
    const s3ApiClient = new S3ApiClient();
    const [uploadStates, setUploadStates] = useState<{ [key: string]: boolean }>({});

    const mapCodeExamplesToFormData = (examples?: string[]): { value: string }[] => {
        return examples?.map((ex) => ({ value: ex })) ?? [];
    };

    const form = useForm<LessonFormData>({
        resolver: zodResolver(lessonFormSchema),
        defaultValues: {
            title: lesson?.title ?? '',
            content: lesson?.content ?? '',
            codeExamples: mapCodeExamplesToFormData(lesson?.codeExamples),
            tasks: lesson?.tasks?.map((t) => ({ ...t, id: t.id || `temp-${Date.now()}-${Math.random()}` })) ?? [],
            attachments: lesson?.attachments ?? [],
            mainAttachment: lesson?.mainAttachment ?? null,
        },
    });

    const {
        fields: codeExampleFields,
        append: appendCodeExample,
        remove: removeCodeExample,
    } = useFieldArray({
        control: form.control,
        name: 'codeExamples',
    });

    const {
        fields: taskFields,
        append: appendTask,
        remove: removeTask,
        update: updateTask,
    } = useFieldArray({
        control: form.control,
        name: 'tasks',
    });

    const {
        fields: attachmentFields,
        append: appendAttachment,
        remove: removeAttachment,
    } = useFieldArray({
        control: form.control,
        name: 'attachments',
    });

    useEffect(() => {
        form.reset({
            title: lesson?.title ?? '',
            content: lesson?.content ?? '',
            codeExamples: mapCodeExamplesToFormData(lesson?.codeExamples),
            tasks: lesson?.tasks?.map((t) => ({ ...t, id: t.id || `temp-${Date.now()}-${Math.random()}` })) ?? [],
            attachments: lesson?.attachments ?? [],
            mainAttachment: lesson?.mainAttachment ?? null,
        });
    }, [lesson, form]);

    const handleFileUpload = async (
        file: File,
        directory: string,
        fileIdentifier: string,
        onSuccess: (url: string, name: string) => void,
        onError: () => void
    ) => {
        if (!file) return;

        setUploadStates((prev) => ({ ...prev, [fileIdentifier]: true }));

        try {
            const response = await s3ApiClient.uploadFile(file, directory);
            if (response?.url) {
                onSuccess(response.url, file.name);
                toast.success(`Файл "${file.name}" загружен.`);
            } else {
                throw new Error('Upload failed, URL not received.');
            }
        } catch (error) {
            console.error(`Error uploading file to ${directory}:`, error);
            toast.error(`Не удалось загрузить файл "${file.name}".`);
            onError();
        } finally {
            setUploadStates((prev) => ({ ...prev, [fileIdentifier]: false }));
        }
    };

    const handleMainAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const fileId = `main-${Date.now()}`;
            handleFileUpload(
                file,
                'lesson-main-attachments',
                fileId,
                (url) => form.setValue('mainAttachment', url),
                () => form.setValue('mainAttachment', lesson?.mainAttachment ?? null)
            );
        }
    };

    const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const fileId = `attachment-${Date.now()}`;
            handleFileUpload(
                file,
                'lesson-attachments',
                fileId,
                (url, name) => appendAttachment({ name, url }),
                () => {}
            );
        }
    };

    const {
        formState: { errors },
    } = form;

    const onSubmit = async (values: LessonFormData) => {
        setIsSubmitting(true);
        try {
            const tasksWithId = values.tasks?.map((task) => ({
                ...task,
                id: task.id || `temp-${Date.now()}-${Math.random()}`,
            }));

            const requestData: AdminCreateUpdateLessonRequestDTO = {
                title: values.title,
                content: values.content || null,
                codeExamples: values.codeExamples?.map((ex) => ex.value),
                tasks: tasksWithId,
                attachments: values.attachments,
                mainAttachment: values.mainAttachment,
            };

            let updatedCourse: AdminCourseDetailDTO;

            if (isEditing && lesson) {
                updatedCourse = await adminApiClient.updateLessonAdmin(courseId, lesson.id, requestData);
                toast.success(`Lesson \"${values.title}\" updated.`);
            } else {
                updatedCourse = await adminApiClient.addLessonAdmin(courseId, requestData);
                toast.success(`Lesson \"${values.title}\" added.`);
            }

            onSuccess(updatedCourse);
        } catch (error: unknown) {
            console.error(`Error ${isEditing ? 'updating' : 'adding'} lesson:`, error);

            let errorMsg = 'Unknown error';

            if (isAxiosError(error)) {
                errorMsg = error?.response?.data?.message || error.message || 'Unknown error';
            } else if (error instanceof Error) {
                errorMsg = error.message;
            }

            toast.error(`Failed to ${isEditing ? 'save' : 'add'} lesson: ${errorMsg}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? `Редактирование урока: ${lesson?.title}` : 'Добавить новый урок'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Измените содержимое и подробности урока.'
                            : 'Заполните подробную информацию для нового урока.'}
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
                                        <FormLabel className="text-base font-semibold">Lesson Title</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Например, настройка среды разработки"
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
                                        <FormLabel className="text-base font-semibold">Контент</FormLabel>
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
                            <div className="space-y-2 rounded-md border p-4">
                                <FormLabel className="text-base font-semibold">Примеры кода</FormLabel>
                                {codeExampleFields.map((field, index) => (
                                    <FormField
                                        key={field.id}
                                        control={form.control}
                                        name={`codeExamples.${index}.value`}
                                        render={({ field: codeField }) => (
                                            <FormItem className="flex flex-col gap-2">
                                                <input type="hidden" {...codeField} />
                                                <FormControl>
                                                    <CodeMirror
                                                        value={codeField.value ?? ''}
                                                        height="150px"
                                                        onChange={(value) => codeField.onChange(value)}
                                                        className="flex-1 text-sm border rounded-md overflow-hidden"
                                                        readOnly={isSubmitting}
                                                        extensions={[
                                                            javascript({ jsx: true, typescript: true }),
                                                            css(),
                                                            html({ autoCloseTags: true }),
                                                        ]}
                                                        basicSetup={{
                                                            foldGutter: false,
                                                            dropCursor: false,
                                                            allowMultipleSelections: false,
                                                            indentOnInput: false,
                                                        }}
                                                    />
                                                </FormControl>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon-sm"
                                                    onClick={() => removeCodeExample(index)}
                                                    disabled={isSubmitting}
                                                    aria-label="Remove code example"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </FormItem>
                                        )}
                                    />
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => appendCodeExample({ value: '' })}
                                    disabled={isSubmitting}
                                    className="mt-2"
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" /> Добавить пример кода
                                </Button>
                            </div>

                            <div className="space-y-4 rounded-md border p-4">
                                <FormLabel className="text-base font-semibold">Задания</FormLabel>
                                <div className="space-y-4">
                                    {taskFields.length === 0 && (
                                        <p className="text-sm text-muted-foreground px-2 py-4 text-center">
                                            Задания еще не добавлены.
                                        </p>
                                    )}
                                    {taskFields.map((field, index) => (
                                        <TaskItem
                                            key={field.id}
                                            control={form.control}
                                            index={index}
                                            removeTask={removeTask}
                                            isSubmitting={isSubmitting}
                                            errors={errors}
                                        />
                                    ))}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        appendTask({
                                            id: uuidv4(),
                                            description: '',
                                            taskType: TaskType.TEXT_INPUT,
                                            solution: null,
                                            tests: [],
                                            options: [],
                                        })
                                    }
                                    disabled={isSubmitting}
                                    className="mt-4"
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" /> Добавить задание
                                </Button>
                            </div>

                            <FormField
                                control={form.control}
                                name="mainAttachment"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base font-semibold">
                                            Основное вложение (видео, PDF, и т.д.)
                                        </FormLabel>
                                        {field.value && (
                                            <div className="mt-1 flex items-center gap-2">
                                                <AttachmentLink
                                                    attachment={{ name: 'Current main attachment', url: field.value }}
                                                    className="text-xs"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="link"
                                                    size="sm"
                                                    className="text-xs text-destructive p-0 h-auto"
                                                    onClick={() => field.onChange(null)}
                                                >
                                                    Удалить
                                                </Button>
                                            </div>
                                        )}
                                        <FormControl>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="file"
                                                    onChange={handleMainAttachmentChange}
                                                    disabled={isSubmitting || !!uploadStates[`main-${lesson?.id}`]}
                                                    className="flex-1"
                                                />
                                                {uploadStates[`main-${lesson?.id}`] && (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-2 rounded-md border p-4">
                                <FormLabel className="text-base font-semibold">Доп. вложения</FormLabel>
                                <div className="space-y-2">
                                    {attachmentFields.map((field, index) => (
                                        <div
                                            key={field.id}
                                            className="flex items-center gap-2 justify-between bg-muted/50 p-2 rounded"
                                        >
                                            <AttachmentLink
                                                attachment={{ name: field.name, url: field.url }}
                                                className="text-xs bg-background"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-sm"
                                                className="text-destructive hover:bg-destructive/10"
                                                onClick={() => removeAttachment(index)}
                                                disabled={isSubmitting}
                                                aria-label={`Remove attachment ${field.name}`}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {attachmentFields.length === 0 && (
                                        <p className="text-xs text-muted-foreground">No additional attachments.</p>
                                    )}
                                </div>
                                <div className="mt-2 pt-2 border-t">
                                    <FormLabel className="text-xs mb-1 block">Upload new attachment</FormLabel>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="file"
                                            id="attachment-upload"
                                            onChange={handleAttachmentChange}
                                            disabled={isSubmitting || uploadStates['new-attachment']}
                                            className="flex-1"
                                        />
                                        {uploadStates['new-attachment'] && <Loader2 className="h-4 w-4 animate-spin" />}
                                    </div>
                                </div>
                            </div>
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
