import { PlusCircle, Trash2 } from 'lucide-react';
import { Control, FieldErrors, UseFieldArrayRemove, useFieldArray, useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { TaskType } from '@/types';

import { LessonFormData } from './lesson-edit-dialog';

interface TaskItemProps {
    control: Control<LessonFormData>;
    index: number;
    removeTask: UseFieldArrayRemove;
    isSubmitting: boolean;
    errors: FieldErrors<LessonFormData>;
}

const TaskItem: React.FC<TaskItemProps> = ({ control, index, removeTask, isSubmitting, errors }) => {
    const taskType = useWatch({
        control,
        name: `tasks.${index}.taskType`,
    });

    const {
        fields: optionFields,
        append: appendOption,
        remove: removeOption,
    } = useFieldArray({
        control,
        name: `tasks.${index}.options` as any,
    });

    const taskErrors = errors.tasks?.[index];

    return (
        <div className="border relative group border-border/50 p-4 rounded-lg space-y-4 bg-card shadow-inner">
            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeTask(index)}
                disabled={isSubmitting}
                aria-label={`Remove task ${index + 1}`}
            >
                <Trash2 className="h-4 w-4" />
            </Button>

            <p className="text-sm font-medium text-muted-foreground">Task {index + 1}</p>

            <FormField
                control={control}
                name={`tasks.${index}.description`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-xs">Description *</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Task description..."
                                {...field}
                                disabled={isSubmitting}
                                rows={3}
                                aria-required="true"
                            />
                        </FormControl>
                        <FormMessage>{taskErrors?.description?.message}</FormMessage>
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name={`tasks.${index}.taskType`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-xs">Task Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select task type" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {Object.values(TaskType).map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type.replace('_', ' ')}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage>{taskErrors?.taskType?.message}</FormMessage>
                    </FormItem>
                )}
            />
            {taskType === TaskType.MULTIPLE_CHOICE && (
                <div className="space-y-2 border-l-2 border-dashed pl-3 ml-1 border-blue-500/30">
                    <FormLabel className="text-xs text-blue-600 dark:text-blue-400">
                        Options (for Multiple Choice)
                    </FormLabel>
                    {optionFields.map((optionField, optionIndex) => (
                        <FormField
                            key={optionField.id}
                            control={control}
                            name={`tasks.${index}.options.${optionIndex}`}
                            render={({ field: optField }) => (
                                <FormItem className="flex items-center gap-2">
                                    <FormControl>
                                        <Input
                                            placeholder={`Option ${optionIndex + 1}`}
                                            {...optField}
                                            disabled={isSubmitting}
                                            className="flex-1 h-8 text-sm"
                                        />
                                    </FormControl>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        className="text-destructive hover:bg-destructive/10 h-8 w-8"
                                        onClick={() => removeOption(optionIndex)}
                                        disabled={isSubmitting}
                                        aria-label={`Remove option ${optionIndex + 1}`}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </FormItem>
                            )}
                        />
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => appendOption('')}
                        disabled={isSubmitting}
                    >
                        <PlusCircle className="mr-1 h-3.5 w-3.5" /> Add Option
                    </Button>
                    <FormMessage>{taskErrors?.options?.message || taskErrors?.options?.root?.message}</FormMessage>
                </div>
            )}
            {(taskType === TaskType.TEXT_INPUT ||
                taskType === TaskType.CODE_INPUT ||
                taskType === TaskType.MULTIPLE_CHOICE) && (
                <FormField
                    control={control}
                    name={`tasks.${index}.solution`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs">
                                Solution{' '}
                                {taskType === TaskType.MULTIPLE_CHOICE
                                    ? '(Enter the exact text of the correct option)'
                                    : '*'}
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder={
                                        taskType === TaskType.MULTIPLE_CHOICE
                                            ? 'Correct option text'
                                            : 'Correct answer or code...'
                                    }
                                    rows={taskType === TaskType.CODE_INPUT ? 6 : 3}
                                    className={cn(taskType === TaskType.CODE_INPUT && 'font-mono text-sm')}
                                    {...field}
                                    value={field.value ?? ''}
                                    disabled={isSubmitting}
                                    aria-required={taskType !== TaskType.MULTIPLE_CHOICE}
                                />
                            </FormControl>
                            <FormMessage>{taskErrors?.solution?.message}</FormMessage>
                        </FormItem>
                    )}
                />
            )}
            {taskType === TaskType.CODE_INPUT && (
                <FormField
                    control={control}
                    name={`tasks.${index}.tests`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs">Tests (optional, one per line)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="assert(sum(1, 2) === 3);\nassert(sum(-1, 1) === 0);"
                                    rows={4}
                                    className="font-mono text-sm"
                                    {...field}
                                    value={field.value?.join('\\n') ?? ''}
                                    onChange={(e) => field.onChange(e.target.value.split('\\n'))}
                                    disabled={isSubmitting}
                                />
                            </FormControl>
                            <FormMessage>{taskErrors?.tests?.message}</FormMessage>
                        </FormItem>
                    )}
                />
            )}
        </div>
    );
};

export default TaskItem;
