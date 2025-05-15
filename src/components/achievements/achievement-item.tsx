'use client';

import { useMemo } from 'react';

import { motion } from 'framer-motion';
import { CheckCircle, Lock, Star } from 'lucide-react';

import AchievementIcon from '@/components/reusable/achievement-icon';
import { cn } from '@/lib/utils';
import { AchievementRarity, type GlobalAchievementDTO } from '@/types/achievements';

import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface AchievementItemProps {
    achievement: GlobalAchievementDTO;
    compact?: boolean;
}

const getRarityStyles = (rarity?: AchievementRarity | string, isEarned?: boolean, isLocked?: boolean) => {
    const baseHover = !isLocked ? 'hover:shadow-lg hover:scale-[1.02]' : '';
    const earnedOpacity = isEarned ? 'opacity-100' : 'opacity-70 group-hover:opacity-100';
    const lockedStyles = isLocked
        ? 'opacity-50 filter grayscale cursor-not-allowed !shadow-none !scale-100 pointer-events-none'
        : baseHover;

    let raritySpecificStyles = {
        cardBg: 'bg-card hover:bg-muted/50 dark:bg-gray-800/30 dark:hover:bg-gray-700/40',
        border: 'border-border/30 hover:border-primary/40 dark:border-gray-700/50 dark:hover:border-primary/50',
        iconWrapperBg: 'bg-muted dark:bg-gray-700/50',
        iconColor: 'text-muted-foreground dark:text-gray-400',
        titleColor: isEarned ? 'text-foreground dark:text-gray-100' : 'text-muted-foreground dark:text-gray-400',
        descriptionColor: isEarned
            ? 'text-muted-foreground dark:text-gray-300'
            : 'text-muted-foreground/70 dark:text-gray-400/70',
        xpBadgeBg: 'bg-muted text-muted-foreground dark:bg-gray-700 dark:text-gray-300',
        categoryBadgeClasses:
            'border-border/50 text-muted-foreground bg-muted/50 dark:border-gray-600 dark:text-gray-400 dark:bg-gray-700/50',
        rarityBadgeClasses: 'border-muted text-muted-foreground dark:border-gray-600 dark:text-gray-400',
    };

    switch (rarity) {
        case AchievementRarity.COMMON:
            raritySpecificStyles = {
                ...raritySpecificStyles,
                cardBg: 'bg-slate-100/70 dark:bg-slate-800/30',
                border: 'border-slate-500/20 hover:border-slate-500/40 dark:border-slate-700/50 dark:hover:border-slate-600/60',
                iconWrapperBg: 'bg-slate-500/10 dark:bg-slate-700/40',
                iconColor: 'text-slate-500 dark:text-slate-400',
                titleColor: isEarned ? 'text-slate-700 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400',
                descriptionColor: isEarned
                    ? 'text-slate-600 dark:text-slate-300'
                    : 'text-slate-500/80 dark:text-slate-400/80',
                xpBadgeBg: 'bg-slate-500/80 text-white dark:bg-slate-600',
                categoryBadgeClasses:
                    'border-slate-500/30 text-slate-600 dark:text-slate-300 bg-slate-500/10 dark:bg-slate-700/30',
                rarityBadgeClasses: 'border-slate-500 text-slate-600 dark:text-slate-300 dark:border-slate-600',
            };
            break;
        case AchievementRarity.UNCOMMON:
            raritySpecificStyles = {
                ...raritySpecificStyles,
                cardBg: 'bg-green-500/5 dark:bg-green-800/20',
                border: 'border-green-500/30 hover:border-green-500/50 dark:border-green-700/50 dark:hover:border-green-600/60',
                iconWrapperBg: 'bg-green-500/10 dark:bg-green-700/40',
                iconColor: 'text-green-500 dark:text-green-400',
                titleColor: isEarned ? 'text-green-700 dark:text-green-200' : 'text-green-500 dark:text-green-400',
                descriptionColor: isEarned
                    ? 'text-green-600 dark:text-green-300'
                    : 'text-green-500/80 dark:text-green-400/80',
                xpBadgeBg: 'bg-green-500 text-white dark:bg-green-600',
                categoryBadgeClasses:
                    'border-green-500/30 text-green-600 dark:text-green-300 bg-green-500/10 dark:bg-green-700/30',
                rarityBadgeClasses: 'border-green-500 text-green-600 dark:text-green-300 dark:border-green-600',
            };
            break;
        case AchievementRarity.RARE:
            raritySpecificStyles = {
                ...raritySpecificStyles,
                cardBg: 'bg-primary/5 dark:bg-primary/10',
                border: 'border-primary/30 hover:border-primary/50 dark:border-primary/40 dark:hover:border-primary/60',
                iconWrapperBg: 'bg-primary/10 dark:bg-primary/20',
                iconColor: 'text-primary dark:text-primary/90',
                titleColor: isEarned
                    ? 'text-primary-focus dark:text-primary-content'
                    : 'text-primary dark:text-primary/90',
                descriptionColor: isEarned
                    ? 'text-primary/80 dark:text-primary/70'
                    : 'text-primary/70 dark:text-primary/60',
                xpBadgeBg: 'bg-primary text-primary-foreground dark:bg-primary/80',
                categoryBadgeClasses:
                    'border-primary/30 text-primary dark:text-primary/90 bg-primary/10 dark:bg-primary/20',
                rarityBadgeClasses:
                    'border-primary text-primary dark:text-primary/90 dark:border-primary/70 font-medium',
            };
            break;
        case AchievementRarity.EPIC:
            raritySpecificStyles = {
                ...raritySpecificStyles,
                cardBg: 'bg-purple-500/5 dark:bg-purple-800/20',
                border: 'border-purple-500/30 hover:border-purple-500/50 dark:border-purple-700/50 dark:hover:border-purple-600/60',
                iconWrapperBg: 'bg-purple-500/10 dark:bg-purple-700/40',
                iconColor: 'text-purple-500 dark:text-purple-400',
                titleColor: isEarned ? 'text-purple-700 dark:text-purple-200' : 'text-purple-500 dark:text-purple-400',
                descriptionColor: isEarned
                    ? 'text-purple-600 dark:text-purple-300'
                    : 'text-purple-500/80 dark:text-purple-400/80',
                xpBadgeBg: 'bg-purple-500 text-white dark:bg-purple-600',
                categoryBadgeClasses:
                    'border-purple-500/30 text-purple-600 dark:text-purple-300 bg-purple-500/10 dark:bg-purple-700/30',
                rarityBadgeClasses:
                    'border-purple-500 text-purple-600 dark:text-purple-300 dark:border-purple-600 font-semibold',
            };
            break;
        case AchievementRarity.LEGENDARY:
            raritySpecificStyles = {
                ...raritySpecificStyles,
                cardBg: 'bg-amber-400/10 dark:bg-amber-700/20 shadow-amber-500/10 hover:shadow-amber-500/20',
                border: 'border-amber-500/40 hover:border-amber-500/60 dark:border-amber-600/50 dark:hover:border-amber-500/70',
                iconWrapperBg:
                    'bg-gradient-to-br from-amber-400/20 to-orange-500/20 dark:from-amber-600/30 dark:to-orange-700/30',
                iconColor: 'text-amber-500 dark:text-amber-400',
                titleColor: isEarned
                    ? 'text-amber-700 dark:text-amber-200 font-bold'
                    : 'text-amber-600 dark:text-amber-300 font-semibold',
                descriptionColor: isEarned
                    ? 'text-amber-600 dark:text-amber-300'
                    : 'text-amber-500/80 dark:text-amber-400/80',
                xpBadgeBg: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold shadow-sm',
                categoryBadgeClasses:
                    'border-amber-500/30 text-amber-700 dark:text-amber-300 bg-amber-400/10 dark:bg-amber-700/30 font-medium',
                rarityBadgeClasses:
                    'border-amber-500 text-amber-700 dark:text-amber-300 dark:border-amber-600 font-bold text-xs tracking-wider uppercase',
            };
            break;
    }
    return {
        ...raritySpecificStyles,
        cardDynamic: cn(raritySpecificStyles.cardBg, raritySpecificStyles.border, earnedOpacity, lockedStyles),
    };
};

