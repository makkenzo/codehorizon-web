'use client';

import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import debounce from 'lodash.debounce';
import { FaGreaterThanEqual } from 'react-icons/fa6';
import { IoFilter } from 'react-icons/io5';

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { formatNumber } from '@/lib/utils';
import { useCatalogFiltersStore } from '@/stores/catalog-filters/catalog-filters-store-provider';
import { FiltersData } from '@/types';

import RatingStars from '../reusable/rating-stars';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Separator } from '../ui/separator';

interface CatalogFiltersMobileProps {}

const fetchFiltersData = async (): Promise<FiltersData> => {
    return new Promise<FiltersData>((resolve) => {
        setTimeout(() => {
            resolve({
                ratingCounts: [
                    {
                        key: 'all',
                        label: 'Все',
                        count: 12200,
                    },
                    {
                        key: '4.5-and-up',
                        count: 5800,
                    },
                    {
                        key: '3.5-and-up',
                        count: 4300,
                    },
                    {
                        key: '3-and-up',
                        count: 2100,
                    },
                ],
                videoDurationCounts: [
                    {
                        key: '0-2-hours',
                        label: '0-2 часа',
                        count: 9400,
                    },
                    {
                        key: '3-5-hours',
                        label: '3-5 часов',
                        count: 4100,
                    },
                    {
                        key: '6-12-hours',
                        label: '6-12 часов',
                        count: 3800,
                    },
                    {
                        key: '12-and-more-hours',
                        label: '12+ часов',
                        count: 1000,
                    },
                ],
                categoriesCounts: [
                    {
                        key: 'design',
                        label: 'Дизайн',
                        count: 3200,
                    },
                    {
                        key: 'programming',
                        label: 'Программирование',
                        count: 1400,
                    },
                    {
                        key: 'business-and-marketing',
                        label: 'Бизнес и маркетинг',
                        count: 809,
                    },
                    {
                        key: 'finance',
                        label: 'Финансы',
                        count: 548,
                    },
                    {
                        key: 'music-and-film',
                        label: 'Музыка и фильмы',
                        count: 1900,
                    },
                    {
                        key: 'photo-and-video',
                        label: 'Фото и видео',
                        count: 2300,
                    },
                ],
                levelCounts: [
                    {
                        key: 'beginner',
                        label: 'Начинающий',
                        count: 1400,
                    },
                    {
                        key: 'intermediate',
                        label: 'Средний',
                        count: 809,
                    },
                    {
                        key: 'advanced',
                        label: 'Продвинутый',
                        count: 548,
                    },
                ],
            });
        }, 1000);
    });
};

const CatalogFiltersMobile = ({}: CatalogFiltersMobileProps) => {
    const {
        categories,
        level,
        rating,
        videoDuration,
        sortBy,
        reset,
        setRating,
        toggleCategory,
        toggleLevel,
        toggleVideoDuration,
    } = useCatalogFiltersStore((state) => state);
    const [filtersData, setFiltersData] = useState<FiltersData | null>(null);

    useEffect(() => {
        fetchFiltersData().then((data) => setFiltersData(data));
    }, []);

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
                                            {filtersData?.ratingCounts
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
                                                                {item.label} ({formatNumber(item.count)})
                                                            </div>
                                                        </Label>
                                                    </motion.div>
                                                ))}
                                            {filtersData?.ratingCounts
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
                                                            <div className="flex items-center gap-1 text-black-60/60">
                                                                {parseFloat(item.key)} <FaGreaterThanEqual size={10} />{' '}
                                                                ({formatNumber(item.count)})
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
                                        {filtersData?.videoDurationCounts.map((item, i) => (
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
                                                    {item.label} ({formatNumber(item.count)})
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
                                        {filtersData?.categoriesCounts.map((item, i) => (
                                            <motion.div
                                                key={item.key}
                                                className="flex items-center gap-2"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                transition={{ duration: 0.3, delay: i * 0.05 }}
                                            >
                                                <Checkbox
                                                    checked={categories.includes(item.key)}
                                                    onCheckedChange={() => toggleCategory(item.key)}
                                                    id={item.key}
                                                />
                                                <Label className="w-full text-black-60/60" htmlFor={item.key}>
                                                    {item.label} ({formatNumber(item.count)})
                                                </Label>
                                            </motion.div>
                                        ))}
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
                                        {filtersData?.levelCounts.map((item, i) => (
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
                                                    {item.label} ({formatNumber(item.count)})
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
