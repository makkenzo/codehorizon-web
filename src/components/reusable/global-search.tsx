'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import debounce from 'lodash.debounce';
import { Loader2, Search } from 'lucide-react';
import { FaSearch } from 'react-icons/fa';
import { FaUserSecret } from 'react-icons/fa6';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { searchApiClient } from '@/server/search';
import { AuthorSearchResult, CourseSearchResult, SearchResultItem } from '@/types/search';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Input } from '../ui/input';

interface GlobalSearchProps {
    className?: string;
}

const GlobalSearch = ({ className }: GlobalSearchProps) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResultItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runSearch = async (searchQuery: string) => {
        if (searchQuery.trim().length < 2) {
            setResults([]);
            setIsLoading(false);
            return;
        }

        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();

        setIsLoading(true);

        try {
            const response = await searchApiClient.search(searchQuery, abortControllerRef.current.signal);

            if (!abortControllerRef.current.signal.aborted) {
                setResults(response?.results || []);
            }
        } catch (error) {
            if (!abortControllerRef.current?.signal.aborted) {
                console.error('Search API error:', error);
                setResults([]);
            }
        } finally {
            if (!abortControllerRef.current?.signal.aborted) {
                setIsLoading(false);
            }
        }
    };

    const debouncedRunSearch = useCallback(debounce(runSearch, 300), []);

    useEffect(() => {
        debouncedRunSearch(query);
        return () => {
            debouncedRunSearch.cancel();
            abortControllerRef.current?.abort();
        };
    }, [query, debouncedRunSearch]);

    const handleSelect = (url: string) => {
        router.push(url);
        setOpen(false);
        setQuery('');
        setResults([]);
    };

    const courseResults = results.filter((item) => item.type === 'course') as Array<
        SearchResultItem & { data: CourseSearchResult }
    >;
    const authorResults = results.filter((item) => item.type === 'author') as Array<
        SearchResultItem & { data: AuthorSearchResult }
    >;

    return (
        <div className={cn('relative max-w-[400px] w-full', className)}>
            <Button
                variant="outline"
                className="relative h-[32px] w-full justify-between rounded-[5px] px-3 text-sm md:w-64 lg:w-80 group"
                onClick={() => setOpen(true)}
            >
                <div className="flex items-center">
                    <Search className="mr-2 h-4 w-4" />
                    <span>Найти курс или автора...</span>
                </div>
                <kbd className="pointer-events-none hidden h-6 select-none items-center gap-1 rounded border bg-muted/40 group-hover:bg-primary group-hover:text-background px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
                    <span className="text-xs">Ctrl</span>K
                </kbd>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Найти курс или автора..." value={query} onValueChange={setQuery} />
                <CommandList>
                    {isLoading && (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    )}
                    {!isLoading && query.trim().length >= 2 && results.length === 0 && (
                        <CommandEmpty>Ничего не найдено.</CommandEmpty>
                    )}

                    {courseResults.length > 0 && (
                        <CommandGroup heading="Курсы">
                            {courseResults.map((item, index) => (
                                <CommandItem
                                    key={`${item.type}-${(item.data as any).id || (item.data as any).userId}-${index}`}
                                    onSelect={() => handleSelect(`/courses/${item.data.slug}`)}
                                    value={`course-${item.data.title}-${item.data.id}`}
                                >
                                    <div className="flex w-full cursor-pointer items-center gap-3 p-3">
                                        <Image
                                            src={
                                                (item.data as CourseSearchResult).imagePreview ||
                                                '/image_not_available.webp'
                                            }
                                            alt={(item.data as CourseSearchResult).title}
                                            width={96}
                                            height={51}
                                            className="rounded w-24 object-cover"
                                        />
                                        <div className="flex-1 overflow-hidden">
                                            <p className="font-medium truncate">
                                                {(item.data as CourseSearchResult).title}
                                            </p>
                                            <p className="text-xs">
                                                Курс от @{(item.data as CourseSearchResult).authorUsername}
                                            </p>
                                        </div>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                    {authorResults.length > 0 && (
                        <CommandGroup heading="Пользователи">
                            {authorResults.map((item, index) => (
                                <CommandItem
                                    key={`${item.type}-${(item.data as any).id || (item.data as any).userId}-${index}`}
                                    value={`author-${item.data.username}-${item.data.userId}`}
                                    onSelect={() => handleSelect(`/u/${item.data.username}`)}
                                >
                                    <div className="flex w-full cursor-pointer items-center gap-3 p-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage
                                                src={(item.data as AuthorSearchResult).avatarUrl ?? undefined}
                                            />
                                            <AvatarFallback
                                                style={{
                                                    backgroundColor:
                                                        (item.data as AuthorSearchResult).avatarColor ?? undefined,
                                                }}
                                            >
                                                {(item.data as AuthorSearchResult).displayName?.[0]?.toUpperCase() ?? (
                                                    <FaUserSecret />
                                                )}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="font-medium truncate">
                                                {item.data.displayName || item.data.username}
                                            </p>
                                        </div>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            </CommandDialog>
        </div>
    );
};

export default GlobalSearch;
