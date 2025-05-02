import { useEffect, useState } from 'react';

import { Check, HelpCircle, X } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Task, TaskType } from '@/types';

import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Textarea } from '../ui/textarea';

interface TaskDisplayProps {
    task: Task;
    index: number;
    onStatusChange: (isCorrect: boolean | null) => void;
    currentStatus?: boolean | null;
}

const TaskDisplay: React.FC<TaskDisplayProps> = ({ task, index, onStatusChange, currentStatus }) => {
    const [userAnswer, setUserAnswer] = useState<string>('');
    const [showSolution, setShowSolution] = useState<boolean>(false);

    const [isChecking, setIsChecking] = useState<boolean>(false);

    useEffect(() => {
        setUserAnswer('');
        setShowSolution(false);
        setIsChecking(false);
    }, [task.id]);

    const handleCheckAnswer = () => {
        if (!task.solution) {
            setShowSolution(true);
            onStatusChange(true);
            return;
        }

        setIsChecking(true);
        setShowSolution(false);
        onStatusChange(null);

        setTimeout(() => {
            const isCorrect = userAnswer.trim().toLowerCase() === task.solution?.trim().toLowerCase();
            onStatusChange(isCorrect);
            setIsChecking(false);

            if (isCorrect) {
                toast.success(`Задание ${index + 1}: Правильно!`);
            } else {
                toast.error(`Задание ${index + 1}: Неправильно. Попробуйте еще раз.`);
            }
        }, 500);
    };

    const handleShowSolution = () => {
        setShowSolution((prev) => !prev);
        if (!showSolution && task.solution) {
            onStatusChange(null);
        }
    };

    const renderInput = () => {
        const inputBorderClass = cn(
            'min-h-[100px] font-mono text-sm',
            currentStatus === true ? 'border-success ring-success/30 focus-visible:ring-success/50' : '',
            currentStatus === false ? 'border-destructive ring-destructive/30 focus-visible:ring-destructive/50' : ''
        );
        const radioGroupClass = cn(
            'space-y-2',
            currentStatus === true ? 'text-success' : '',
            currentStatus === false ? 'text-destructive' : ''
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
                        onChange={(e) => {
                            setUserAnswer(e.target.value);
                            if (currentStatus !== null) onStatusChange(null);
                        }}
                        className={inputBorderClass}
                        rows={task.taskType === TaskType.CODE_INPUT ? 10 : 4}
                        disabled={isChecking || currentStatus === true}
                    />
                );
            case TaskType.MULTIPLE_CHOICE:
                return (
                    <RadioGroup
                        value={userAnswer}
                        onValueChange={(value) => {
                            setUserAnswer(value);
                            if (currentStatus !== null) onStatusChange(null);
                        }}
                        disabled={isChecking || currentStatus === true}
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
                currentStatus === true ? 'border-success bg-success/5' : 'border-border',
                currentStatus === false ? 'border-destructive bg-destructive/5' : ''
            )}
        >
            <p className="font-semibold mb-2 flex items-center gap-2">
                {currentStatus === true ? (
                    <Check className="h-5 w-5 text-success" />
                ) : currentStatus === false ? (
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
                    disabled={!userAnswer || isChecking || currentStatus === true}
                    isLoading={isChecking}
                    size="sm"
                >
                    {currentStatus === true ? 'Решено верно' : isChecking ? 'Проверка...' : 'Проверить ответ'}
                </Button>
                {task.solution && (
                    <Button
                        onClick={handleShowSolution}
                        variant="outline"
                        size="sm"
                        disabled={!userAnswer || isChecking || currentStatus === true}
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
