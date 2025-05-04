import { FaTelegramPlane } from 'react-icons/fa';

import Link from 'next/link';

import Logo from '../reusable/logo';
import { Skeleton } from '../ui/skeleton';

interface FooterProps {
    categories: string[];
    isLoading?: boolean;
}

const Footer = ({ categories, isLoading }: FooterProps) => {
    return (
        <div className="lg:flex hidden bg-surface-dark max-h-[302px] h-full flex-col gap-12 justify-between">
            <div className="max-w-[1208px] grid grid-cols-4 mx-auto xl:px-0 px-4 pt-[40px] w-full">
                <Logo whiteText />
                <ul className="text-white space-y-4">
                    <li className="text-lg">
                        <Link href={'/courses'}>Все курсы</Link>
                    </li>
                    {isLoading ? (
                        <>
                            <li className="h-5">
                                <Skeleton className="h-full w-3/4 bg-gray-600" />
                            </li>
                            <li className="h-5">
                                <Skeleton className="h-full w-1/2 bg-gray-600" />
                            </li>
                            <li className="h-5">
                                <Skeleton className="h-full w-2/3 bg-gray-600" />
                            </li>
                        </>
                    ) : (
                        categories.slice(0, 3).map((cat) => (
                            <li key={`footer-cat-${cat}`}>
                                <Link href={`/courses?category=${encodeURIComponent(cat)}`}>{cat}</Link>
                            </li>
                        ))
                    )}
                </ul>
                <ul className="text-white space-y-4">
                    <li className="text-lg">Популярное</li>
                    {isLoading ? (
                        <>
                            <li className="h-5">
                                <Skeleton className="h-full w-3/4 bg-gray-600" />
                            </li>
                            <li className="h-5">
                                <Skeleton className="h-full w-1/2 bg-gray-600" />
                            </li>
                            <li className="h-5">
                                <Skeleton className="h-full w-2/3 bg-gray-600" />
                            </li>
                        </>
                    ) : (
                        categories.slice(3, 6).map((cat) => (
                            <li key={`footer-cat2-${cat}`}>
                                <Link href={`/courses?category=${encodeURIComponent(cat)}`}>{cat}</Link>
                            </li>
                        ))
                    )}
                </ul>
                <ul className="text-white space-y-4">
                    <li className="text-lg">Юридическая информация</li>

                    <li className="h-5">
                        <Link href={'/legal/terms'}>Правила использования</Link>
                    </li>
                    <li className="h-5">
                        <Link href={'/legal/privacy'}>Политика конфиденциальности</Link>
                    </li>
                </ul>
            </div>
            <div className="max-w-[1208px] flex justify-between items-center xl:px-0 px-4 mx-auto text-white-90 pb-4 w-full">
                <p>© {new Date().getFullYear()} CodeHorizon. Все права защищены.</p>
                <div className="flex items-center gap-4">
                    <Link href={'https://t.me/makkenz0'} className="group" target="_blank">
                        <FaTelegramPlane className="size-[20px] text-white-90 group:hover:text-white" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Footer;
