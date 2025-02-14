'use client';

import { FaSearch } from 'react-icons/fa';

import { Input } from '../ui/input';

interface GlobalSearchProps {}

const GlobalSearch = ({}: GlobalSearchProps) => {
    return (
        <div className="relative max-w-[400px] w-full">
            <Input className="h-[37px] bg-white-90 border-0 pl-3 pr-10 py-0" placeholder="Найти курс" />
            <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2" />
        </div>
    );
};

export default GlobalSearch;

