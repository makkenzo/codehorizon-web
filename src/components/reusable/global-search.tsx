'use client';

import { FaSearch } from 'react-icons/fa';

import { cn } from '@/lib/utils';

import { Input } from '../ui/input';

interface GlobalSearchProps {
    className?: string;
}

const GlobalSearch = ({ className }: GlobalSearchProps) => {
    return (
        <div className={cn('relative max-w-[400px] w-full', className)}>
            <Input className="h-[37px] bg-white-90 border-0 pl-3 pr-10 py-0 rounded-[5px]" placeholder="Найти курс" />
            <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2" />
        </div>
    );
};

export default GlobalSearch;
