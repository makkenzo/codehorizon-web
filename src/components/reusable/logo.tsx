import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';

interface LogoProps {
    whiteText?: boolean;
    showText?: boolean;
    size?: number;
}

const Logo = ({ whiteText, size = 40, showText = true }: LogoProps) => {
    return (
        <Link href={'/'}>
            <div className={cn('flex items-center w-fit', showText && 'gap-2')}>
                <Image src="/logo.svg" alt="CodeHorizon" width={size} height={size} />
                {showText && (
                    <span className={cn('text-xl font-bold select-none translate-y-0.5', whiteText && 'text-white')}>
                        CodeHorizon
                    </span>
                )}
            </div>
        </Link>
    );
};

export default Logo;
