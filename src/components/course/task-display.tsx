import { useEffect, useState } from 'react';

import { Check, HelpCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { shallow } from 'zustand/shallow';

import { cn } from '@/lib/utils';
import { useLessonTasksStore } from '@/stores/tasks/tasks-store-provider';
import { Task, TaskType } from '@/types';

import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Textarea } from '../ui/textarea';

interface TaskDisplayProps {
    task: Task;
    index: number;
    lessonKey: string | null;
}

const TaskDisplay: React.FC<TaskDisplayProps> = ({ task, index, lessonKey }) => {
    const { userAnswer, checkStatus, updateUserAnswer, updateCheckStatus } = useLessonTasksStore((state) => {
        const taskState = lessonKey ? state.lessons[lessonKey]?.tasks[task.id] : undefined;

        return {
            userAnswer: taskState?.userAnswer ?? '',
            checkStatus: taskState?.checkStatus ?? null,
            updateUserAnswer: state.updateUserAnswer,
            updateCheckStatus: state.updateCheckStatus,
        };
    }, shallow);

    const [showSolution, setShowSolution] = useState<boolean>(false);
    const [isChecking, setIsChecking] = useState<boolean>(false);

    useEffect(() => {
        setShowSolution(false);
        setIsChecking(false);
    }, [task.id]);

    const handleInputChange = (value: string) => {
        if (lessonKey) {
            updateUserAnswer(lessonKey, task.id, value);
        }
    };

    const handleCheckAnswer = () => {
        if (!lessonKey) return;

        if (!task.solution) {
            setShowSolution(true);
            updateCheckStatus(lessonKey, task.id, true);
            return;
        }

        setIsChecking(true);
        updateCheckStatus(lessonKey, task.id, null);

        setTimeout(() => {
            const isCorrect = userAnswer.trim().toLowerCase() === task.solution?.trim().toLowerCase();
            updateCheckStatus(lessonKey, task.id, isCorrect);
            setIsChecking(false);

            if (isCorrect) {
                toast.success(`Задание ${index + 1}: Правильно!`);
            } else {
                toast.error(`Задание ${index + 1}: Неправильно. Попробуйте еще раз.`);
            }
        }, 500);
    };

    const handleShowSolution = () => {
        if (!lessonKey) return;
        const willShow = !showSolution;
        setShowSolution(willShow);
        if (willShow && task.solution) {
            updateCheckStatus(lessonKey, task.id, null);
        }
    };

    const renderInput = () => {
        const inputBorderClass = cn(
            'min-h-[100px] font-mono text-sm',
            checkStatus === true ? 'border-success ring-success/30 focus-visible:ring-success/50' : '',
            checkStatus === false ? 'border-destructive ring-destructive/30 focus-visible:ring-destructive/50' : ''
        );
        const radioGroupClass = cn(
            'space-y-2',
            checkStatus === true ? 'text-success' : '',
            checkStatus === false ? 'text-destructive' : ''
        );

        switch (task.taskType) {
            case TaskType.TEXT_INPUT:
            case TaskType.CODE_INPUT:
                return (
                    <Textarea
                        placeholder={
                            task.taskType === TaskType.CODE_INPUT ? '// Введите ваш код...' : 'Введите ваш ответ...'
                        }
                        value={userAnswer}
                        onChange={(e) => handleInputChange(e.target.value)}
                        className={inputBorderClass}
                        rows={task.taskType === TaskType.CODE_INPUT ? 10 : 4}
                        disabled={isChecking || checkStatus === true}
                    />
                );
            case TaskType.MULTIPLE_CHOICE:
                return (
                    <RadioGroup
                        value={userAnswer}
                        onValueChange={handleInputChange}
                        disabled={isChecking || checkStatus === true}
                        className={radioGroupClass}
                    >
                        {task.options?.map((option, i) => (
                            <div key={i} className="flex items-center space-x-2">
                                <RadioGroupItem value={option} id={`task-${task.id}-option-${i}`} />
                                <Label htmlFor={`task-${task.id}-option-${i}`}>{option}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                );
            default:
                return <p className="text-muted-foreground">Неизвестный тип задачи.</p>;
        }
    };

    return (
        <div
            className={cn(
                'not-prose border p-4 rounded-md mb-6 bg-card shadow-sm relative group',
                checkStatus === true ? 'border-success bg-success/5' : 'border-border',
                checkStatus === false ? 'border-destructive bg-destructive/5' : ''
            )}
        >
            <p className="font-semibold mb-2 flex items-center gap-2">
                {checkStatus === true ? (
                    <Check className="h-5 w-5 text-success" />
                ) : checkStatus === false ? (
                    <X className="h-5 w-5 text-destructive" />
                ) : (
                    <HelpCircle className="h-5 w-5 text-primary" />
                )}
                Задание {index + 1}:
            </p>
            <p className="mb-4 text-card-foreground/90">{task.description}</p>

            <div className="mb-4">{renderInput()}</div>

            <div className="flex flex-wrap gap-2">
                <Button
                    onClick={handleCheckAnswer}
                    disabled={!userAnswer || isChecking || checkStatus === true}
                    isLoading={isChecking}
                    size="sm"
                >
                    {checkStatus === true ? 'Решено верно' : isChecking ? 'Проверка...' : 'Проверить ответ'}
                </Button>
                {task.solution && (
                    <Button
                        onClick={handleShowSolution}
                        variant="outline"
                        size="sm"
                        disabled={!userAnswer || isChecking || checkStatus === true}
                    >
                        {showSolution ? 'Скрыть решение' : 'Показать решение'}
                    </Button>
                )}
            </div>

            {showSolution && task.solution && (
                <div className="mt-4 border-t border-dashed pt-3">
                    <p className="text-sm font-medium mb-2 text-muted-foreground">Решение:</p>
                    <pre className="bg-[#282c34] text-white p-3 rounded overflow-x-auto text-sm">
                        <code>{task.solution}</code>
                    </pre>
                </div>
            )}
        </div>
    );
};

export default TaskDisplay;
