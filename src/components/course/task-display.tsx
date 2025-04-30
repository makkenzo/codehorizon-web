import { useState } from 'react';

import { Check, HelpCircle, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Task, TaskType } from '@/types';

import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Textarea } from '../ui/textarea';

interface TaskDisplayProps {
    task: Task;
    index: number;
}

const TaskDisplay: React.FC<TaskDisplayProps> = ({ task, index }) => {
    const [userAnswer, setUserAnswer] = useState<string>('');
    const [showSolution, setShowSolution] = useState<boolean>(false);
    const [checkResult, setCheckResult] = useState<'correct' | 'incorrect' | 'pending' | null>(null);
    const [isChecking, setIsChecking] = useState<boolean>(false);

    const handleCheckAnswer = () => {
        if (!task.solution) {
            setShowSolution(true);
            setCheckResult(null);
            return;
        }

        setIsChecking(true);
        setCheckResult('pending');
        setShowSolution(false);

        setTimeout(() => {
            const isCorrect = userAnswer.trim().toLowerCase() === task.solution?.trim().toLowerCase();
            setCheckResult(isCorrect ? 'correct' : 'incorrect');
            setIsChecking(false);
        }, 500);
    };

    const handleShowSolution = () => {
        setShowSolution((prev) => !prev);
        setCheckResult(null);
    };

    const renderInput = () => {
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
                            setCheckResult(null);
                        }}
                        className={cn(
                            'min-h-[100px] font-mono text-sm',
                            checkResult === 'correct'
                                ? 'border-success ring-success/30 focus-visible:ring-success/50'
                                : '',
                            checkResult === 'incorrect'
                                ? 'border-destructive ring-destructive/30 focus-visible:ring-destructive/50'
                                : ''
                        )}
                        rows={task.taskType === TaskType.CODE_INPUT ? 10 : 4}
                        disabled={isChecking}
                    />
                );
            case TaskType.MULTIPLE_CHOICE:
                return (
                    <RadioGroup
                        value={userAnswer}
                        onValueChange={(value) => {
                            setUserAnswer(value);
                            setCheckResult(null);
                        }}
                        disabled={isChecking}
                        className={cn(
                            'space-y-2',
                            checkResult === 'correct' ? 'text-success' : '',
                            checkResult === 'incorrect' ? 'text-destructive' : ''
                        )}
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
        <div className="not-prose border border-border p-4 rounded-md mb-6 bg-card shadow-sm">
            <p className="font-semibold mb-2 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                Задание {index + 1}:
            </p>
            <p className="mb-4 text-card-foreground/90">{task.description}</p>

            <div className="mb-4">{renderInput()}</div>

            {checkResult && checkResult !== 'pending' && (
                <div
                    className={cn(
                        'flex items-center gap-2 text-sm font-medium mb-3 p-2 rounded-md',
                        checkResult === 'correct' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                    )}
                >
                    {checkResult === 'correct' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    {checkResult === 'correct' ? 'Правильно!' : 'Неправильно, попробуйте еще раз.'}
                </div>
            )}

            <div className="flex flex-wrap gap-2">
                <Button
                    onClick={handleCheckAnswer}
                    disabled={!userAnswer || isChecking}
                    isLoading={isChecking}
                    size="sm"
                >
                    {isChecking ? 'Проверка...' : 'Проверить ответ'}
                </Button>
                {task.solution && (
                    <Button onClick={handleShowSolution} variant="outline" size="sm" disabled={isChecking}>
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
