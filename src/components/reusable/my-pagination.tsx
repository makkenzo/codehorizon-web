'use client';

import { cva } from 'class-variance-authority';
import { FaGreaterThan, FaLessThan } from 'react-icons/fa6';

import { cn } from '@/lib/utils';

import { Button } from '../ui/button';

interface MyPaginationProps {
    className?: string;
    totalPages: number;
    currentPage: number;
    onPageChange: (page: number) => void;
    showElipsis?: boolean;
}

const paginationStyles = cva('flex items-center gap-2', {
    variants: {
        variant: {
            default: 'rounded-[12px] border-black-60/60 text-black-60/60',
            active: 'rounded-[12px] border-primary bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary',
            disabled: 'rounded-[3px] !opacity-30',
            'prev-default': 'rounded-[3px]',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});

const MyPagination = ({ className, currentPage, onPageChange, totalPages, showElipsis }: MyPaginationProps) => {
    const getPages = () => {
        if (!showElipsis || totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages: (number | string)[] = [1, currentPage, totalPages].filter((p, i, arr) => arr.indexOf(p) === i);

        if (currentPage > 2) pages.splice(1, 0, '...');
        if (currentPage < totalPages - 1) pages.splice(-1, 0, '...');

        return pages;
    };

    return (
        <div className={cn('flex items-center gap-8 justify-center', className)}>
            <Button
                className={cn(
                    'rounded-[3px] w-[41px]',
                    paginationStyles({ variant: currentPage === 1 ? 'disabled' : 'prev-default' })
                )}
                disabled={currentPage === 1}
                variant="outline"
                onClick={() => onPageChange(currentPage - 1)}
            >
                <FaLessThan />
            </Button>
            <div className="flex items-center gap-2">
                {getPages().map((page, idx) =>
                    typeof page === 'number' ? (
                        <Button
                            key={idx}
                            className={cn(paginationStyles({ variant: page === currentPage ? 'active' : 'default' }))}
                            onClick={() => onPageChange(page)}
                            variant="outline"
                        >
                            {page}
                        </Button>
                    ) : (
                        <span key={idx} className="px-2 text-gray-500">
                            ...
                        </span>
                    )
                )}
            </div>
            <Button
                className={cn(
                    'rounded-[3px] w-[41px]',
                    paginationStyles({ variant: currentPage === totalPages ? 'disabled' : 'prev-default' })
                )}
                disabled={currentPage === totalPages}
                variant="outline"
                onClick={() => onPageChange(currentPage + 1)}
            >
                <FaGreaterThan />
            </Button>
        </div>
    );
};

export default MyPagination;
