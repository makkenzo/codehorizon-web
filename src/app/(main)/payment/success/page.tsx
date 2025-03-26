import { IoMdDoneAll } from 'react-icons/io';

import Link from 'next/link';

import PageWrapper from '@/components/reusable/page-wrapper';
import { Button } from '@/components/ui/button';

const SuccessPage = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <div className="rounded-full outline-4 outline-success p-4 mb-4">
                <IoMdDoneAll className="size-12 text-success" />
            </div>
            <h1 className="text-3xl font-bold text-success">Оплата успешно завершена!</h1>
            <p className="text-gray-600 mt-2">Спасибо за покупку! Доступ к курсу скоро появится в вашем аккаунте.</p>
            <Link href="/" className="mt-4">
                <Button>Вернуться на главную</Button>
            </Link>
        </div>
    );
};

export default SuccessPage;
