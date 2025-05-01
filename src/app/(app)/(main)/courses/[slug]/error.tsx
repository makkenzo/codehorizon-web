'use client';

import { useEffect } from 'react';

import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-full w-full items-center justify-center py-16">
            <Card className="w-full max-w-[448px]">
                <CardContent className="flex flex-col items-center space-y-8 pb-12 pt-16 text-center">
                    <div className="flex size-24 items-center justify-center rounded-lg bg-primary/10">
                        <X className="size-12 text-primary" />
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl font-bold tracking-tight">О нет!</h1>
                        <p className="text-lg text-muted-foreground">
                            Произошла ошибка. Попробуйте еще раз или свяжитесь с нами.
                        </p>
                    </div>

                    <Button size="lg" onClick={() => reset()}>
                        Попробовать снова
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
