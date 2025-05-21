import { useEffect, useState } from 'react';

import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import ReactCodeMirror from '@uiw/react-codemirror';
import { motion } from 'framer-motion';
import { AlertTriangle, Check, CheckCircle, HelpCircle, Loader2, Send, TerminalSquare, X, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { shallow } from 'zustand/shallow';

import { cn } from '@/lib/utils';
import { submissionApiClient } from '@/server/submission';
import { useLessonTasksStore } from '@/stores/tasks/tasks-store-provider';
import { SubmissionStatus, SubmitAnswerPayload, Task, TaskType, TestRunResult } from '@/types/task';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Skeleton } from '../ui/skeleton';
import { Textarea } from '../ui/textarea';

interface TaskDisplayProps {
    task: Task;
    index: number;
    lessonKey: string | null;
    courseId: string;
    lessonId: string;
}

const TaskDisplay: React.FC<TaskDisplayProps> = ({ task, index, lessonKey, courseId, lessonId }) => {
    const { initializeOrUpdateSubmission, submissionDetails, submissions } = useLessonTasksStore((state) => {
        const taskSpecificKey = lessonKey ? `${lessonKey}_task_${task.id}` : null;
        return {
            submissionDetails: taskSpecificKey ? state.submissions[taskSpecificKey] : undefined,
            initializeOrUpdateSubmission: state.initializeOrUpdateSubmission,
            submissions: state.submissions,
        };
    }, shallow);

    const [currentCode, setCurrentCode] = useState(task.boilerplateCode || '');
    const [textAnswer, setTextAnswer] = useState('');
    const [selectedOption, setSelectedOption] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingInitialSubmission, setIsLoadingInitialSubmission] = useState(true);
    const [showSolution, setShowSolution] = useState(false);

    useEffect(() => {
        const fetchLatestSubmission = async () => {
            if (!lessonKey) {
                setIsLoadingInitialSubmission(false);
                return;
            }
            setIsLoadingInitialSubmission(true);
            try {
                const latestSub = await submissionApiClient.getMyLatestSubmissionForTask(task.id);
                if (latestSub) {
                    initializeOrUpdateSubmission(lessonKey, task.id, latestSub);
                } else {
                    const initialBoilerplate = task.taskType === TaskType.CODE_INPUT ? task.boilerplateCode || '' : '';
                    initializeOrUpdateSubmission(lessonKey, task.id, {
                        id: `local-${task.id}-${Date.now()}`,
                        taskId: task.id,
                        userId: '',
                        courseId: '',
                        lessonId: '',
                        submittedAt: new Date().toISOString(),
                        status: SubmissionStatus.PENDING,
                        answerCode: initialBoilerplate,
                        answerText: '',
                        language: task.language,
                        testRunResults: [],
                    });
                }
            } catch (error) {
                console.error('Failed to fetch latest submission:', error);
                const initialBoilerplate = task.taskType === TaskType.CODE_INPUT ? task.boilerplateCode || '' : '';
                initializeOrUpdateSubmission(lessonKey, task.id, {
                    id: `local-error-${task.id}-${Date.now()}`,
                    taskId: task.id,
                    userId: '',
                    courseId: '',
                    lessonId: '',
                    submittedAt: new Date().toISOString(),
                    status: SubmissionStatus.PENDING,
                    answerCode: initialBoilerplate,
                    answerText: '',
                    language: task.language,
                    testRunResults: [],
                });
            } finally {
                setIsLoadingInitialSubmission(false);
            }
        };
        fetchLatestSubmission();
    }, [task.id, lessonKey, initializeOrUpdateSubmission, task.boilerplateCode, task.taskType]);

    useEffect(() => {
        if (submissionDetails) {
            setCurrentCode(submissionDetails.answerCode || task.boilerplateCode || '');
            if (task.taskType === TaskType.MULTIPLE_CHOICE) {
                setSelectedOption(submissionDetails.answerText || '');
            } else {
                setTextAnswer(submissionDetails.answerText || '');
            }
        } else {
            setCurrentCode(task.boilerplateCode || '');
            setTextAnswer('');
            setSelectedOption('');
        }
    }, [submissionDetails, task.boilerplateCode, task.taskType]);

    const handleSubmitAnswer = async () => {
        if (!lessonKey) return;
        setIsSubmitting(true);

        const payload: SubmitAnswerPayload = { courseId, lessonId, taskId: task.id };
        if (task.taskType === TaskType.CODE_INPUT) {
            payload.language = task.language || 'python';
            payload.answerCode = currentCode;
        } else if (task.taskType === TaskType.TEXT_INPUT) {
            payload.answerText = textAnswer;
        } else if (task.taskType === TaskType.MULTIPLE_CHOICE) {
            payload.answerText = selectedOption;
        }

        try {
            const newSubmission = await submissionApiClient.submitAnswer(payload);
            initializeOrUpdateSubmission(lessonKey, task.id, newSubmission);
            toast.info(`Ответ на задание "${task.description.substring(0, 20)}..." отправлен. Ожидаем результат...`);
            pollSubmissionStatus(newSubmission.id, lessonKey, task.id);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Не удалось отправить ответ.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const pollSubmissionStatus = (submissionId: string, lKey: string, tId: string) => {
        let attempts = 0;
        const maxAttempts = 20;
        const interval = setInterval(async () => {
            attempts++;
            if (attempts > maxAttempts) {
                clearInterval(interval);
                toast.warning(
                    `Проверка задания "${task.description.substring(0, 20)}..." занимает слишком много времени. Результат будет доступен позже.`
                );
                const currentSub = submissions[`${lKey}_task_${tId}`];
                if (currentSub && currentSub.status === SubmissionStatus.CHECKING) {
                    initializeOrUpdateSubmission(lKey, tId, {
                        ...currentSub,
                        status: SubmissionStatus.PENDING,
                        feedback: 'Проверка заняла слишком много времени. Обновите позже.',
                    });
                }
                return;
            }
            try {
                const updatedSubmission = await submissionApiClient.getSubmissionDetails(submissionId);
                initializeOrUpdateSubmission(lKey, tId, updatedSubmission);
                if (
                    updatedSubmission.status !== SubmissionStatus.PENDING &&
                    updatedSubmission.status !== SubmissionStatus.CHECKING
                ) {
                    clearInterval(interval);
                }
            } catch (error) {
                console.error('Polling error:', error);
                clearInterval(interval);
            }
        }, 3000);
    };

    useEffect(() => {
        if (
            submissionDetails &&
            submissionDetails.status !== SubmissionStatus.PENDING &&
            submissionDetails.status !== SubmissionStatus.CHECKING
        ) {
            const taskTitlePreview = task.description.substring(0, 20) + '...';
            switch (submissionDetails.status) {
                case SubmissionStatus.CORRECT:
                    toast.success(`Задание "${taskTitlePreview}" решено верно!`);
                    break;
                case SubmissionStatus.INCORRECT:
                case SubmissionStatus.PARTIALLY_CORRECT:
                    toast.error(`Задание "${taskTitlePreview}" решено неверно. ${submissionDetails.feedback || ''}`);
                    break;
                case SubmissionStatus.ERROR:
                    toast.error(
                        `Ошибка проверки задания "${taskTitlePreview}". ${submissionDetails.feedback || submissionDetails.compileErrorMessage || ''}`
                    );
                    break;
                case SubmissionStatus.TIMEOUT:
                    toast.warning(`Проверка задания "${taskTitlePreview}" превысила лимит времени.`);
                    break;
            }
        }
    }, [
        submissionDetails?.status,
        submissionDetails?.feedback,
        submissionDetails?.compileErrorMessage,
        task.description,
    ]);

    const getLanguageExtension = () => {
        if (task.language?.toLowerCase() === 'python') return python();
        if (task.language?.toLowerCase() === 'javascript') return javascript({ jsx: true, typescript: true });
        return [];
    };

    const renderTaskInput = () => {
        switch (task.taskType) {
            case TaskType.CODE_INPUT:
                return (
                    <ReactCodeMirror
                        value={currentCode}
                        height="200px"
                        extensions={[getLanguageExtension()]}
                        onChange={(value) => setCurrentCode(value)}
                        className="text-sm border border-input rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-ring"
                        readOnly={!canSubmit || isSubmitting}
                        basicSetup={{
                            foldGutter: false,
                            dropCursor: false,
                            allowMultipleSelections: false,
                            indentOnInput: false,
                        }}
                    />
                );
            case TaskType.TEXT_INPUT:
                return (
                    <Textarea
                        placeholder="Введите ваш ответ..."
                        value={textAnswer}
                        onChange={(e) => setTextAnswer(e.target.value)}
                        className="min-h-[100px]"
                        rows={4}
                        disabled={!canSubmit || isSubmitting}
                    />
                );
            case TaskType.MULTIPLE_CHOICE:
                return (
                    <RadioGroup
                        value={selectedOption}
                        onValueChange={setSelectedOption}
                        disabled={!canSubmit || isSubmitting}
                        className="space-y-2"
                    >
                        {task.options?.map((option, i) => (
                            <div
                                key={i}
                                className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted/50 transition-colors"
                            >
                                <RadioGroupItem value={option} id={`task-${task.id}-option-${i}`} />
                                <Label htmlFor={`task-${task.id}-option-${i}`} className="cursor-pointer flex-grow">
                                    {option}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                );
            default:
                return <p className="text-muted-foreground">Неизвестный тип задачи.</p>;
        }
    };

    const renderStatusBadge = () => {
        if (!submissionDetails || (submissionDetails.status === SubmissionStatus.PENDING && !isSubmitting)) return null;

        let badgeVariant: 'default' | 'destructive' | 'outline' | 'secondary' = 'outline';
        let icon = <HelpCircle className="h-4 w-4" />;
        let text = submissionDetails.status.replace('_', ' ');

        switch (submissionDetails.status) {
            case SubmissionStatus.CORRECT:
                badgeVariant = 'default'; // Успешный зеленый
                icon = <CheckCircle className="h-4 w-4" />;
                text = 'Решено';
                break;
            case SubmissionStatus.INCORRECT:
            case SubmissionStatus.ERROR:
            case SubmissionStatus.TIMEOUT:
                badgeVariant = 'destructive';
                icon = <XCircle className="h-4 w-4" />;
                break;
            case SubmissionStatus.CHECKING:
                badgeVariant = 'default'; // Желтый
                icon = <Loader2 className="h-4 w-4 animate-spin" />;
                text = 'Проверка...';
                break;
            case SubmissionStatus.PARTIALLY_CORRECT:
                badgeVariant = 'default';
                icon = <AlertTriangle className="h-4 w-4" />;
                break;
        }
        if (isSubmitting && submissionDetails.status === SubmissionStatus.PENDING) {
            icon = <Loader2 className="h-4 w-4 animate-spin" />;
            text = 'Отправка...';
        }

        return (
            <Badge
                variant={badgeVariant}
                className={cn(
                    'text-xs',
                    submissionDetails.status === SubmissionStatus.CORRECT &&
                        'bg-green-500/15 text-green-700 border-green-500/30 dark:text-green-300 dark:border-green-500/50 dark:bg-green-500/20',
                    (submissionDetails.status === SubmissionStatus.INCORRECT ||
                        submissionDetails.status === SubmissionStatus.ERROR ||
                        submissionDetails.status === SubmissionStatus.TIMEOUT) &&
                        'bg-red-500/15 text-red-700 border-red-500/30 dark:text-red-300 dark:border-red-500/50 dark:bg-red-500/20',
                    submissionDetails.status === SubmissionStatus.CHECKING &&
                        'bg-yellow-500/15 text-yellow-700 border-yellow-500/30 dark:text-yellow-300 dark:border-yellow-500/50 dark:bg-yellow-500/20',
                    submissionDetails.status === SubmissionStatus.PARTIALLY_CORRECT &&
                        'bg-orange-500/15 text-orange-700 border-orange-500/30 dark:text-orange-300 dark:border-orange-500/50 dark:bg-orange-500/20'
                )}
            >
                {icon}
                <span className="ml-1.5">{text}</span>
            </Badge>
        );
    };

    const renderOutputDetails = (label: string, content: string | null | undefined, isError = false) => {
        if (!content) return null;

        let displayContent = content;
        if (
            label.toLowerCase().includes('json') ||
            (content.trim().startsWith('{') && content.trim().endsWith('}')) ||
            (content.trim().startsWith('[') && content.trim().endsWith(']'))
        ) {
            try {
                const jsonObj = JSON.parse(content);
                displayContent = JSON.stringify(jsonObj, null, 2);
            } catch (e) {}
        }

        return (
            <pre
                className={cn(
                    'mt-1 p-2.5 rounded-md text-xs whitespace-pre-wrap max-h-60 overflow-y-auto custom-scrollbar',
                    'font-mono',
                    isError
                        ? 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400'
                        : 'bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 text-gray-800 dark:text-gray-200'
                )}
            >
                <code>{displayContent}</code>
            </pre>
        );
    };

    const renderTestResultItem = (result: TestRunResult, idx: number) => (
        <motion.li
            key={result.testCaseId || `test-${idx}`}
            className={cn(
                'text-xs p-3 rounded-md border',
                result.passed
                    ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300'
                    : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-700 dark:text-red-400'
            )}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
        >
            <div className="flex items-center font-medium">
                {result.passed ? (
                    <Check className="h-4 w-4 mr-1.5 shrink-0" />
                ) : (
                    <X className="h-4 w-4 mr-1.5 shrink-0" />
                )}
                {result.testCaseName || `Тест #${result.testCaseId.slice(-4)}`}:{' '}
                {result.passed ? 'Пройден' : 'Не пройден'}
                {result.executionTimeMs != null && (
                    <span className="ml-auto text-xs opacity-70">{result.executionTimeMs}ms</span>
                )}
            </div>
            {(!result.passed || result.actualOutput || result.expectedOutput) && (
                <div className="mt-1.5 pl-5 text-xs opacity-90 space-y-1 font-mono">
                    {result.expectedOutput && result.expectedOutput.length > 0 && (
                        <div>
                            Ожидалось:{' '}
                            <code className="bg-black/5 dark:bg-white/5 px-1 py-0.5 rounded">
                                {result.expectedOutput.join('\\n')}
                            </code>
                        </div>
                    )}
                    {result.actualOutput && result.actualOutput.length > 0 && (
                        <div>
                            Получено:{' '}
                            <code className="bg-black/5 dark:bg-white/5 px-1 py-0.5 rounded">
                                {result.actualOutput.join('\\n')}
                            </code>
                        </div>
                    )}
                    {result.errorMessage && (
                        <div className="text-red-600 dark:text-red-400">Ошибка: {result.errorMessage}</div>
                    )}
                </div>
            )}
        </motion.li>
    );

    const renderTestResults = (results: TestRunResult[]) => {
        if (!results || results.length === 0) return null;

        return (
            <Accordion type="single" collapsible className="w-full mt-3">
                <AccordionItem value="test-results">
                    <AccordionTrigger className="text-xs font-semibold text-muted-foreground hover:no-underline py-2">
                        Показать/скрыть детали тестов ({results.filter((r) => r.passed).length}/{results.length}{' '}
                        пройдено)
                    </AccordionTrigger>
                    <AccordionContent className="pt-2">
                        <ul className="list-none p-0 space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                            {results.map((result) => (
                                <li
                                    key={result.testCaseId}
                                    className={cn(
                                        'text-xs flex flex-col p-2.5 rounded-md border',
                                        result.passed
                                            ? 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300'
                                            : 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300'
                                    )}
                                >
                                    <div className="flex items-center font-medium">
                                        {result.passed ? (
                                            <Check className="h-4 w-4 mr-1.5 shrink-0" />
                                        ) : (
                                            <X className="h-4 w-4 mr-1.5 shrink-0" />
                                        )}
                                        {result.testCaseName || `Тест #${result.testCaseId.slice(-4)}`}:{' '}
                                        {result.passed ? 'Пройден' : 'Не пройден'}
                                        {result.executionTimeMs != null && (
                                            <span className="ml-auto text-xs opacity-70">
                                                {result.executionTimeMs}ms
                                            </span>
                                        )}
                                    </div>
                                    {(!result.passed || result.actualOutput || result.expectedOutput) && (
                                        <div className="mt-1.5 pl-5 text-xs opacity-90 space-y-1">
                                            {result.expectedOutput && (
                                                <div>
                                                    Ожидалось:{' '}
                                                    <code className="bg-black/5 dark:bg-white/5 px-1 py-0.5 rounded text-xs">
                                                        {result.expectedOutput.join('\\n')}
                                                    </code>
                                                </div>
                                            )}
                                            {result.actualOutput && (
                                                <div>
                                                    Получено:{' '}
                                                    <code className="bg-black/5 dark:bg-white/5 px-1 py-0.5 rounded text-xs">
                                                        {result.actualOutput.join('\\n')}
                                                    </code>
                                                </div>
                                            )}
                                            {result.errorMessage && (
                                                <div className="font-mono">Ошибка: {result.errorMessage}</div>
                                            )}
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        );
    };

    if (isLoadingInitialSubmission) {
        return (
            <Card className="mb-6 animate-pulse">
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-1" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-32 w-full" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-9 w-full max-w-xs" />
                </CardFooter>
            </Card>
        );
    }

    const isTaskCorrect = submissionDetails?.status === SubmissionStatus.CORRECT;
    const isEffectivelyPendingOrCheckingOnServer =
        submissionDetails &&
        (submissionDetails.status === SubmissionStatus.CHECKING ||
            (submissionDetails.status === SubmissionStatus.PENDING &&
                submissionDetails.id &&
                !submissionDetails.id.startsWith('local-')));
    const isTaskChecking = isSubmitting || isEffectivelyPendingOrCheckingOnServer;
    const canSubmit = !isTaskCorrect && !isTaskChecking;

    return (
        <Card
            className={cn(
                'mb-6 relative group transition-all duration-300 ease-in-out',
                submissionDetails?.status === SubmissionStatus.CORRECT
                    ? 'border-green-400 dark:border-green-600 bg-green-500/5 dark:bg-green-500/10 shadow-green-500/10'
                    : submissionDetails?.status === SubmissionStatus.INCORRECT ||
                        submissionDetails?.status === SubmissionStatus.ERROR ||
                        submissionDetails?.status === SubmissionStatus.TIMEOUT
                      ? 'border-red-400 dark:border-red-600 bg-red-500/5 dark:bg-red-500/10 shadow-red-500/10'
                      : 'border-border hover:shadow-md dark:hover:border-primary/30'
            )}
        >
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="flex items-center gap-2 text-base md:text-lg">Задание {index + 1}</CardTitle>
                    {renderStatusBadge()}
                </div>
                <CardDescription
                    dangerouslySetInnerHTML={{ __html: task.description }}
                    className="prose dark:prose-invert max-w-none text-sm"
                />
            </CardHeader>
            <CardContent>
                {renderTaskInput()}
                {submissionDetails?.compileErrorMessage && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md">
                        <p className="text-xs font-semibold text-red-600 dark:text-red-300 flex items-center">
                            <TerminalSquare className="h-4 w-4 mr-1.5" />
                            Ошибка компиляции/импорта:
                        </p>
                        <pre className="mt-1 text-xs whitespace-pre-wrap text-red-700 dark:text-red-400 max-h-28 overflow-y-auto custom-scrollbar">
                            <code>{submissionDetails.compileErrorMessage}</code>
                        </pre>
                    </div>
                )}
                {submissionDetails?.stdout && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/30 border rounded-md">
                        <p className="text-xs font-semibold text-muted-foreground flex items-center">
                            <TerminalSquare className="h-4 w-4 mr-1.5" />
                            Вывод программы (stdout):
                        </p>
                        {renderOutputDetails('Стандартный вывод (stdout)', submissionDetails?.stdout)}
                    </div>
                )}
                {submissionDetails?.stderr && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md">
                        <p className="text-xs font-semibold text-red-600 dark:text-red-300 flex items-center">
                            <TerminalSquare className="h-4 w-4 mr-1.5" />
                            Ошибки выполнения (stderr):
                        </p>

                        <pre className="mt-1 language:json text-xs whitespace-pre-wrap text-red-700 dark:text-red-400 max-h-28 overflow-y-auto custom-scrollbar">
                            <code>{submissionDetails.stderr}</code>
                        </pre>
                    </div>
                )}
                {submissionDetails?.testRunResults && renderTestResults(submissionDetails.testRunResults)}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2 justify-between items-center pt-3 border-t">
                <div className="flex gap-2 flex-wrap">
                    <Button
                        onClick={handleSubmitAnswer}
                        disabled={!canSubmit}
                        isLoading={isSubmitting || submissionDetails?.status === SubmissionStatus.CHECKING}
                        size="sm"
                        variant={submissionDetails?.status === SubmissionStatus.CORRECT ? 'outline' : 'default'}
                    >
                        {submissionDetails?.status === SubmissionStatus.CORRECT ? (
                            <>
                                <Check size={16} className="mr-1.5" /> Решено
                            </>
                        ) : submissionDetails?.status === SubmissionStatus.CHECKING ? (
                            <>
                                <Loader2 size={16} className="mr-1.5 animate-spin" /> Проверка...
                            </>
                        ) : (
                            <>
                                <Send size={16} className="mr-1.5" /> Отправить
                            </>
                        )}
                    </Button>
                    {task.solution && submissionDetails?.status !== SubmissionStatus.CORRECT && (
                        <Button
                            onClick={() => setShowSolution(!showSolution)}
                            variant="ghost"
                            size="sm"
                            disabled={isSubmitting || submissionDetails?.status === SubmissionStatus.CHECKING}
                        >
                            {showSolution ? 'Скрыть решение' : 'Показать решение'}
                        </Button>
                    )}
                </div>
                {submissionDetails?.checkedAt && (
                    <p className="text-xs text-muted-foreground whitespace-nowrap mt-2 sm:mt-0">
                        Проверено:{' '}
                        {new Date(submissionDetails.checkedAt).toLocaleString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </p>
                )}
            </CardFooter>

            {showSolution && task.solution && submissionDetails?.status !== SubmissionStatus.CORRECT && (
                <CardContent className="border-t pt-3">
                    <p className="text-sm font-medium mb-1 text-muted-foreground">Эталонное решение:</p>
                    <pre className="bg-muted/30 dark:bg-muted/20 text-muted-foreground p-3 rounded-md overflow-x-auto text-sm custom-scrollbar">
                        <code>{task.solution}</code>
                    </pre>
                </CardContent>
            )}
        </Card>
    );
};

export default TaskDisplay;
