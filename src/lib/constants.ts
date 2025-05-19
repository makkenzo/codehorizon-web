import {
    Award,
    BadgeCheck,
    BookOpen,
    CalendarClock,
    CheckCircle2,
    ChevronsUp,
    Crown,
    Edit3,
    FileCheck,
    FilePlus2,
    Flame,
    GraduationCap,
    Heart,
    Layers,
    ListChecks,
    LucideIcon,
    Medal,
    MessagesSquare,
    Moon,
    MousePointerClick,
    Sparkles,
    Star,
    Target,
    Timer,
    Trophy,
    UserCheck,
    Users,
} from 'lucide-react';
import { z } from 'zod';

import { AchievementRarity, AchievementTriggerType } from '@/types/achievements';

export const fadeInVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
};

export const heroFadeInVariants = {
    hidden: { opacity: 0, y: 0 },
    visible: { opacity: 1, y: 0 },
};

export enum FormSectionId {
    BASIC = 'basic',
    TRIGGER = 'trigger',
    REWARD = 'reward',
    PREREQUISITES = 'prerequisites',
}

export const FORM_SECTIONS = [
    { id: FormSectionId.BASIC, label: 'Основная информация', icon: Trophy },
    { id: FormSectionId.TRIGGER, label: 'Условия получения', icon: Target },
    { id: FormSectionId.REWARD, label: 'Награда и отображение', icon: Star },
    { id: FormSectionId.PREREQUISITES, label: 'Предусловия', icon: Layers },
];

export const RARITY_CONFIG: Record<
    AchievementRarity,
    {
        label: string;
        icon: LucideIcon;
        gradient: string;
        gradientHover: string;
        lightGradient: string;
        color: string;
        bgColor: string;
    }
> = {
    [AchievementRarity.COMMON]: {
        label: 'Common',
        icon: BadgeCheck,
        gradient: 'from-cyan-500 to-blue-500',
        gradientHover: 'from-cyan-600 to-blue-600',
        lightGradient: 'from-cyan-100 to-blue-100',
        color: 'text-cyan-500',
        bgColor: 'bg-cyan-500',
    },
    [AchievementRarity.UNCOMMON]: {
        label: 'Uncommon',
        icon: Award,
        gradient: 'from-emerald-500 to-green-600',
        gradientHover: 'from-emerald-600 to-green-700',
        lightGradient: 'from-emerald-100 to-green-100',
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500',
    },
    [AchievementRarity.RARE]: {
        label: 'Rare',
        icon: Trophy,
        gradient: 'from-blue-500 to-indigo-600',
        gradientHover: 'from-blue-600 to-indigo-700',
        lightGradient: 'from-blue-100 to-indigo-100',
        color: 'text-blue-500',
        bgColor: 'bg-blue-500',
    },
    [AchievementRarity.EPIC]: {
        label: 'Epic',
        icon: Sparkles,
        gradient: 'from-purple-500 to-pink-500',
        gradientHover: 'from-purple-600 to-pink-600',
        lightGradient: 'from-purple-100 to-pink-100',
        color: 'text-purple-500',
        bgColor: 'bg-purple-500',
    },
    [AchievementRarity.LEGENDARY]: {
        label: 'Legendary',
        icon: Crown,
        gradient: 'from-amber-400 to-orange-500',
        gradientHover: 'from-amber-500 to-orange-600',
        lightGradient: 'from-amber-100 to-orange-100',
        color: 'text-amber-500',
        bgColor: 'bg-amber-500',
    },
};

