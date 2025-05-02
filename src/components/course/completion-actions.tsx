import { PartyPopper } from 'lucide-react';

import Link from 'next/link';

import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

interface CourseCompletionActionsProps {
    courseSlug: string;
}

const CourseCompletionActions = ({ courseSlug }: CourseCompletionActionsProps) => {
    const hasLeftReview = false;

    return (
        <div className="mb-6 p-4 rounded-md border border-success bg-success/10 text-success-foreground space-y-3">
            <div className="flex items-center gap-3">
                <PartyPopper className="h-6 w-6 shrink-0 text-success" />
                <p className="text-lg font-semibold">Курс пройден! Отличная работа!</p>
            </div>
            <Separator className="bg-success/30" />
            <div className="flex flex-wrap gap-3 items-center">
                {/* <Button size="sm" variant="success-outline"> {/* Нужен новый вариант кнопки */}
                {/* <Download className="mr-2 h-4 w-4"/> Скачать сертификат */}
                {/* </Button> */}
                {!hasLeftReview && (
                    <Link href={`/courses/${courseSlug}#reviews`}>
                        <Button
                            size="sm"
                            variant="outline"
                            className="bg-background/50 hover:bg-background/70 hover:text-foreground/70 border-success/50 text-success-foreground"
                        >
                            Оставить отзыв
                        </Button>
                    </Link>
                )}
                <Link href="/courses">
                    <Button
                        size="sm"
                        variant="outline"
                        className="bg-background/50 hover:bg-background/70 hover:text-foreground/70 border-success/50 text-success-foreground"
                    >
                        Найти следующий курс
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default CourseCompletionActions;
