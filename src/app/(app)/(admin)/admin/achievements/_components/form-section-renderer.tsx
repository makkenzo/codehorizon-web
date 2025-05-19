import { createElement, useMemo } from 'react';

import {
    Crown,
    Eye,
    EyeOff,
    Globe,
    ImageIcon,
    Key,
    Layers,
    MessageSquareText,
    PlusCircle,
    Settings,
    Sparkles,
    Trash2,
    TrendingUp,
    Type,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAchievementFormEngine } from '@/hooks/use-achievement-form-engine';
import { FORM_SECTIONS, FormSectionId, RARITY_CONFIG, TRIGGER_TYPE_CONFIG } from '@/lib/constants';
import { AchievementRarity, AchievementTriggerType } from '@/types/achievements';

interface FormSectionRendererProps {
    id: FormSectionId;
    form: ReturnType<typeof useAchievementFormEngine>['form'];
    isSubmitting: boolean;
    currentRarityConfig: (typeof RARITY_CONFIG)[AchievementRarity];
    availableCategories: string[];
    isLoadingCategories: boolean;
    prerequisiteFields: ReturnType<typeof useAchievementFormEngine>['prerequisiteFields'];
    appendPrerequisite: ReturnType<typeof useAchievementFormEngine>['appendPrerequisite'];
    removePrerequisite: ReturnType<typeof useAchievementFormEngine>['removePrerequisite'];
    isEditMode: boolean;
}

