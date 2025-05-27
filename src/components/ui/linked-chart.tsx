'use client';

import * as React from 'react';
import { useMemo, useRef, useState } from 'react';

import { ColumnDef, ColumnFiltersState } from '@tanstack/react-table';
import { addDays, addMonths, addQuarters, addYears, format as formatDate, parse } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, Calendar, ChevronsUpDown, Settings, Sparkles, Target, TrendingUp, Zap } from 'lucide-react';
import { Area, Bar, CartesianGrid, ComposedChart, ReferenceArea, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Badge } from './badge';

export interface GroupedData {
    dateLabel: string;
    [key: string]: number | string;
}

const CHART_TYPES = {
    area: {
        value: 'area' as const,
        label: 'Area',
        component: Area,
        icon: TrendingUp,
        config: {
            type: 'monotone' as const,
            fillOpacity: 0.2,
        },
        gradient: 'from-blue-500 to-cyan-500',
    },
    bar: {
        value: 'bar' as const,
        label: 'Bar',
        component: Bar,
        icon: BarChart3,
        config: {
            type: 'monotone' as const,
            fillOpacity: 0.5,
        },
        gradient: 'from-violet-500 to-purple-500',
    },
} as const;

type ChartType = keyof typeof CHART_TYPES;

type AggregatorConfig<TData> = {
    [key: string]: (item: TData) => number;
};

const defaultAggregatorConfig = {
    transactionCount: () => 1,
} as const;

interface LinkedChartProps<TData extends object = object> {
    data: TData[];
    columns?: ColumnDef<TData, any>[];
    setColumnFilters?: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
    dateField: keyof TData;
    dateFormat?: DateFormat;
    aggregatorConfig?: AggregatorConfig<TData>;
    chartType?: ChartType;
    title?: string;
}

type DateLabel = string;

const dateUtils = {
    parse: (label: DateLabel, format: string): Date | null => {
        try {
            return parse(label, format, new Date());
        } catch (error) {
            console.error(`Invalid date label: "${label}". Expected format: ${format}`);
            return null;
        }
    },

    format: (label: DateLabel, format: string): string => {
        const date = dateUtils.parse(label, format);
        return date ? formatDate(date, format) : label;
    },

    addInterval: (date: Date, format: string): Date => {
        switch (format) {
            case 'dd MMM yyyy':
                return addDays(date, 1);
            case 'MMM yyyy':
                return addMonths(date, 1);
            case 'QQQ yyyy':
                return addQuarters(date, 1);
            case 'yyyy':
                return addYears(date, 1);
            default:
                return addDays(date, 1);
        }
    },

    toTimestamp: (label: DateLabel, format: string, isEndDate: boolean = false): number | null => {
        const date = dateUtils.parse(label, format);
        if (!date) return null;

        return Math.floor((isEndDate ? dateUtils.addInterval(date, format) : date).getTime() / 1000);
    },
};

