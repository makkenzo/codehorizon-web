import { useEffect, useState } from 'react';

import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import ReactCodeMirror from '@uiw/react-codemirror';
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

    const renderInput = () => {
        switch (task.taskType) {
            case TaskType.CODE_INPUT:
                return (
                    <ReactCodeMirror
                        value={currentCode}
                        height="200px"
                        extensions={[getLanguageExtension()]}
                        onChange={(value) => setCurrentCode(value)}
                        className="text-sm border border-input rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-ring"
                        readOnly={
                            isSubmitting ||
                            submissionDetails?.status === SubmissionStatus.CORRECT ||
                            submissionDetails?.status === SubmissionStatus.CHECKING
                        }
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
                        disabled={
                            isSubmitting ||
                            submissionDetails?.status === SubmissionStatus.CORRECT ||
                            submissionDetails?.status === SubmissionStatus.CHECKING
                        }
                    />
                );
            case TaskType.MULTIPLE_CHOICE:
                return (
                    <RadioGroup
                        value={selectedOption}
                        onValueChange={setSelectedOption}
                        disabled={
                            isSubmitting ||
                            submissionDetails?.status === SubmissionStatus.CORRECT ||
                            submissionDetails?.status === SubmissionStatus.CHECKING
                        }
                        className="space-y-2"
                    >
                        {task.options?.map((option, i) => (
                            <div
                                key={i}
                                className="flex items-center space-x-2 p-2 border rounded-md hover:bg-muted/50 transition-colors"
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

    const renderStatusIconAndText = () => {
        if (!submissionDetails || isLoadingInitialSubmission)
            return <HelpCircle className="h-5 w-5 text-muted-foreground" />;
        switch (submissionDetails.status) {
            case SubmissionStatus.CORRECT:
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case SubmissionStatus.INCORRECT:
            case SubmissionStatus.ERROR:
            case SubmissionStatus.TIMEOUT:
                return <XCircle className="h-5 w-5 text-red-500" />;
            case SubmissionStatus.CHECKING:
            case SubmissionStatus.PENDING:
                return <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />;
            case SubmissionStatus.PARTIALLY_CORRECT:
                return <AlertTriangle className="h-5 w-5 text-orange-500" />;
            default:
                return <HelpCircle className="h-5 w-5 text-muted-foreground" />;
        }
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

    const canSubmit =
        !isSubmitting &&
        submissionDetails?.status !== SubmissionStatus.CORRECT &&
        submissionDetails?.status !== SubmissionStatus.CHECKING;

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
                    <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                        {renderStatusIconAndText()}
                        Задание {index + 1}
                    </CardTitle>
                    {submissionDetails?.status && submissionDetails.status !== SubmissionStatus.PENDING && (
                        <Badge
                            variant="outline"
                            className={cn(
                                'text-xs',
                                submissionDetails.status === SubmissionStatus.CORRECT &&
                                    'border-green-500 text-green-600 bg-green-500/10',
                                submissionDetails.status === SubmissionStatus.INCORRECT &&
                                    'border-red-500 text-red-600 bg-red-500/10',
                                submissionDetails.status === SubmissionStatus.CHECKING &&
                                    'border-yellow-500 text-yellow-600 bg-yellow-500/10 animate-pulse',
                                submissionDetails.status === SubmissionStatus.ERROR &&
                                    'border-destructive text-destructive-foreground bg-destructive/10'
                            )}
                        >
                            {submissionDetails.status.replace('_', ' ')}
                        </Badge>
                    )}
                </div>
                <CardDescription
                    dangerouslySetInnerHTML={{ __html: task.description }}
                    className="prose dark:prose-invert max-w-none text-sm"
                />
            </CardHeader>
            <CardContent>
                {renderInput()}
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