export const TRIGGER_TYPE_CONFIG: Record<AchievementTriggerType, { label: string; icon: LucideIcon }> = {
    [AchievementTriggerType.COURSE_COMPLETION_COUNT]: { label: 'Количество пройденных курсов', icon: GraduationCap },
    [AchievementTriggerType.SPECIFIC_COURSE_COMPLETED]: { label: 'Пройден конкретный курс', icon: CheckCircle2 },
    [AchievementTriggerType.CATEGORY_COURSES_COMPLETED]: { label: 'Пройдены курсы из категории', icon: Layers },
    [AchievementTriggerType.COURSE_CREATION_COUNT]: { label: 'Количество созданных курсов', icon: FilePlus2 },
    [AchievementTriggerType.LESSON_COMPLETION_COUNT_TOTAL]: {
        label: 'Общее количество пройденных уроков',
        icon: ListChecks,
    },
    [AchievementTriggerType.LESSON_COMPLETION_STREAK_DAILY]: {
        label: 'Ежедневная серия пройденных уроков',
        icon: Flame,
    },
    [AchievementTriggerType.REVIEW_COUNT]: { label: 'Количество написанных отзывов', icon: MessagesSquare },
    [AchievementTriggerType.FIRST_COURSE_COMPLETED]: { label: 'Первый пройденный курс', icon: Award },
    [AchievementTriggerType.FIRST_REVIEW_WRITTEN]: { label: 'Первый написанный отзыв', icon: Edit3 },
    [AchievementTriggerType.PROFILE_COMPLETION_PERCENT]: { label: 'Процент заполнения профиля', icon: UserCheck },
    [AchievementTriggerType.DAILY_LOGIN_STREAK]: { label: 'Ежедневная серия входов', icon: CalendarClock },
    [AchievementTriggerType.TOTAL_XP_EARNED]: { label: 'Всего заработано XP', icon: Sparkles },
    [AchievementTriggerType.LEVEL_REACHED]: { label: 'Достигнут уровень', icon: ChevronsUp },
    [AchievementTriggerType.SPECIFIC_LESSON_COMPLETED]: { label: 'Пройден конкретный урок', icon: FileCheck },
    [AchievementTriggerType.WISHLIST_ITEM_COUNT]: { label: 'Количество элементов в списке желаний', icon: Heart },
    [AchievementTriggerType.MENTOR_STUDENT_COURSE_COMPLETION]: { label: 'Студент ментора завершил курс', icon: Users },
    [AchievementTriggerType.MENTOR_TOTAL_STUDENT_COMPLETIONS]: {
        label: 'Всего завершений курсов студентами ментора',
        icon: Medal,
    },
    [AchievementTriggerType.CUSTOM_FRONTEND_EVENT]: {
        label: 'Пользовательское событие на фронтенде',
        icon: MousePointerClick,
    },
    [AchievementTriggerType.LESSON_COMPLETED_AT_NIGHT]: { label: 'Урок пройден в ночное время', icon: Moon },
    [AchievementTriggerType.FIRST_COURSE_COMPLETED_WITHIN_TIMEFRAME]: {
        label: 'Первый курс пройден за определённое время',
        icon: Timer,
    },
};

export const ACHIEVEMENT_FORM_SCHEMA = z.object({
    key: z
        .string()
        .min(3, 'Ключ должен содержать минимум 3 символа')
        .max(100, 'Ключ не должен превышать 100 символов')
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Ключ может содержать только строчные латинские буквы, цифры и дефисы'),
    name: z.string().min(1, 'Название обязательно').max(255),
    description: z.string().min(1, 'Описание обязательно').max(1000),
    iconUrl: z.string().url('Некорректный URL иконки').min(1, 'URL иконки обязателен'),
    triggerType: z.nativeEnum(AchievementTriggerType, { errorMap: () => ({ message: 'Выберите тип триггера' }) }),
    triggerThreshold: z.coerce.number().min(0, 'Порог не может быть отрицательным'),
    triggerThresholdValue: z.string().max(255).nullable().optional(),
    xpBonus: z.coerce.number().min(0, 'XP бонус не может быть отрицательным').default(0),
    rarity: z.nativeEnum(AchievementRarity).default(AchievementRarity.COMMON),
    isGlobal: z.boolean().default(true),
    order: z.coerce.number().min(0, 'Порядок не может быть отрицательным').default(0),
    category: z.string().max(100).nullable().optional(),
    isHidden: z.boolean().default(false),
    prerequisites: z.array(z.string().min(1, 'Ключ предусловия не может быть пустым')).optional().default([]),
});

export type AchievementFormData = z.infer<typeof ACHIEVEMENT_FORM_SCHEMA>;

export const INITIAL_ACHIEVEMENT_FORM_DATA: AchievementFormData = {
    key: '',
    name: '',
    description: '',
    iconUrl: '',
    triggerType: AchievementTriggerType.COURSE_COMPLETION_COUNT,
    triggerThreshold: 0,
    triggerThresholdValue: undefined,
    xpBonus: 0,
    rarity: AchievementRarity.COMMON,
    isGlobal: true,
    order: 0,
    category: undefined,
    isHidden: false,
    prerequisites: [],
};
