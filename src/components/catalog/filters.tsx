'use client';

import { useEffect, useReducer, useState } from 'react';

import { motion } from 'framer-motion';
import debounce from 'lodash.debounce';
import { FaGreaterThanEqual } from 'react-icons/fa6';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { filtersReducer, initialFiltersState } from '@/lib/reducers/filters-reducer';
import { formatNumber } from '@/lib/utils';

import RatingStars from '../reusable/rating-stars';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Separator } from '../ui/separator';

interface CatalogFiltersProps {}

export type FiltersData = {
    ratingCounts: {
        key: string;
        label?: string;
        count: number;
    }[];
    videoDurationCounts: {
        key: string;
        label: string;
        count: number;
    }[];
    categoriesCounts: {
        key: string;
        label: string;
        count: number;
    }[];
    levelCounts: {
        key: string;
        label: string;
        count: number;
    }[];
};

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

const CatalogFilters = ({}: CatalogFiltersProps) => {
    const [state, dispatch] = useReducer(filtersReducer, initialFiltersState);
    const [filtersData, setFiltersData] = useState<FiltersData | null>(null);

    useEffect(() => {
        fetchFiltersData().then((data) => setFiltersData(data));
    }, []);

    const updateFilters = debounce((filters) => {
        console.log('Sending filters to server:', filters);
        // Здесь должен быть реальный API-запрос
    }, 500);

    useEffect(() => {
        updateFilters(state);
    }, [state]);

    return (
        <motion.div
            className="shadow-[0px_6px_20px_0px_rgba(0,0,0,0.05)] rounded-[6px] bg-white h-fit"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                className="flex items-center justify-between py-4 px-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                Фильтры
                <Button variant="link" size="link" className="text-primary" onClick={() => dispatch({ type: 'RESET' })}>
                    Сбросить
                </Button>
            </motion.div>
            <Separator />

            {/* Рейтинг */}
            <motion.div
                className="flex items-center justify-between px-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                <Accordion type="single" collapsible defaultValue="rating" className="w-full">
                    <AccordionItem value="rating">
                        <AccordionTrigger className="font-semibold">Рейтинг</AccordionTrigger>
                        <AccordionContent>
                            <RadioGroup
                                value={state.rating.toString()}
                                onValueChange={(val) =>
                                    dispatch({
                                        type: 'SET_RATING',
                                        payload: val,
                                    })
                                }
                            >
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
                                                    {parseFloat(item.key)} <FaGreaterThanEqual size={10} /> (
                                                    {formatNumber(item.count)})
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
                className="flex items-center justify-between px-6"
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
                                        checked={state.categories.includes(item.key)}
                                        onCheckedChange={() =>
                                            dispatch({
                                                type: 'TOGGLE_CATEGORY',
                                                payload: item.key,
                                            })
                                        }
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
                className="flex items-center justify-between px-6"
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
                                        checked={state.categories.includes(item.key)}
                                        onCheckedChange={() =>
                                            dispatch({
                                                type: 'TOGGLE_CATEGORY',
                                                payload: item.key,
                                            })
                                        }
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
                className="flex items-center justify-between px-6 pb-1"
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
                                        checked={state.categories.includes(item.key)}
                                        onCheckedChange={() =>
                                            dispatch({
                                                type: 'TOGGLE_CATEGORY',
                                                payload: item.key,
                                            })
                                        }
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
        </motion.div>
    );
};

export default CatalogFilters;
