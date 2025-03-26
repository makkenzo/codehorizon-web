import { X } from 'lucide-react';

import Link from 'next/link';

import { Button } from '@/components/ui/button';

const CancelPage = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <div className="rounded-full outline-4 outline-destructive p-4 mb-4">
                <X className="size-12 text-destructive" />
            </div>
            <h1 className="text-3xl font-bold text-destructive">Оплата отменена</h1>
            <p className="text-gray-600 mt-2">Платеж не был завершен. Вы можете попробовать снова.</p>
            <Link href="/" className="mt-4">
                <Button>Вернуться на главную</Button>
            </Link>
        </div>
    );
};

export default CancelPage;
