import { RiHome4Fill, RiHomeFill } from 'react-icons/ri';

import Link from 'next/link';

import LetterGlitch from '@/components/bits/letter-glitch';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <div className="h-screen">
            <LetterGlitch glitchSpeed={50} centerVignette={true} outerVignette={false} smooth={true} />
            <div className="text-[clamp(12rem,4vw,14rem)] mix-blend-color-dodge flex items-center gap-4 font-bold absolute z-0 left-1/2 top-1/2 text-center -translate-x-1/2 -translate-y-1/2 text-white">
                <Link href="/">
                    <Button
                        variant="link"
                        size={'link'}
                        className="text-white hover:text-primary transition-all duration-100"
                    >
                        <RiHome4Fill className="size-[clamp(11rem,4vw,14rem)] outline-4" />
                    </Button>
                </Link>
                <span className="leading-none">404</span>
            </div>
        </div>
    );
}