const FormSectionRenderer: React.FC<FormSectionRendererProps> = ({
    id,
    form,
    isSubmitting,
    currentRarityConfig,
    availableCategories,
    isLoadingCategories,
    prerequisiteFields,
    appendPrerequisite,
    removePrerequisite,
    isEditMode,
}) => {
    const rarityOptions = useMemo(
        () =>
            Object.entries(RARITY_CONFIG).map(([value, config]) => ({
                value: value as AchievementRarity,
                label: config.label,
                icon: config.icon,
                color: config.color,
                bgColor: config.bgColor,
            })),
        []
    );

    const triggerTypeOptions = useMemo(
        () =>
            Object.entries(TRIGGER_TYPE_CONFIG).map(([value, config]) => ({
                value: value as AchievementTriggerType,
                label: config.label,
                icon: config.icon,
            })),
        []
    );

    const { gradient } = currentRarityConfig;

    const renderSectionContent = () => {
        switch (id) {
            case FormSectionId.BASIC:
                return (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="key"
                                render={({ field }) => (
                                    <FormItem className="group">
                                        <FormLabel className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-2">
                                            <div
                                                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white transition-colors duration-500`}
                                            >
                                                <Key className="h-4 w-4" />
                                            </div>
                                            Уникальный ключ *
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="first-course-completed"
                                                {...field}
                                                disabled={isSubmitting || isEditMode}
                                                className="h-12 pl-4 pr-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white/80 backdrop-blur-sm shadow-sm group-hover:shadow-md transition-all duration-300"
                                            />
                                        </FormControl>
                                        <FormDescription className="text-gray-500 text-sm mt-2">
                                            Латиница, цифры, дефисы. Не меняется после создания.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="group">
                                        <FormLabel className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-2">
                                            <div
                                                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white transition-colors duration-500`}
                                            >
                                                <Type className="h-4 w-4" />
                                            </div>
                                            Название *
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Первопроходец"
                                                {...field}
                                                disabled={isSubmitting}
                                                className="h-12 pl-4 pr-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white/80 backdrop-blur-sm shadow-sm group-hover:shadow-md transition-all duration-300"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem className="group">
                                    <FormLabel className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-2">
                                        <div
                                            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white transition-colors duration-500`}
                                        >
                                            <MessageSquareText className="h-4 w-4" />
                                        </div>
                                        Описание *
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Завершите свой первый курс на платформе"
                                            {...field}
                                            disabled={isSubmitting}
                                            rows={3}
                                            className="pl-4 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white/80 backdrop-blur-sm shadow-sm group-hover:shadow-md transition-all duration-300"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="iconUrl"
                            render={({ field }) => (
                                <FormItem className="group">
                                    <FormLabel className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-2">
                                        <div
                                            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white transition-colors duration-500`}
                                        >
                                            <ImageIcon className="h-4 w-4" />
                                        </div>
                                        URL иконки *
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="https://example.com/icon.png"
                                            {...field}
                                            disabled={isSubmitting}
                                            className="h-12 pl-4 pr-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white/80 backdrop-blur-sm shadow-sm group-hover:shadow-md transition-all duration-300"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                );
            case FormSectionId.TRIGGER:
                return (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="triggerType"
                                render={({ field }) => (
                                    <FormItem className="group">
                                        <FormLabel className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-2">
                                            <div
                                                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white transition-colors duration-500`}
                                            >
                                                <Settings className="h-4 w-4" />
                                            </div>
                                            Тип триггера *
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={isSubmitting}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="h-12 pl-4 pr-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white/80 backdrop-blur-sm shadow-sm group-hover:shadow-md transition-all duration-300">
                                                    <SelectValue placeholder="Выберите тип" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-white/90 backdrop-blur-md border-gray-200 rounded-xl shadow-xl">
                                                {triggerTypeOptions.map((opt) => (
                                                    <SelectItem
                                                        key={opt.value}
                                                        value={opt.value}
                                                        className="flex items-center gap-2 py-3 px-2 focus:bg-purple-50 rounded-lg my-1 cursor-pointer"
                                                    >
                                                        <div
                                                            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white transition-colors duration-500`}
                                                        >
                                                            {createElement(opt.icon, {
                                                                className: 'h-5 w-5 text-white',
                                                            })}
                                                        </div>
                                                        <span className="font-medium">{opt.label}</span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="triggerThreshold"
                                render={({ field }) => (
                                    <FormItem className="group">
                                        <FormLabel className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-2">
                                            <div
                                                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white transition-colors duration-500`}
                                            >
                                                <TrendingUp className="h-4 w-4" />
                                            </div>
                                            Порог срабатывания *
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="5"
                                                {...field}
                                                disabled={isSubmitting}
                                                className="h-12 pl-4 pr-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white/80 backdrop-blur-sm shadow-sm group-hover:shadow-md transition-all duration-300"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="triggerThresholdValue"
                            render={({ field }) => (
                                <FormItem className="group">
                                    <FormLabel className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-2">
                                        <div
                                            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white transition-colors duration-500`}
                                        >
                                            <Layers className="h-4 w-4" />
                                        </div>
                                        Значение для порога (если применимо)
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="ID курса, ключ события, название категории..."
                                            {...field}
                                            value={field.value ?? ''}
                                            disabled={isSubmitting}
                                            className="h-12 pl-4 pr-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white/80 backdrop-blur-sm shadow-sm group-hover:shadow-md transition-all duration-300"
                                        />
                                    </FormControl>
                                    <FormDescription className="text-gray-500 text-sm mt-2">
                                        Например, ID курса для `SPECIFIC_COURSE_COMPLETED` или название категории для
                                        `CATEGORY_COURSES_COMPLETED`.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                );
            case FormSectionId.REWARD:
                return (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField
                                control={form.control}
                                name="xpBonus"
                                render={({ field }) => (
                                    <FormItem className="group">
                                        <FormLabel className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-2">
                                            <div
                                                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white transition-colors duration-500`}
                                            >
                                                <Sparkles className="h-4 w-4" />
                                            </div>
                                            XP Бонус
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="100"
                                                {...field}
                                                disabled={isSubmitting}
                                                className="h-12 pl-4 pr-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white/80 backdrop-blur-sm shadow-sm group-hover:shadow-md transition-all duration-300"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="rarity"
                                render={({ field }) => (
                                    <FormItem className="group">
                                        <FormLabel className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-2">
                                            <div
                                                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white transition-colors duration-500`}
                                            >
                                                <Crown className="h-4 w-4" />
                                            </div>
                                            Редкость
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={isSubmitting}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="h-12 pl-4 pr-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white/80 backdrop-blur-sm shadow-sm group-hover:shadow-md transition-all duration-300">
                                                    <SelectValue placeholder="Выберите редкость" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-white/90 backdrop-blur-md border-gray-200 rounded-xl shadow-xl">
                                                {rarityOptions.map((opt) => (
                                                    <SelectItem
                                                        key={opt.value}
                                                        value={opt.value}
                                                        className="flex items-center gap-2 py-3 px-2 focus:bg-purple-50 rounded-lg my-1 cursor-pointer"
                                                    >
                                                        <div
                                                            className={`w-8 h-8 rounded-lg ${opt.bgColor} flex items-center justify-center text-white`}
                                                        >
                                                            {createElement(opt.icon, {
                                                                className: 'text-white h-5 w-5',
                                                            })}
                                                        </div>
                                                        <span className={`font-medium ${opt.color}`}>{opt.label}</span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="order"
                                render={({ field }) => (
                                    <FormItem className="group">
                                        <FormLabel className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-2">
                                            <div
                                                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white transition-colors duration-500`}
                                            >
                                                <Layers className="h-4 w-4" />
                                            </div>
                                            Порядок отображения
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                {...field}
                                                disabled={isSubmitting}
                                                className="h-12 pl-4 pr-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white/80 backdrop-blur-sm shadow-sm group-hover:shadow-md transition-all duration-300"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem className="group">
                                    <FormLabel className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-2">
                                        <div
                                            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white transition-colors duration-500`}
                                        >
                                            <Layers className="h-4 w-4" />
                                        </div>
                                        Категория
                                    </FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value ?? ''}
                                        disabled={isSubmitting || isLoadingCategories}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="h-12 pl-4 pr-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white/80 backdrop-blur-sm shadow-sm group-hover:shadow-md transition-all duration-300">
                                                <SelectValue
                                                    placeholder={
                                                        isLoadingCategories
                                                            ? 'Загрузка...'
                                                            : 'Выберите или введите новую'
                                                    }
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-white/90 backdrop-blur-md border-gray-200 rounded-xl shadow-xl">
                                            {availableCategories.map((cat) => (
                                                <SelectItem
                                                    key={cat}
                                                    value={cat}
                                                    className="py-2 px-2 focus:bg-purple-50 rounded-lg my-1 cursor-pointer"
                                                >
                                                    {cat}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <div className="mt-3">
                                        <Input
                                            placeholder="Или введите новую категорию"
                                            onChange={(e) => field.onChange(e.target.value)}
                                            value={field.value ?? ''}
                                            className="h-12 pl-4 pr-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white/80 backdrop-blur-sm shadow-sm group-hover:shadow-md transition-all duration-300"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <FormDescription className="text-gray-500 text-sm mt-2">
                                        Выберите существующую или введите новую. Пустое значение - без категории.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <FormField
                                control={form.control}
                                name="isGlobal"
                                render={({ field }) => (
                                    <FormItem className="flex items-start gap-4 p-4 rounded-xl bg-white/80 backdrop-blur-sm border-2 border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group">
                                        <div
                                            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shrink-0 transition-colors duration-500`}
                                        >
                                            <Globe className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <FormLabel className="text-lg font-medium text-gray-700">
                                                    Глобальное
                                                </FormLabel>
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        disabled={isSubmitting}
                                                        className={`h-6 w-6 rounded-md border-2 border-${currentRarityConfig.color.replace('text-', '')}/30 data-[state=checked]:bg-gradient-to-r data-[state=checked]:${gradient} data-[state=checked]:border-0 focus:ring-${currentRarityConfig.color.replace('text-', '')} transition-colors duration-500`}
                                                    />
                                                </FormControl>
                                            </div>
                                            <FormDescription className="text-gray-500 text-sm mt-1">
                                                Доступно всем пользователям.
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="isHidden"
                                render={({ field }) => (
                                    <FormItem className="flex items-start gap-4 p-4 rounded-xl bg-white/80 backdrop-blur-sm border-2 border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group">
                                        <div
                                            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shrink-0 transition-colors duration-500`}
                                        >
                                            {field.value ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <FormLabel className="text-lg font-medium text-gray-700">
                                                    Скрытое
                                                </FormLabel>
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        disabled={isSubmitting}
                                                        className={`h-6 w-6 rounded-md border-2 border-${currentRarityConfig.color.replace('text-', '')}/30 data-[state=checked]:bg-gradient-to-r data-[state=checked]:${gradient} data-[state=checked]:border-0 focus:ring-${currentRarityConfig.color.replace('text-', '')} transition-colors duration-500`}
                                                    />
                                                </FormControl>
                                            </div>
                                            <FormDescription className="text-gray-500 text-sm mt-1">
                                                Не отображается в общем списке.
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                );
            case FormSectionId.PREREQUISITES:
                return (
                    <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                        <FormDescription className="text-gray-500 text-base mb-6">
                            Список ключей других достижений, которые должны быть получены перед этим.
                        </FormDescription>
                        <div className="space-y-4">
                            {prerequisiteFields.map((item, index) => (
                                <div key={item.id} className="flex items-center gap-3">
                                    <FormField
                                        control={form.control}
                                        name={`prerequisites.${index}`}
                                        render={({ field }) => (
                                            <FormItem className="flex-grow">
                                                <FormControl>
                                                    <div className="relative">
                                                        <Key
                                                            className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${currentRarityConfig.color} h-5 w-5 transition-colors duration-500`}
                                                        />
                                                        <Input
                                                            placeholder="Ключ предусловия"
                                                            {...field}
                                                            disabled={isSubmitting}
                                                            className="h-12 pl-12 pr-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removePrerequisite(index)}
                                        disabled={isSubmitting}
                                        className="h-12 w-12 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 border-2 border-red-200 hover:border-red-300 transition-all duration-300"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => appendPrerequisite('')}
                            disabled={isSubmitting}
                            className={`mt-6 h-12 px-6 rounded-xl bg-gradient-to-r ${currentRarityConfig.lightGradient} hover:from-${currentRarityConfig.color.replace('text-', '')}/20 hover:to-${currentRarityConfig.color.replace('text-', '')}/20 ${currentRarityConfig.color} border-2 border-${currentRarityConfig.color.replace('text-', '')}/20 hover:border-${currentRarityConfig.color.replace('text-', '')}/30 shadow-sm hover:shadow-md transition-all duration-500`}
                        >
                            <PlusCircle className="mr-2 h-5 w-5" /> Добавить предусловие
                        </Button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div>
            <div className="relative mb-10">
                <h3
                    className={`inline-block text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${gradient} transition-colors duration-500`}
                >
                    {FORM_SECTIONS.find((s) => s.id === id)?.label}
                </h3>
                <div
                    className={`absolute -bottom-3 left-0 w-20 h-1 bg-gradient-to-r ${gradient} rounded-full transition-colors duration-500`}
                ></div>
            </div>
            {renderSectionContent()}
        </div>
    );
};

export default FormSectionRenderer;