const AchievementItem: React.FC<AchievementItemProps> = ({ achievement, compact = false }) => {
    const {
        name,
        description,
        iconUrl,
        xpBonus,
        isEarnedByUser,
        earnedAt,
        category,
        rarity,
        prerequisites = [],
    } = achievement;

    const isLockedByPrerequisites = useMemo(() => {
        return !isEarnedByUser && prerequisites && prerequisites.length > 0;
    }, [isEarnedByUser, prerequisites]);

    const styles = getRarityStyles(rarity, isEarnedByUser, isLockedByPrerequisites);

    const earnedDateFormatted = earnedAt
        ? new Date(earnedAt).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
          })
        : null;

    const tooltipContent = isLockedByPrerequisites
        ? `Разблокируется после получения: ${prerequisites.join(', ')}`
        : description;

    const cardMainContent = (
        <div
            className={cn(
                'flex flex-col h-full gap-2 overflow-hidden transition-all duration-300 rounded-xl shadow-sm p-4 relative group',
                styles.cardDynamic
            )}
        >
            {rarity !== AchievementRarity.COMMON && !compact && (
                <Badge
                    variant="outline"
                    className={cn(
                        'absolute top-3 right-3 text-[10px] px-1.5 py-0.5 font-medium leading-tight z-10',
                        styles.rarityBadgeClasses
                    )}
                >
                    {rarity}
                </Badge>
            )}

            <div className={cn('flex items-start gap-3', compact ? 'mb-0 flex-col items-center text-center' : 'mb-1')}>
                <div
                    className={cn(
                        'flex-shrink-0 p-2 rounded-lg border transition-all duration-300',
                        !isLockedByPrerequisites && 'group-hover:scale-105',
                        styles.iconWrapperBg,
                        isEarnedByUser ? styles.border : 'border-transparent opacity-80 group-hover:opacity-100',
                        compact && 'shadow-xl'
                    )}
                >
                    <AchievementIcon
                        iconName={iconUrl}
                        className={cn('size-6', styles.iconColor, compact && 'size-8')}
                    />
                </div>
                {!compact ? (
                    <div className="flex-1 min-w-0">
                        <h3 className={cn('font-semibold line-clamp-2 text-base', styles.titleColor)} title={name}>
                            {name}
                        </h3>
                        {category && (
                            <Badge
                                variant={'outline'}
                                className={cn(
                                    'text-[10px] px-1.5 py-0 mt-0.5 font-normal leading-tight',
                                    styles.categoryBadgeClasses
                                )}
                            >
                                {category}
                            </Badge>
                        )}
                    </div>
                ) : null}
                {isLockedByPrerequisites && !compact && (
                    <Lock className="h-4 w-4 text-muted-foreground absolute top-3.5 right-3.5" />
                )}
            </div>

            {!compact && (
                <p
                    className={cn(
                        'text-sm text-muted-foreground line-clamp-3 min-h-[42px] flex-grow',
                        styles.descriptionColor,
                        isLockedByPrerequisites && 'blur-[1.5px] select-none'
                    )}
                >
                    {description}
                </p>
            )}

            {!compact ? (
                <div
                    className={cn(
                        'mt-auto pt-2 border-t flex justify-between items-center border-dashed',
                        compact ? 'border-none pt-1 flex-col gap-1.5' : 'border-t'
                    )}
                    style={{
                        borderColor: compact
                            ? undefined
                            : styles.border.split(' ').pop()?.replace('hover:', '')?.replace('/30', '/15'),
                    }}
                >
                    <Badge
                        variant={'secondary'}
                        className={cn('text-xs py-0.5 px-2', styles.xpBadgeBg, compact && 'py-0 px-1.5 text-[10px]')}
                    >
                        <Star className={cn('mr-1 h-3 w-3', compact && 'h-2.5 w-2.5 mr-0.5')} />
                        {xpBonus} XP
                    </Badge>
                    {isEarnedByUser && earnedDateFormatted && !compact ? (
                        <div className="flex items-center text-[10px] text-green-600 dark:text-green-400 cursor-default">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            {earnedDateFormatted}
                        </div>
                    ) : !isEarnedByUser && !isLockedByPrerequisites && !compact ? (
                        <span className="text-xs text-blue-500 dark:text-blue-400 italic">Не получено</span>
                    ) : null}
                </div>
            ) : null}
        </div>
    );

    return (
        <TooltipProvider delayDuration={200}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <motion.div className="h-full" whileHover={{ y: -2, transition: { duration: 0.2 } }}>
                        {cardMainContent}
                    </motion.div>
                </TooltipTrigger>
                {(isLockedByPrerequisites || description.length > 80) && !compact && (
                    <TooltipContent side="bottom" align="center" className="max-w-xs text-center">
                        <p>{tooltipContent}</p>
                    </TooltipContent>
                )}
            </Tooltip>
        </TooltipProvider>
    );
};

export default AchievementItem;
