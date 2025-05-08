'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import debounce from 'lodash.debounce';
import { Loader2 } from 'lucide-react';
import { FaSearch } from 'react-icons/fa';
import { FaUserSecret } from 'react-icons/fa6';

import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { searchApiClient } from '@/server/search';
import { AuthorSearchResult, CourseSearchResult, SearchResultItem } from '@/types/search';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Input } from '../ui/input';

interface GlobalSearchProps {
    className?: string;
}

const GlobalSearch = ({ className }: GlobalSearchProps) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResultItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchResults = async (searchQuery: string) => {
        if (searchQuery.trim().length < 2) {
            setResults([]);
            setIsDropdownOpen(false);
            setIsLoading(false);
            return;
        }

        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();

        setIsLoading(true);
        setIsDropdownOpen(true);

        const response = await searchApiClient.search(searchQuery, abortControllerRef.current.signal);
        if (!abortControllerRef.current.signal.aborted) {
            setResults(response?.results || []);
            setIsLoading(false);
        }
    };

    const debouncedFetchResults = useCallback(debounce(fetchResults, 300), []);

    useEffect(() => {
        debouncedFetchResults(query);

        return () => {
            debouncedFetchResults.cancel();
            abortControllerRef.current?.abort();
        };
    }, [query, debouncedFetchResults]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        if (e.target.value.trim().length >= 2) {
            setIsDropdownOpen(true);
        } else {
            setIsDropdownOpen(false);
        }
    };

    const handleLinkClick = () => {
        setIsDropdownOpen(false);
        setQuery('');
    };

    return (
        <div ref={searchContainerRef} className={cn('relative max-w-[400px] w-full', className)}>
            <Input
                className="h-[37px] bg-white-90 border-0 pl-3 pr-10 py-0 rounded-[5px]"
                placeholder="Найти курс или автора..."
                value={query}
                onChange={handleInputChange}
                onFocus={() => query.trim().length >= 2 && setIsDropdownOpen(true)}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <FaSearch />}
            </div>

            {isDropdownOpen && (
                <div className="absolute top-full mt-2 w-full bg-background border border-border rounded-md shadow-lg z-50 max-h-80 overflow-y-auto custom-scrollbar">
                    {isLoading && results.length === 0 && (
                        <div className="p-4 text-center text-muted-foreground">Загрузка...</div>
                    )}
                    {!isLoading && query.trim().length >= 2 && results.length === 0 && (
                        <div className="p-4 text-center text-muted-foreground">Ничего не найдено.</div>
                    )}
                    {results.length > 0 && (
                        <ul>
                            {results.map((item, index) => (
                                <li key={`${item.type}-${(item.data as any).id || (item.data as any).userId}-${index}`}>
                                    <Link
                                        href={
                                            item.type === 'course'
                                                ? `/courses/${(item.data as CourseSearchResult).slug}`
                                                : `/u/${(item.data as AuthorSearchResult).username}`
                                        }
                                        className="block hover:bg-muted p-3 border-b last:border-b-0"
                                        onClick={handleLinkClick}
                                    >
                                        <div className="flex items-center gap-3">
                                            {item.type === 'course' && (
                                                <>
                                                    <Image
                                                        src={
                                                            (item.data as CourseSearchResult).imagePreview ||
                                                            '/image_not_available.webp'
                                                        }
                                                        alt={(item.data as CourseSearchResult).title}
                                                        width={48}
                                                        height={27}
                                                        className="rounded object-cover w-12 h-[27px]"
                                                    />
                                                    <div className="flex-1 overflow-hidden">
                                                        <p className="font-medium truncate">
                                                            {(item.data as CourseSearchResult).title}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Курс от @{(item.data as CourseSearchResult).authorUsername}
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                            {item.type === 'author' && (
                                                <>
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage
                                                            src={
                                                                (item.data as AuthorSearchResult).avatarUrl ?? undefined
                                                            }
                                                        />
                                                        <AvatarFallback
                                                            style={{
                                                                backgroundColor:
                                                                    (item.data as AuthorSearchResult).avatarColor ??
                                                                    undefined,
                                                            }}
                                                        >
                                                            {(
                                                                item.data as AuthorSearchResult
                                                            ).displayName?.[0]?.toUpperCase() ?? <FaUserSecret />}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 overflow-hidden">
                                                        <p className="font-medium truncate">
                                                            {(item.data as AuthorSearchResult).displayName ||
                                                                (item.data as AuthorSearchResult).username}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">Автор</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;