const chartUtils = {
    formatLabel: (key: string): string => key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),

    getColor: (index: number): string => `hsl(var(--chart-${index + 1}))`,

    generateConfig: (aggregatorConfig: Record<string, any>): ChartConfig =>
        Object.keys(aggregatorConfig).reduce(
            (acc, key, index) => ({
                ...acc,
                [key]: {
                    label: chartUtils.formatLabel(key),
                    color: chartUtils.getColor(index),
                },
            }),
            {} as ChartConfig
        ),
};
const groupDataByDate = <TData,>(
    items: TData[],
    format: string,
    dateField: keyof TData,
    aggregator: Record<string, (item: TData) => number>
): GroupedData[] => {
    const grouped = items.reduce(
        (acc, item) => {
            const dateValue = item[dateField];
            let dateObject: Date;

            if (typeof dateValue === 'string') {
                dateObject = new Date(dateValue);
            } else if (typeof dateValue === 'number') {
                const timestampMs = dateValue > 30000000000 ? dateValue : dateValue * 1000;
                dateObject = new Date(timestampMs);
            } else if (dateValue instanceof Date) {
                dateObject = dateValue;
            } else {
                console.error(`[LinkedChart] Invalid date value for dateField '${String(dateField)}':`, dateValue);

                dateObject = new Date(NaN);
            }

            if (isNaN(dateObject.getTime())) {
                console.error(
                    `[LinkedChart] Failed to parse date for dateField '${String(dateField)}'. Original value:`,
                    dateValue,
                    'Item:',
                    item
                );
            }

            const formattedDate = formatDate(dateObject, format);

            return {
                ...acc,
                [formattedDate]: {
                    dateLabel: formattedDate,
                    ...Object.fromEntries(
                        Object.entries(aggregator).map(([key, fn]) => [
                            key,
                            ((acc[formattedDate]?.[key] as number) || 0) + fn(item),
                        ])
                    ),
                },
            };
        },
        {} as Record<string, GroupedData>
    );

    return Object.values(grouped).sort(
        (a, b) => dateUtils.parse(a.dateLabel, format)!.getTime() - dateUtils.parse(b.dateLabel, format)!.getTime()
    );
};

const DATE_FORMATS = [
    { value: 'MMM yyyy', label: 'Month (May 2024)', icon: Calendar },
    { value: 'QQQ yyyy', label: 'Quarter (Q2 2024)', icon: Target },
    { value: 'yyyy', label: 'Year (2024)', icon: Zap },
    { value: 'MM/dd/yyyy', label: 'US Date (12/31/2024)', icon: Calendar },
    { value: 'dd/MM/yyyy', label: 'EU Date (31/12/2024)', icon: Calendar },
    { value: 'yyyy-MM-dd', label: 'ISO Date (2024-12-31)', icon: Calendar },
] as const;

type DateFormat = (typeof DATE_FORMATS)[number]['value'];

