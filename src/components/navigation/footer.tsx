import { FaTelegramPlane } from 'react-icons/fa';

import Link from 'next/link';

import Logo from '../reusable/logo';

interface FooterProps {}

const Footer = ({}: FooterProps) => {
    return (
        <div className="bg-surface-dark max-h-[302px] h-full flex flex-col justify-between">
            <div className="max-w-[1208px] grid grid-cols-4 mx-auto xl:px-0 px-8 pt-[40px] w-full">
                <Logo whiteText />
                <ul className="text-white space-y-4">
                    <li className="text-lg">
                        <Link href={'/'}>Веб-программирование</Link>
                    </li>
                    <li>
                        <Link href={'/'}>Разработка мобильных приложений</Link>
                    </li>
                    <li>
                        <Link href={'/'}>Java: Новичок</Link>
                    </li>
                    <li>
                        <Link href={'/'}>PHP: Новичок</Link>
                    </li>
                </ul>
                <ul className="text-white space-y-4">
                    <li className="text-lg">
                        <Link href={'/'}>Adobe Illustrator</Link>
                    </li>
                    <li>
                        <Link href={'/'}>Adobe Photoshop</Link>
                    </li>
                    <li>
                        <Link href={'/'}>Design Logo</Link>
                    </li>
                </ul>
                <ul className="text-white space-y-4">
                    <li className="text-lg">
                        <Link href={'/'}>Написание курса</Link>
                    </li>
                    <li>
                        <Link href={'/'}>Фото-редактирование</Link>
                    </li>
                    <li>
                        <Link href={'/'}>Монтаж видео</Link>
                    </li>
                </ul>
            </div>
            <div className="max-w-[1208px] flex justify-between items-center mx-auto text-white-90 pb-4 w-full">
                <p>Copyright © {new Date().getFullYear()} Code Horizon. All rights reserved.</p>
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
