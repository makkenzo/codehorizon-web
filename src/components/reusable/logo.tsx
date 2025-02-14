import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';

interface LogoProps {
    whiteText?: boolean;
}

const Logo = ({ whiteText }: LogoProps) => {
    return (
        <Link href={'/'}>
            <div className="flex items-center gap-2 w-fit">
                <Image src="/logo.svg" alt="CodeHorizon" width={40} height={40} />
                <span className={cn('text-xl font-bold select-none translate-y-0.5', whiteText && 'text-white')}>
                    CodeHorizon
                </span>
            </div>
        </Link>
    );
};

export default Logo;