function DateFormatSelector({
    onFormatChange,
    selectedFormat,
    ...props
}: {
    onFormatChange: (format: DateFormat) => void;
    selectedFormat: DateFormat;
}) {
    const [open, setOpen] = React.useState(false);

    return (
        <div className="grid gap-2">
            <Popover open={open} onOpenChange={setOpen} {...props}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-[240px] justify-between bg-white/80 backdrop-blur-sm border-white/50 hover:bg-white/90"
                    >
                        <span className="truncate flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-violet-600" />
                            {DATE_FORMATS.find((f) => f.value === selectedFormat)?.label || selectedFormat}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    align="end"
                    className="w-[240px] p-0 bg-white/90 backdrop-blur-lg border border-white/50 shadow-xl"
                >
                    <Command>
                        <CommandInput placeholder="Поиск форматов..." className="border-0" />
                        <CommandList>
                            <CommandEmpty>No format found.</CommandEmpty>
                            <CommandGroup>
                                {DATE_FORMATS.map((format) => {
                                    const Icon = format.icon;
                                    return (
                                        <CommandItem
                                            key={format.value}
                                            value={format.value}
                                            onSelect={(currentValue) => {
                                                onFormatChange(currentValue as DateFormat);
                                                setOpen(false);
                                            }}
                                            className="hover:bg-violet-50 cursor-pointer"
                                        >
                                            <Icon className="h-4 w-4 mr-2 text-violet-600" />
                                            {format.label}
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}

const isValidDateField = <TData,>(columns: ColumnDef<TData, any>[], dateField: string) => {
    const DATE_FILTER_EXAMPLE = `filterFn: (row, columnId, filterValue) => {
        const cellValue = row.getValue<number>(columnId);
        if (!filterValue?.start || !filterValue?.end) return true;
        return cellValue >= filterValue.start && cellValue <= filterValue.end;
      }`;

    const dateColumn = columns.find((col) => (col as { accessorKey: string }).accessorKey === dateField);

    if (!dateColumn?.filterFn) {
        throw new Error(`Column ${dateField} must have a filterFn. Example:\n${DATE_FILTER_EXAMPLE}`);
    }

    const fnString = dateColumn.filterFn.toString();

    if (!fnString.includes('start') || !fnString.includes('end')) {
        throw new Error(`Column ${dateField} has incorrect filterFn.\nExpected:\n${DATE_FILTER_EXAMPLE}`);
    }

    return dateField as keyof TData;
};

function isValidChartType(type: string): type is ChartType {
    if (!Object.keys(CHART_TYPES).some((t) => t === type)) {
        throw new Error(`Invalid chart type: ${type}. Must be one of: ${Object.keys(CHART_TYPES).join(', ')}`);
    }
    return true;
}

function isValidDateFormat(format: string): format is DateFormat {
    if (!DATE_FORMATS.some((f) => f.value === format)) {
        throw new Error(
            `Invalid date format: ${format}. Must be one of: ${DATE_FORMATS.map((f) => f.value).join(', ')}`
        );
    }
    return true;
}

function isValidDataField<T extends object>(data: T[], field: keyof T): boolean {
    return data.length > 0 && field in data[0];
}

function useChartInteraction<TData>({
    dateField,
    selectedFormat,
    setColumnFilters,
}: {
    dateField: string;
    selectedFormat: string;
    setColumnFilters?: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
}) {
    const [timeRange, setTimeRange] = useState<{ start: number; end: number } | null>(null);
    const [refAreaLeft, setRefAreaLeft] = useState<string | null>(null);
    const [refAreaRight, setRefAreaRight] = useState<string | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [initialX, setInitialX] = useState<number | null>(null);

    const handleSelection = (start: number, end: number) => {
        if (setColumnFilters) {
            setColumnFilters((prev) => {
                const updatedFilters = [...prev, { id: dateField, value: { start, end } }];
                return Array.from(new Map(updatedFilters.map((filter) => [filter.id, filter])).values());
            });
        } else {
            setTimeRange({ start, end });
        }
    };

    const handleMouseDown = (e: any) => {
        if (e.activeLabel) {
            setRefAreaLeft(e.activeLabel);
            setRefAreaRight(e.activeLabel);
            setInitialX(e.chartX);
            setIsSelecting(true);
        }
    };

    const handleMouseMove = (e: any) => {
        if (isSelecting && e.activeLabel && initialX !== null) {
            // Moving right
            if (e.chartX > initialX) {
                setRefAreaRight(e.activeLabel);
            }
            // Moving left
            else {
                setRefAreaLeft(e.activeLabel);
            }
        }
    };

    const handleMouseUp = () => {
        if (refAreaLeft && refAreaRight) {
            const leftTs = dateUtils.toTimestamp(refAreaLeft, selectedFormat);
            const rightTs = dateUtils.toTimestamp(refAreaRight, selectedFormat, true);

            if (leftTs && rightTs) {
                const start = Math.min(leftTs, rightTs);
                const end = Math.max(leftTs, rightTs);

                handleSelection(start, end);
            }
        }
        setRefAreaLeft(null);
        setRefAreaRight(null);
        setIsSelecting(false);
        setInitialX(null);
    };

    const handleReset = () => {
        if (setColumnFilters) {
            setColumnFilters((prev) => prev.filter((filter) => filter.id !== dateField));
        } else {
            setTimeRange(null);
        }
    };

    return {
        timeRange,
        refAreaLeft,
        refAreaRight,
        isSelecting,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleReset,
    };
}

export function LinkedChart<TData extends object>({
    data,
    columns,
    setColumnFilters,
    dateField,
    dateFormat = 'MMM yyyy',
    chartType = 'area',
    title = 'Chart',
    aggregatorConfig = defaultAggregatorConfig,
}: LinkedChartProps<TData>) {
    const [selectedFormat, setSelectedFormat] = useState<DateFormat>(dateFormat);
    const [selectedChartType, setSelectedChartType] = useState<ChartType>(chartType);

    const { timeRange, refAreaLeft, refAreaRight, handleMouseDown, handleMouseMove, handleMouseUp, isSelecting } =
        useChartInteraction({
            dateField: dateField as string,
            selectedFormat,
            setColumnFilters,
        });

    if (!isValidDataField<TData>(data, dateField)) {
        throw new Error('Invalid date field');
    }
    if (columns && !isValidDateField(columns, dateField as string)) throw new Error('Invalid date field configuration');
    if (!isValidDateFormat(dateFormat)) throw new Error('Invalid date format');
    if (!isValidChartType(chartType)) throw new Error('Invalid chart type');

    const filteredData = useMemo(() => {
        if (setColumnFilters || !timeRange) return data;

        return data.filter((item) => {
            const timestamp = item[dateField] as number;
            return timestamp >= timeRange.start && timestamp <= timeRange.end;
        });
    }, [data, dateField, timeRange, setColumnFilters]);

    const groupedData = useMemo(
        () => groupDataByDate(filteredData, selectedFormat, dateField, aggregatorConfig),
        [filteredData, selectedFormat, dateField, aggregatorConfig]
    );

    const selectedChartConfig = useMemo(() => CHART_TYPES[selectedChartType], [selectedChartType]);

    const chartRef = useRef<HTMLDivElement>(null);

    if (!data?.length) return null;

    return (
        <motion.div
            className="w-full h-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="w-full h-full bg-white/70 backdrop-blur-lg shadow-xl border border-white/50 overflow-hidden relative group py-0">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-fuchsia-500/5"></div>
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-full blur-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 rounded-full blur-2xl opacity-40 group-hover:opacity-80 transition-opacity duration-700"></div>
                <CardHeader className="relative z-10 flex-col items-stretch space-y-0 border-b border-white/30 p-0 sm:flex-row hidden sm:flex bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10">
                    <div className="flex justify-between items-center w-full px-6 py-5 sm:py-6">
                        <div className="flex-1 flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-2">
                                    <BarChart3 className="h-5 w-5 text-violet-600" />
                                </div>
                            </div>
                            <div>
                                <CardTitle className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                                    {title}
                                </CardTitle>
                                <p className="text-sm text-violet-600/70 mt-1">Интерактивная аналитика данных</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {isSelecting && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-2"
                                >
                                    <Badge
                                        variant="secondary"
                                        className="bg-violet-100 text-violet-700 border-violet-200"
                                    >
                                        <Sparkles className="h-3 w-3 mr-1" />
                                        Выделение области
                                    </Badge>
                                </motion.div>
                            )}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="bg-white/80 backdrop-blur-sm border-white/50 hover:bg-white/90 hover:shadow-lg transition-all duration-300"
                                    >
                                        <Settings className="h-4 w-4 text-violet-600" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-80 bg-white/90 backdrop-blur-lg border border-white/50 shadow-xl rounded-xl"
                                >
                                    <div className="p-4 space-y-6">
                                        {/* Chart Type Section */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1 bg-violet-100 rounded">
                                                    <BarChart3 className="h-3 w-3 text-violet-600" />
                                                </div>
                                                <span className="text-sm font-medium text-violet-700">
                                                    Тип диаграммы
                                                </span>
                                            </div>
                                            <Tabs
                                                value={selectedChartType}
                                                onValueChange={(value: string) => {
                                                    if (value in CHART_TYPES) {
                                                        setSelectedChartType(value as ChartType);
                                                    }
                                                }}
                                                className="w-full"
                                            >
                                                <TabsList className="grid w-full grid-cols-2 bg-violet-50 border border-violet-200">
                                                    {Object.entries(CHART_TYPES).map(([type, config]) => {
                                                        const Icon = config.icon;
                                                        return (
                                                            <TabsTrigger
                                                                key={type}
                                                                value={type}
                                                                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-fuchsia-600 data-[state=active]:text-white"
                                                            >
                                                                <Icon className="h-4 w-4 mr-2" />
                                                                {config.label}
                                                            </TabsTrigger>
                                                        );
                                                    })}
                                                </TabsList>
                                            </Tabs>
                                        </div>
                                        <DropdownMenuSeparator className="bg-violet-200/50" />
                                        {/* Date Format Section */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1 bg-violet-100 rounded">
                                                    <Calendar className="h-3 w-3 text-violet-600" />
                                                </div>
                                                <span className="text-sm font-medium text-violet-700">Формат даты</span>
                                            </div>
                                            <DateFormatSelector
                                                selectedFormat={selectedFormat}
                                                onFormatChange={setSelectedFormat}
                                            />
                                        </div>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="relative z-10 px-2 sm:p-6 h-full sm:h-[calc(100%-150px)]">
                    <ChartContainer config={chartUtils.generateConfig(aggregatorConfig)} className="w-full h-full">
                        <div className="h-full" ref={chartRef} style={{ touchAction: 'none' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart
                                    data={groupedData}
                                    margin={{
                                        top: 20,
                                        right: 20,
                                        left: 10,
                                        bottom: 10,
                                    }}
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseUp}
                                >
                                    <defs>
                                        {Object.keys(aggregatorConfig).map((key, index) => {
                                            const color = chartUtils.getColor(index);
                                            return (
                                                <linearGradient
                                                    key={key}
                                                    id={`gradient-${index}`}
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                >
                                                    <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                                                </linearGradient>
                                            );
                                        })}
                                    </defs>
                                    <CartesianGrid
                                        vertical={false}
                                        stroke="rgba(148, 163, 184, 0.2)"
                                        strokeDasharray="3 3"
                                    />
                                    <XAxis
                                        dataKey="dateLabel"
                                        tickFormatter={(label) => dateUtils.format(label, selectedFormat)}
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        minTickGap={16}
                                        style={{ fontSize: '11px', userSelect: 'none', fill: '#64748b' }}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        style={{ fontSize: '11px', userSelect: 'none', fill: '#64748b' }}
                                        width={60}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={
                                            <ChartTooltipContent
                                                className="w-[150px] sm:w-[200px] font-mono text-xs sm:text-sm bg-white/90 backdrop-blur-lg border border-white/50 shadow-xl rounded-lg"
                                                nameKey=""
                                                labelFormatter={(value) => dateUtils.format(value, selectedFormat)}
                                            />
                                        }
                                    />
                                    <ChartLegend
                                        content={
                                            <ChartLegendContent className="text-xs text-slate-600 bg-white/80 backdrop-blur-sm rounded-lg p-2" />
                                        }
                                    />
                                    {Object.keys(aggregatorConfig).map((key, index) => {
                                        const ChartComponent = selectedChartConfig.component;
                                        return (
                                            <ChartComponent
                                                key={key}
                                                dataKey={key}
                                                stroke={chartUtils.getColor(index)}
                                                fill={`url(#gradient-${index})`}
                                                strokeWidth={2}
                                                {...selectedChartConfig.config}
                                            />
                                        );
                                    })}
                                    <AnimatePresence>
                                        {refAreaLeft && refAreaRight && (
                                            <ReferenceArea
                                                x1={refAreaLeft}
                                                x2={refAreaRight}
                                                strokeOpacity={0.3}
                                                fill="hsl(var(--violet-500))"
                                                fillOpacity={0.1}
                                                stroke="hsl(var(--violet-500))"
                                                strokeWidth={2}
                                                strokeDasharray="5 5"
                                            />
                                        )}
                                    </AnimatePresence>
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartContainer>
                </CardContent>

                <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                    <BarChart3 className="h-20 w-20 text-violet-500 transform rotate-12" />
                </div>
            </Card>
        </motion.div>
    );
}

// TODO: Add zoom functionality
