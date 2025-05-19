'use client';

import type React from 'react';
import { Suspense, useCallback, useMemo, useState } from 'react';

import { ArrowLeft, Loader2, Settings, Trophy } from 'lucide-react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useAchievementCategories } from '@/hooks/use-achievement-categories';
import { useAchievementFormEngine } from '@/hooks/use-achievement-form-engine';
import { FORM_SECTIONS, FormSectionId, RARITY_CONFIG } from '@/lib/constants';
import { AchievementRarity } from '@/types/achievements';
import type { AdminAchievementDTO } from '@/types/achievementsAdmin';

import FormSectionRenderer from './form-section-renderer';

interface AchievementFormProps {
    initialData?: AdminAchievementDTO | null;
    onFormSubmitSuccess: (data: AdminAchievementDTO) => void;
}

const AchievementForm: React.FC<AchievementFormProps> = ({ initialData, onFormSubmitSuccess }) => {
    const router = useRouter();
    const {
        form,
        isEditMode,
        isSubmitting,
        currentRarity,
        handleSubmit,
        prerequisiteFields,
        appendPrerequisite,
        removePrerequisite,
    } = useAchievementFormEngine(initialData, onFormSubmitSuccess);

    const { availableCategories, isLoadingCategories } = useAchievementCategories();

    const [activeSectionId, setActiveSectionId] = useState<FormSectionId>(FORM_SECTIONS[0].id);

    const currentRarityConfig = useMemo(
        () => RARITY_CONFIG[currentRarity] || RARITY_CONFIG[AchievementRarity.COMMON],
        [currentRarity]
    );

    const handleSectionChange = useCallback((sectionId: FormSectionId) => {
        setActiveSectionId(sectionId);
    }, []);

    const navigateToSection = useCallback(
        (direction: 'prev' | 'next') => {
            const currentIndex = FORM_SECTIONS.findIndex((s) => s.id === activeSectionId);
            const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
            if (newIndex >= 0 && newIndex < FORM_SECTIONS.length) {
                setActiveSectionId(FORM_SECTIONS[newIndex].id);
            }
        },
        [activeSectionId]
    );

    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="relative">
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-br from-purple-600/30 to-pink-500/30 rounded-full blur-3xl opacity-70 animate-pulse"></div>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gradient-to-br from-blue-600/30 to-cyan-500/30 rounded-full blur-3xl opacity-70 animate-pulse"></div>

                <div className="relative backdrop-blur-sm">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-64 bg-black/5 backdrop-blur-md rounded-3xl p-6 h-fit sticky top-0">
                            <div className="flex items-center gap-3 mb-8">
                                <div
                                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${currentRarityConfig.gradient} flex items-center justify-center text-white transition-colors duration-500`}
                                >
                                    <Trophy className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold">{isEditMode ? 'Редактирование' : 'Создание'}</h2>
                                    <p className="text-sm text-gray-500">Достижения</p>
                                </div>
                            </div>
                            <nav className="space-y-2">
                                {FORM_SECTIONS.map((section) => {
                                    const IconComponent = section.icon;
                                    return (
                                        <button
                                            key={section.id}
                                            onClick={() => handleSectionChange(section.id)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-500 ${
                                                activeSectionId === section.id
                                                    ? `bg-gradient-to-r ${currentRarityConfig.gradient} text-white shadow-lg shadow-${currentRarityConfig.bgColor.replace('bg-', '')}-500/20 scale-105`
                                                    : 'hover:bg-black/5 text-gray-700'
                                            }`}
                                        >
                                            <div
                                                className={`h-10 w-10 rounded-md px-2 shrink-0 flex items-center justify-center ${activeSectionId === section.id ? 'bg-white/20' : 'bg-black/5'}`}
                                            >
                                                <IconComponent className="h-5 w-5" />
                                            </div>
                                            <span className="font-medium text-left">{section.label}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push('/admin/achievements')}
                                    className="w-full bg-white/80 hover:bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Назад к списку
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1">
                            <Card className="border-0 py-0 bg-white/70 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden">
                                <CardHeader
                                    className={`bg-gradient-to-r ${currentRarityConfig.gradient} p-8 transition-colors duration-500`}
                                >
                                    <CardTitle className="flex items-center gap-3 text-3xl text-white">
                                        {isEditMode ? <Settings className="h-8 w-8" /> : <Trophy className="h-8 w-8" />}
                                        {isEditMode ? 'Редактировать Достижение' : 'Создать Новое Достижение'}
                                    </CardTitle>
                                    <CardDescription className="text-white/80 text-lg">
                                        {isEditMode
                                            ? `Изменение данных для "${initialData?.name || 'достижения'}"`
                                            : 'Заполните детали нового достижения.'}
                                    </CardDescription>
                                </CardHeader>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                                        <CardContent className="p-8">
                                            <Suspense
                                                fallback={
                                                    <div className="flex justify-center items-center h-64">
                                                        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
                                                    </div>
                                                }
                                            >
                                                {FORM_SECTIONS.map((section) => (
                                                    <div
                                                        key={section.id}
                                                        className={activeSectionId === section.id ? 'block' : 'hidden'}
                                                    >
                                                        <FormSectionRenderer
                                                            id={section.id}
                                                            form={form}
                                                            isSubmitting={isSubmitting}
                                                            currentRarityConfig={currentRarityConfig}
                                                            availableCategories={availableCategories}
                                                            isLoadingCategories={isLoadingCategories}
                                                            prerequisiteFields={prerequisiteFields}
                                                            appendPrerequisite={appendPrerequisite}
                                                            removePrerequisite={removePrerequisite}
                                                            isEditMode={isEditMode}
                                                        />
                                                    </div>
                                                ))}
                                            </Suspense>
                                        </CardContent>
                                        <CardFooter
                                            className={`p-8 bg-gradient-to-r ${currentRarityConfig.lightGradient} border-t border-gray-200 transition-colors duration-500`}
                                        >
                                            <div className="w-full flex justify-between items-center">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => navigateToSection('prev')}
                                                    disabled={activeSectionId === FORM_SECTIONS[0].id || isSubmitting}
                                                    className="h-12 px-6 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-300"
                                                >
                                                    <ArrowLeft className="mr-2 h-5 w-5" /> Назад
                                                </Button>
                                                {activeSectionId === FORM_SECTIONS[FORM_SECTIONS.length - 1].id ? (
                                                    <Button
                                                        type="submit"
                                                        disabled={isSubmitting || !form.formState.isValid}
                                                        className={`h-12 px-8 rounded-xl bg-gradient-to-r ${currentRarityConfig.gradient} hover:${currentRarityConfig.gradientHover} text-white shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1`}
                                                    >
                                                        {isSubmitting && (
                                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                        )}
                                                        {isEditMode ? 'Сохранить изменения' : 'Создать достижение'}
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        onClick={() => navigateToSection('next')}
                                                        disabled={isSubmitting}
                                                        className={`h-12 px-8 rounded-xl bg-gradient-to-r ${currentRarityConfig.gradient} hover:${currentRarityConfig.gradientHover} text-white shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1`}
                                                    >
                                                        Далее
                                                    </Button>
                                                )}
                                            </div>
                                        </CardFooter>
                                    </form>
                                </Form>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AchievementForm;
