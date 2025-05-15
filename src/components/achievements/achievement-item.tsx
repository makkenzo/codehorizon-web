'use client';

import { useMemo } from 'react';

import { CheckCircle, Lock, Star } from 'lucide-react';

import AchievementIcon from '@/components/reusable/achievement-icon';
import { cn } from '@/lib/utils';
import { AchievementRarity, GlobalAchievementDTO } from '@/types/achievements';

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
        cardBg: 'bg-card hover:bg-muted/50',
        border: 'border-border hover:border-foreground/30',
        iconWrapperBg: 'bg-muted',
        iconColor: 'text-muted-foreground',
        titleColor: isEarned ? 'text-foreground' : 'text-muted-foreground',
        descriptionColor: isEarned ? 'text-muted-foreground' : 'text-muted-foreground/70',
        xpBadgeBg: 'bg-muted text-muted-foreground',
        categoryBadgeClasses: 'border-border/50 text-muted-foreground bg-muted/50',
        rarityBadgeClasses: 'border-muted text-muted-foreground',
    };

    switch (rarity) {
        case AchievementRarity.COMMON:
            raritySpecificStyles = {
                ...raritySpecificStyles,
                cardBg: 'bg-slate-100/70 dark:bg-slate-800/30',
                border: 'border-slate-500/20 hover:border-slate-500/40',
                iconWrapperBg: 'bg-slate-500/10 dark:bg-slate-700/20',
                iconColor: 'text-slate-500 dark:text-slate-400',
                titleColor: isEarned ? 'text-slate-700 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400',
                descriptionColor: isEarned
                    ? 'text-slate-600 dark:text-slate-300'
                    : 'text-slate-500/80 dark:text-slate-400/80',
                xpBadgeBg: 'bg-slate-500/80 text-white',
                categoryBadgeClasses: 'border-slate-500/30 text-slate-600 dark:text-slate-300 bg-slate-500/10',
                rarityBadgeClasses: 'border-slate-500 text-slate-600 dark:text-slate-300',
            };
            break;
        case AchievementRarity.UNCOMMON:
            raritySpecificStyles = {
                ...raritySpecificStyles,
                cardBg: 'bg-green-500/5 dark:bg-green-700/10',
                border: 'border-green-500/30 hover:border-green-500/50',
                iconWrapperBg: 'bg-green-500/10 dark:bg-green-700/20',
                iconColor: 'text-green-500 dark:text-green-400',
                titleColor: isEarned ? 'text-green-700 dark:text-green-200' : 'text-green-500 dark:text-green-400',
                descriptionColor: isEarned
                    ? 'text-green-600 dark:text-green-300'
                    : 'text-green-500/80 dark:text-green-400/80',
                xpBadgeBg: 'bg-green-500 text-white',
                categoryBadgeClasses: 'border-green-500/30 text-green-600 dark:text-green-300 bg-green-500/10',
                rarityBadgeClasses: 'border-green-500 text-green-600 dark:text-green-300',
            };
            break;
        case AchievementRarity.RARE:
            raritySpecificStyles = {
                ...raritySpecificStyles,
                cardBg: 'bg-blue-500/5 dark:bg-blue-700/10',
                border: 'border-blue-500/30 hover:border-blue-500/50',
                iconWrapperBg: 'bg-blue-500/10 dark:bg-blue-700/20',
                iconColor: 'text-blue-500 dark:text-blue-400',
                titleColor: isEarned ? 'text-blue-700 dark:text-blue-200' : 'text-blue-500 dark:text-blue-400',
                descriptionColor: isEarned
                    ? 'text-blue-600 dark:text-blue-300'
                    : 'text-blue-500/80 dark:text-blue-400/80',
                xpBadgeBg: 'bg-blue-500 text-white',
                categoryBadgeClasses: 'border-blue-500/30 text-blue-600 dark:text-blue-300 bg-blue-500/10',
                rarityBadgeClasses: 'border-blue-500 text-blue-600 dark:text-blue-300',
            };
            break;
        case AchievementRarity.EPIC:
            raritySpecificStyles = {
                ...raritySpecificStyles,
                cardBg: 'bg-purple-500/5 dark:bg-purple-700/10',
                border: 'border-purple-500/30 hover:border-purple-500/50',
                iconWrapperBg: 'bg-purple-500/10 dark:bg-purple-700/20',
                iconColor: 'text-purple-500 dark:text-purple-400',
                titleColor: isEarned ? 'text-purple-700 dark:text-purple-200' : 'text-purple-500 dark:text-purple-400',
                descriptionColor: isEarned
                    ? 'text-purple-600 dark:text-purple-300'
                    : 'text-purple-500/80 dark:text-purple-400/80',
                xpBadgeBg: 'bg-purple-500 text-white',
                categoryBadgeClasses: 'border-purple-500/30 text-purple-600 dark:text-purple-300 bg-purple-500/10',
                rarityBadgeClasses: 'border-purple-500 text-purple-600 dark:text-purple-300',
            };
            break;
        case AchievementRarity.LEGENDARY:
            raritySpecificStyles = {
                ...raritySpecificStyles,
                cardBg: 'bg-amber-400/5 dark:bg-amber-600/10 shadow-amber-500/5 hover:shadow-amber-500/10',
                border: 'border-amber-500/30 hover:border-amber-500/50',
                iconWrapperBg: 'bg-amber-400/10 dark:bg-amber-600/20',
                iconColor: 'text-amber-500 dark:text-amber-400',
                titleColor: isEarned ? 'text-amber-700 dark:text-amber-200' : 'text-amber-500 dark:text-amber-400',
                descriptionColor: isEarned
                    ? 'text-amber-600 dark:text-amber-300'
                    : 'text-amber-500/80 dark:text-amber-400/80',
                xpBadgeBg: 'bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold',
                categoryBadgeClasses: 'border-amber-500/30 text-amber-600 dark:text-amber-300 bg-amber-400/10',
                rarityBadgeClasses: 'border-amber-500 text-amber-600 dark:text-amber-300 font-semibold',
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
        ? `Разблокируется после получения: ${prerequisites.join(', ')}` // TODO: Заменить ключи на имена, если есть allAchievementsMap
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
                        'absolute top-4 right-4 text-[10px] px-1.5 py-0.5 font-medium leading-tight',
                        styles.rarityBadgeClasses
                    )}
                >
                    {rarity}
                </Badge>
            )}

            <div className={cn('flex items-start gap-3', compact ? 'mb-0' : 'mb-1')}>
                <div
                    className={cn(
                        'flex-shrink-0 p-2 rounded-lg border transition-all duration-300',
                        !isLockedByPrerequisites && 'group-hover:scale-105',
                        styles.iconWrapperBg,
                        isEarnedByUser ? styles.border : 'border-transparent opacity-80 group-hover:opacity-100',
                        compact && 'mx-auto shadow-xl'
                    )}
                >
                    <AchievementIcon
                        iconName={iconUrl}
                        className={cn('size-6', styles.iconColor, compact && 'size-8')}
                    />
                </div>
                {!compact ? (
                    <div className="flex-1 min-w-0">
                        <h3 className={cn('font-semibold line-clamp-2', styles.titleColor)} title={name}>
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
                    <Lock className="h-4 w-4 text-muted-foreground absolute top-3 right-3" />
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
                        compact ? 'border-none pt-1' : 'border-t'
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

    return cardMainContent;
};

export default AchievementItem;
