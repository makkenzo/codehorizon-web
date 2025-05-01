'use client';

import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { IoFilter } from 'react-icons/io5';

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import CoursesApiClient from '@/server/courses';
import { useCatalogFiltersStore } from '@/stores/catalog-filters/catalog-filters-store-provider';
import { CourseDifficultyLevels } from '@/types';

import RatingStars from '../reusable/rating-stars';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';

const CatalogFiltersMobile = () => {
    const { categories, level, rating, videoDuration, setRating, toggleCategory, toggleLevel, toggleVideoDuration } =
        useCatalogFiltersStore((state) => state);

    const [fetchedCategories, setFetchedCategories] = useState<string[] | null>(null);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [errorCategories, setErrorCategories] = useState<string | null>(null);

    const ratingOptions = [
        { key: 'all', label: 'Все' },
        { key: '4.5', count: 4.5 },
        { key: '3.5', count: 3.5 },
        { key: '3.0', count: 3.0 },
    ];

    const videoDurationOptions = [
        { key: '0-2-hours', label: '0-2 часа' },
        { key: '3-5-hours', label: '3-5 часов' },
        { key: '6-12-hours2', label: '6-12 часов' },
        { key: '12-and-more-hours', label: '12+ часов' },
    ];

    const levelOptions = [
        { key: CourseDifficultyLevels.BEGINNER, label: 'Начинающий' },
        { key: CourseDifficultyLevels.INTERMEDIATE, label: 'Средний' },
        { key: CourseDifficultyLevels.ADVANCED, label: 'Продвинутый' },
    ];

    useEffect(() => {
        const loadCategories = async () => {
            setIsLoadingCategories(true);
            setErrorCategories(null);
            try {
                const data = await new CoursesApiClient().getCategories();
                setFetchedCategories(data ?? []);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
                setErrorCategories('Не удалось загрузить категории.');
                setFetchedCategories([]);
            } finally {
                setIsLoadingCategories(false);
            }
        };
        loadCategories();
    }, []);

    const renderCategorySkeletons = (count = 5) => (
        <div className="space-y-2">
            {[...Array(count)].map((_, i) => (
                <div key={`mob-cat-skel-${i}`} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            ))}
        </div>
    );

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button size="sm" variant="ghost" className="!px-2 lg:hidden block">
                    <IoFilter className="size-[20px]" />
                </Button>
            </SheetTrigger>
            <SheetContent side="bottom">
                <SheetHeader>
                    <SheetTitle>Фильтры</SheetTitle>
                    <SheetDescription>
                        <motion.div
                            className="flex items-center justify-between"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                        >
                            <Accordion type="single" collapsible defaultValue="rating" className="w-full">
                                <AccordionItem value="rating">
                                    <AccordionTrigger className="font-semibold">Рейтинг</AccordionTrigger>
                                    <AccordionContent>
                                        <RadioGroup value={rating.toString()} onValueChange={(val) => setRating(val)}>
                                            {ratingOptions
                                                .filter((a) => a.label !== undefined)
                                                .map((item, i) => (
                                                    <motion.div
                                                        key={item.key}
                                                        className="flex items-center gap-2"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 10 }}
                                                        transition={{ duration: 0.3, delay: i * 0.05 }}
                                                    >
                                                        <RadioGroupItem value={item.key} id={item.key} />
                                                        <Label htmlFor={item.key} className="w-full">
                                                            <div className="flex items-center gap-1 text-black-60/60">
                                                                {item.label}
                                                            </div>
                                                        </Label>
                                                    </motion.div>
                                                ))}
                                            {ratingOptions
                                                .filter((a) => a.label === undefined)
                                                .map((item, i) => (
                                                    <motion.div
                                                        key={item.key}
                                                        className="flex items-center gap-2"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 10 }}
                                                        transition={{ duration: 0.3, delay: i * 0.05 + 0.2 }}
                                                    >
                                                        <RadioGroupItem value={item.key} id={item.key} />
                                                        <Label htmlFor={item.key} className="w-full grid grid-cols-2">
                                                            <RatingStars count={parseFloat(item.key)} />
                                                            <div className="flex justify-end items-center gap-1 text-black-60/60">
                                                                {parseFloat(item.key)}
                                                            </div>
                                                        </Label>
                                                    </motion.div>
                                                ))}
                                        </RadioGroup>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </motion.div>
                        <Separator />

                        {/* Длительность видео */}
                        <motion.div
                            className="flex items-center justify-between"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.3 }}
                        >
                            <Accordion type="single" collapsible defaultValue="video-duration" className="w-full">
                                <AccordionItem value="video-duration">
                                    <AccordionTrigger className="font-semibold">Длительность видео</AccordionTrigger>
                                    <AccordionContent className="space-y-2">
                                        {videoDurationOptions.map((item, i) => (
                                            <motion.div
                                                key={item.key}
                                                className="flex items-center gap-2"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                transition={{ duration: 0.3, delay: i * 0.05 }}
                                            >
                                                <Checkbox
                                                    checked={videoDuration.includes(item.key)}
                                                    onCheckedChange={() => toggleVideoDuration(item.key)}
                                                    id={item.key}
                                                />
                                                <Label className="w-full text-black-60/60" htmlFor={item.key}>
                                                    {item.label}
                                                </Label>
                                            </motion.div>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </motion.div>
                        <Separator />

                        {/* Категории */}
                        <motion.div
                            className="flex items-center justify-between"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.4 }}
                        >
                            <Accordion type="single" collapsible defaultValue="categories" className="w-full">
                                <AccordionItem value="categories">
                                    <AccordionTrigger className="font-semibold">Категории</AccordionTrigger>
                                    <AccordionContent className="space-y-2">
                                        {isLoadingCategories ? (
                                            renderCategorySkeletons()
                                        ) : errorCategories ? (
                                            <p className="text-destructive text-xs px-1">{errorCategories}</p>
                                        ) : fetchedCategories && fetchedCategories.length > 0 ? (
                                            fetchedCategories.map((cat, i) => (
                                                <motion.div
                                                    key={cat}
                                                    className="flex items-center gap-2"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    transition={{ duration: 0.3, delay: i * 0.05 }}
                                                >
                                                    <Checkbox
                                                        checked={categories.includes(cat)}
                                                        onCheckedChange={() => toggleCategory(cat)}
                                                        id={`mob-category-${cat}`}
                                                    />
                                                    <Label
                                                        className="w-full text-black-60/60 dark:text-white/70"
                                                        htmlFor={`mob-category-${cat}`}
                                                    >
                                                        {cat}
                                                    </Label>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <p className="text-muted-foreground text-xs px-1">
                                                Нет доступных категорий.
                                            </p>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </motion.div>
                        <Separator />

                        {/* Уровень */}
                        <motion.div
                            className="flex items-center justify-between pb-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.5 }}
                        >
                            <Accordion type="single" collapsible defaultValue="level" className="w-full">
                                <AccordionItem value="level">
                                    <AccordionTrigger className="font-semibold">Уровень</AccordionTrigger>
                                    <AccordionContent className="space-y-2">
                                        {levelOptions.map((item, i) => (
                                            <motion.div
                                                key={item.key}
                                                className="flex items-center gap-2"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                transition={{ duration: 0.3, delay: i * 0.05 }}
                                            >
                                                <Checkbox
                                                    checked={level.includes(item.key)}
                                                    onCheckedChange={() => toggleLevel(item.key)}
                                                    id={item.key}
                                                />
                                                <Label className="w-full text-black-60/60" htmlFor={item.key}>
                                                    {item.label}
                                                </Label>
                                            </motion.div>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </motion.div>
                    </SheetDescription>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    );
};

export default CatalogFiltersMobile;
