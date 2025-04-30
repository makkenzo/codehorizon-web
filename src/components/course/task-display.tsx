import { Task } from '@/types';

interface TaskDisplayProps {
    task: Task;
    index: number;
}

const TaskDisplay: React.FC<TaskDisplayProps> = ({ task, index }) => {
    return (
        <div className="not-prose border border-border p-4 rounded-md mb-4 bg-muted/30">
            <p className="font-semibold mb-2">Задание {index + 1}:</p>
            <p className="mb-3">{task.question}</p>
            {task.correctAnswer && (
                <details className="text-sm">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        Показать решение
                    </summary>
                    <pre className="mt-2 bg-[#282c34] text-white p-3 rounded overflow-x-auto">
                        <code>{task.correctAnswer}</code>
                    </pre>
                </details>
            )}
        </div>
    );
};

export default TaskDisplay;
