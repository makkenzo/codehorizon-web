import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import ReactCodeMirror from '@uiw/react-codemirror';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Control, FieldErrors, UseFieldArrayRemove, useFieldArray, useWatch } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { AdminTestCaseDTO, ProgrammingLanguage } from '@/types/admin';
import { TaskType } from '@/types/task';

import { LessonFormData } from './lesson-edit-dialog';

interface TaskItemProps {
    control: Control<LessonFormData>;
    index: number;
    removeTask: UseFieldArrayRemove;
    isSubmitting: boolean;
    errors: FieldErrors<LessonFormData>;
}

const TestCaseEditor: React.FC<{
    control: Control<LessonFormData>;
    taskIndex: number;
    testCaseIndex: number;
    removeTestCase: (index: number) => void;
    isSubmitting: boolean;
    testCaseErrors?: FieldErrors<AdminTestCaseDTO>;
}> = ({ control, taskIndex, testCaseIndex, removeTestCase, isSubmitting, testCaseErrors }) => {
    return (
        <div className="p-3 border rounded-md space-y-3 bg-muted/20 relative group">
            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute top-1 right-1 text-destructive hover:bg-destructive/10 opacity-50 group-hover:opacity-100"
                onClick={() => removeTestCase(testCaseIndex)}
                disabled={isSubmitting}
            >
                <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <p className="text-xs font-medium text-muted-foreground">Тест-кейс {testCaseIndex + 1}</p>
            <FormField
                control={control}
                name={`tasks.${taskIndex}.testCases.${testCaseIndex}.name`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-xs">Название тест-кейса *</FormLabel>
                        <FormControl>
                            <Input
                                placeholder="Например, Базовый тест"
                                {...field}
                                disabled={isSubmitting}
                                className="h-8 text-xs"
                            />
                        </FormControl>
                        <FormMessage className="text-xs">{testCaseErrors?.name?.message}</FormMessage>
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name={`tasks.${taskIndex}.testCases.${testCaseIndex}.input`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-xs">Входные данные (каждый параметр с новой строки)</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder={'2\n3'}
                                {...field}
                                value={Array.isArray(field.value) ? field.value.join('\n') : ''}
                                onChange={(e) => {
                                    const lines = e.target.value.split(/\r?\n/);
                                    field.onChange(lines);
                                }}
                                disabled={isSubmitting}
                                rows={Math.max(2, field.value?.length || 2)}
                                className="text-xs font-mono"
                            />
                        </FormControl>
                        <FormMessage className="text-xs">{testCaseErrors?.input?.message}</FormMessage>
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name={`tasks.${taskIndex}.testCases.${testCaseIndex}.expectedOutput`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-xs">Ожидаемый вывод (каждая строка с новой строки)</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder={'5'}
                                {...field}
                                value={Array.isArray(field.value) ? field.value.join('\n') : ''}
                                onChange={(e) => {
                                    const lines = e.target.value.split(/\r?\n/);
                                    field.onChange(lines);
                                }}
                                disabled={isSubmitting}
                                rows={Math.max(2, field.value?.length || 2)}
                                className="text-xs font-mono"
                            />
                        </FormControl>
                        <FormMessage className="text-xs">{testCaseErrors?.expectedOutput?.message}</FormMessage>
                    </FormItem>
                )}
            />
            <div className="grid grid-cols-2 gap-3">
                <FormField
                    control={control}
                    name={`tasks.${taskIndex}.testCases.${testCaseIndex}.points`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs">Баллы *</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    placeholder="1"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                                    disabled={isSubmitting}
                                    className="h-8 text-xs"
                                />
                            </FormControl>
                            <FormMessage className="text-xs">{testCaseErrors?.points?.message}</FormMessage>
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name={`tasks.${taskIndex}.testCases.${testCaseIndex}.isHidden`}
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0 pt-5">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={isSubmitting}
                                />
                            </FormControl>
                            <FormLabel className="text-xs font-normal">Скрытый тест</FormLabel>
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
};

const TaskItem: React.FC<TaskItemProps> = ({ control, index, removeTask, isSubmitting, errors }) => {
    const taskType = useWatch({ control, name: `tasks.${index}.taskType` });
    const taskLanguage = useWatch({ control, name: `tasks.${index}.language` });

    const {
        fields: optionFields,
        append: appendOption,
        remove: removeOption,
    } = useFieldArray({
        control,
        name: `tasks.${index}.options` as any,
    });

    const {
        fields: testCaseFields,
        append: appendTestCase,
        remove: removeTestCase,
    } = useFieldArray({
        control,
        name: `tasks.${index}.testCases` as any,
    });

    const taskErrors = errors.tasks?.[index];

    const getLanguageExtension = () => {
        if (taskLanguage === ProgrammingLanguage.PYTHON) return python();
        if (taskLanguage === ProgrammingLanguage.JAVASCRIPT) return javascript();
        return [];
    };

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

            <p className="text-sm font-medium text-muted-foreground">Задание {index + 1}</p>

            <FormField
                control={control}
                name={`tasks.${index}.description`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-xs">Описание задачи *</FormLabel>
                        <FormControl>
                            <RichTextEditor value={field.value ?? ''} onChange={field.onChange} />
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
                        <FormLabel className="text-xs">Тип задачи *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Выберите тип" />
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
            {taskType === TaskType.CODE_INPUT && (
                <div className="space-y-3 border-l-2 border-blue-500/30 pl-3 ml-1 pt-2">
                    <FormField
                        control={control}
                        name={`tasks.${index}.language`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs">Язык программирования *</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value ?? undefined}
                                    disabled={isSubmitting}
                                >
                                    <FormControl>
                                        <SelectTrigger className="h-9">
                                            <SelectValue placeholder="Выберите язык" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.values(ProgrammingLanguage).map((lang) => (
                                            <SelectItem key={lang} value={lang}>
                                                {lang}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage>{taskErrors?.language?.message}</FormMessage>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name={`tasks.${index}.boilerplateCode`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs">Шаблон кода (Boilerplate)</FormLabel>
                                <FormControl>
                                    <ReactCodeMirror
                                        value={field.value ?? ''}
                                        height="150px"
                                        extensions={[getLanguageExtension()]}
                                        onChange={field.onChange}
                                        className="text-sm border rounded-md overflow-hidden"
                                        readOnly={isSubmitting}
                                        basicSetup={{
                                            foldGutter: false,
                                            dropCursor: false,
                                            allowMultipleSelections: false,
                                            indentOnInput: false,
                                        }}
                                    />
                                </FormControl>
                                <FormMessage>{taskErrors?.boilerplateCode?.message}</FormMessage>
                            </FormItem>
                        )}
                    />
                    <div className="space-y-2">
                        <FormLabel className="text-xs flex items-center gap-1">
                            Тест-кейсы
                            <FormDescription className="text-xs">(Обязательны для проверки)</FormDescription>
                        </FormLabel>
                        {testCaseFields.map((tcField, tcIndex) => (
                            <TestCaseEditor
                                key={tcField.id}
                                control={control}
                                taskIndex={index}
                                testCaseIndex={tcIndex}
                                removeTestCase={removeTestCase}
                                isSubmitting={isSubmitting}
                                testCaseErrors={
                                    taskErrors?.testCases?.[tcIndex] as FieldErrors<AdminTestCaseDTO> | undefined
                                }
                            />
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() =>
                                appendTestCase({
                                    id: uuidv4(),
                                    name: '',
                                    input: [],
                                    expectedOutput: [],
                                    isHidden: false,
                                    points: 1,
                                })
                            }
                            disabled={isSubmitting}
                        >
                            <PlusCircle className="mr-1 h-3.5 w-3.5" /> Добавить тест-кейс
                        </Button>
                        <FormMessage>
                            {(taskErrors?.testCases as any)?.message || (taskErrors?.testCases as any)?.root?.message}
                        </FormMessage>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <FormField
                            control={control}
                            name={`tasks.${index}.timeoutSeconds`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">Таймаут (сек)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="10"
                                            {...field}
                                            value={field.value ?? ''}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value === '' ? null : parseInt(e.target.value, 10)
                                                )
                                            }
                                            disabled={isSubmitting}
                                            className="h-9"
                                        />
                                    </FormControl>
                                    <FormMessage>{taskErrors?.timeoutSeconds?.message}</FormMessage>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name={`tasks.${index}.memoryLimitMb`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">Лимит памяти (МБ)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="128"
                                            {...field}
                                            value={field.value ?? ''}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value === '' ? null : parseInt(e.target.value, 10)
                                                )
                                            }
                                            disabled={isSubmitting}
                                            className="h-9"
                                        />
                                    </FormControl>
                                    <FormMessage>{taskErrors?.memoryLimitMb?.message}</FormMessage>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
            )}
            {taskType === TaskType.MULTIPLE_CHOICE && (
                <div className="space-y-2 border-l-2 border-dashed pl-3 ml-1 border-blue-500/30">
                    <FormLabel className="text-xs text-blue-600 dark:text-blue-400">
                        Варианты ответа (для выбора нескольких)
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
        </div>
    );
};

export default TaskItem;
