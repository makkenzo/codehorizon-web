import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface PageWrapperProps {
    children: ReactNode;
    className?: string;
}

const PageWrapper = ({ children, className }: PageWrapperProps) => {
    return <div className={cn('xl:px-0 px-4 max-w-[1208px] mx-auto mt-[40px]', className)}>{children}</div>;
};

export default PageWrapper;
