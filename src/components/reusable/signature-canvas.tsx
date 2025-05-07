import { useCallback, useEffect, useRef, useState } from 'react';

import { Eraser, Redo, Save, Undo } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from '../ui/button';
import { Label } from '../ui/label';

interface SignatureCanvasProps {
    width?: number;
    height?: number;
    penColor?: string;
    backgroundColor?: string;
    onSave: (dataUrl: string) => void;
    initialDataUrl?: string | null;
    disabled?: boolean;
    className?: string;
}

type Point = { x: number; y: number };
type Line = Point[];

const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
    width = 400,
    height = 150,
    penColor = '#000000',
    backgroundColor = '#FFFFFF',
    onSave,
    initialDataUrl,
    disabled = false,
    className,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lines, setLines] = useState<Line[]>([]);
    const [currentLine, setCurrentLine] = useState<Line>([]);
    const [history, setHistory] = useState<Line[][]>([]);
    const [historyStep, setHistoryStep] = useState<number>(-1);

    const getCanvasContext = useCallback(() => {
        return canvasRef.current?.getContext('2d');
    }, []);

    const clearAndDrawImage = useCallback(
        (ctx: CanvasRenderingContext2D, img: HTMLImageElement) => {
            if (!canvasRef.current) return;
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
        },
        [backgroundColor]
    );

    const redrawCanvasWithLines = useCallback(
        (targetLines: Line[]) => {
            const ctx = getCanvasContext();
            if (!ctx || !canvasRef.current) return;

            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

            ctx.strokeStyle = penColor;
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            targetLines.forEach((line) => {
                if (line.length < 2) return;
                ctx.beginPath();
                ctx.moveTo(line[0].x, line[0].y);
                for (let i = 1; i < line.length; i++) {
                    ctx.lineTo(line[i].x, line[i].y);
                }
                ctx.stroke();
            });
        },
        [getCanvasContext, backgroundColor, penColor]
    );

    useEffect(() => {
        const ctx = getCanvasContext();
        if (!ctx || !canvasRef.current) return;

        if (initialDataUrl) {
            const img = new Image();
            img.onload = () => {
                clearAndDrawImage(ctx, img);
                // Если initialDataUrl - это результат рисования, то lines должны быть пустыми,
                // так как изображение уже содержит все линии.
                // Если это URL с сервера, то тоже lines должны быть пустыми.
                setLines([]);
                setCurrentLine([]);
                // Сбрасываем историю, так как загрузили новое "базовое" изображение
                // Если это DataURL, то пользователь может захотеть его "отменить" или дорисовать.
                // Для простоты пока сбрасываем. Можно усложнить, если нужно сохранять историю DataURL.
                setHistory([[]]); // Начинаем новую историю с пустого канваса (но он уже с картинкой)
                setHistoryStep(0);
            };
            img.onerror = () => {
                console.error('Failed to load initial signature image. Clearing canvas.');
                ctx.fillStyle = backgroundColor;
                ctx.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
                setLines([]);
                setCurrentLine([]);
                setHistory([[]]);
                setHistoryStep(0);
            };
            img.src = initialDataUrl;
        } else {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            setLines([]);
            setCurrentLine([]);
            setHistory([[]]);
            setHistoryStep(0);
        }
    }, [initialDataUrl, width, height, getCanvasContext, backgroundColor, clearAndDrawImage]);

    useEffect(() => {
        if (
            !initialDataUrl ||
            (initialDataUrl && lines.length > 0) ||
            (initialDataUrl && historyStep > 0 && history[historyStep] !== lines)
        ) {
            redrawCanvasWithLines(lines);
        }
    }, [lines, redrawCanvasWithLines, initialDataUrl, history, historyStep]);

    const getMousePosition = (event: React.MouseEvent | React.TouchEvent): Point => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if (event.nativeEvent instanceof MouseEvent) {
            clientX = (event.nativeEvent as MouseEvent).clientX;
            clientY = (event.nativeEvent as MouseEvent).clientY;
        } else if (event.nativeEvent instanceof TouchEvent) {
            clientX = (event.nativeEvent as TouchEvent).touches[0].clientX;
            clientY = (event.nativeEvent as TouchEvent).touches[0].clientY;
        } else {
            return { x: 0, y: 0 };
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top,
        };
    };

    const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
        if (disabled) return;

        setIsDrawing(true);
        const pos = getMousePosition(event);
        setCurrentLine([pos]);

        const newHistory = history.slice(0, historyStep + 1);
        setHistory([...newHistory, lines]);
        setHistoryStep(newHistory.length);
    };

    const draw = (event: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || disabled) return;
        const pos = getMousePosition(event);
        const newLine = [...currentLine, pos];
        setCurrentLine(newLine);

        const ctx = getCanvasContext();
        if (ctx && newLine.length > 1) {
            ctx.beginPath();
            ctx.moveTo(newLine[newLine.length - 2].x, newLine[newLine.length - 2].y);
            ctx.lineTo(newLine[newLine.length - 1].x, newLine[newLine.length - 1].y);
            ctx.stroke();
        }
    };

    const stopDrawing = () => {
        if (!isDrawing || disabled) return;
        setIsDrawing(false);

        let newLinesState = lines;
        if (currentLine.length > 1) {
            newLinesState = [...lines, currentLine];
            setLines(newLinesState);
        }
        setCurrentLine([]);

        setHistory((prevHistory) => {
            const updatedHistory = prevHistory.slice(0, historyStep + 1);
            return [...updatedHistory, newLinesState];
        });
        setHistoryStep((prevHistoryStep) => prevHistoryStep + 1);
    };

    const handleClear = () => {
        if (disabled) return;

        const newHistory = history.slice(0, historyStep + 1);
        setHistory([...newHistory, []]);
        setHistoryStep(newHistory.length);

        setLines([]);
        setCurrentLine([]);
        const ctx = getCanvasContext();
        if (ctx && canvasRef.current) {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    const handleSave = () => {
        if (disabled || !canvasRef.current) return;
        const dataUrl = canvasRef.current.toDataURL('image/png');
        onSave(dataUrl);
    };

    const handleUndo = () => {
        if (historyStep > 0) {
            const newStep = historyStep - 1;
            setHistoryStep(newStep);
            const previousLines = history[newStep];
            setLines(previousLines);
        }
    };

    const handleRedo = () => {
        if (historyStep < history.length - 1) {
            const newStep = historyStep + 1;
            setHistoryStep(newStep);
            const nextLines = history[newStep];
            setLines(nextLines);
            3;
        }
    };

    return (
        <div className={cn('flex flex-col items-center gap-2', className)}>
            <Label htmlFor="signature-canvas" className="sr-only">
                Нарисуйте вашу подпись
            </Label>
            <canvas
                id="signature-canvas"
                ref={canvasRef}
                width={width}
                height={height}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className={cn(
                    'border border-input rounded-md cursor-crosshair touch-none',
                    disabled && 'cursor-not-allowed opacity-70 bg-muted/50'
                )}
                style={{ backgroundColor }}
            />
            <div className="flex flex-wrap gap-2 mt-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUndo}
                    disabled={disabled || historyStep <= 0}
                >
                    <Undo className="mr-1 h-4 w-4" /> Отменить
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRedo}
                    disabled={disabled || historyStep >= history.length - 1}
                >
                    <Redo className="mr-1 h-4 w-4" /> Повторить
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClear}
                    disabled={disabled || lines.length === 0}
                >
                    <Eraser className="mr-1 h-4 w-4" /> Очистить
                </Button>
                <Button type="button" size="sm" onClick={handleSave} disabled={disabled || lines.length === 0}>
                    <Save className="mr-1 h-4 w-4" /> Сохранить нарисованную
                </Button>
            </div>
        </div>
    );
};

export default SignatureCanvas;
