import Link from 'next/link';

interface LogoProps {}

const Logo = ({}: LogoProps) => {
    return (
        <Link href={'/'}>
            <div className="flex items-center gap-2 w-fit">
                <div className="relative bg-primary size-[43px] rounded-full">
                    <span className="absolute -bottom-[2px] overflow-hidden leading-[34px] left-[48%] translate-x-[-50%] text-white text-sm font-bold text-[60px] select-none">
                        c
                    </span>
                </div>
                <span className="text-xl font-bold select-none translate-y-0.5">CodeHorizon</span>
            </div>
        </Link>
    );
};

export default Logo;
