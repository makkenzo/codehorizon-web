'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, Lightbulb, PlusCircle, Sparkles, Target, Trash2 } from 'lucide-react';
import { Control, FieldErrors, useFieldArray } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { CourseDetailsFormData } from './course-details-form';

interface FeatureEditorProps {
    control: Control<CourseDetailsFormData>;
    disabled?: boolean;
    errors: FieldErrors<CourseDetailsFormData>;
}

const FeatureEditor: React.FC<FeatureEditorProps> = ({ control, disabled, errors }) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'features',
    });

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 },
    };

    return (
        <motion.div
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50/80 to-cyan-50/80 backdrop-blur-sm border border-blue-200/50 shadow-lg group/section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5"></div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl opacity-60 group-hover/section:opacity-100 transition-opacity duration-700"></div>
            <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 rounded-full blur-2xl opacity-40 group-hover/section:opacity-80 transition-opacity duration-700"></div>

            <div className="relative z-10 flex items-center justify-between p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-b border-blue-200/30">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg blur opacity-75 group-hover/section:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-2">
                            <Lightbulb className="h-5 w-5 text-blue-600" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            Ключевые темы курса
                        </h3>
                        <p className="text-sm text-blue-600/70">Опишите основные темы, которые изучат студенты</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-blue-100 rounded-full">
                        <span className="text-xs font-medium text-blue-700">{fields.length} тем</span>
                    </div>
                    <Sparkles className="h-4 w-4 text-blue-500" />
                </div>
            </div>

            <div className="relative z-10 p-6">
                {fields.length === 0 ? (
                    <motion.div
                        className="text-center py-12"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="relative inline-block">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-lg opacity-75"></div>
                            <div className="relative bg-white/80 backdrop-blur-sm rounded-full p-4">
                                <Target className="h-8 w-8 text-blue-600" />
                            </div>
                        </div>
                        <h4 className="mt-4 text-lg font-medium text-blue-800">Добавьте первую тему</h4>
                        <p className="text-sm text-blue-600/70 mt-2 max-w-md mx-auto">
                            Расскажите студентам, какие конкретные навыки и знания они получат в вашем курсе
                        </p>
                    </motion.div>
                ) : (
                    <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
                        <AnimatePresence mode="wait" initial={false}>
                            {fields.map((field, index) => {
                                const featureErrors = errors.features?.[index];

                                return (
                                    <motion.div
                                        layout
                                        key={field.id}
                                        className="relative group/card"
                                        variants={item}
                                        initial="hidden"
                                        animate="show"
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="relative overflow-hidden rounded-xl bg-white/60 backdrop-blur-sm border border-white/50 shadow-md group-hover/card:shadow-lg transition-all duration-300">
                                            <div className="absolute top-4 left-4 w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                                                {index + 1}
                                            </div>

                                            <div className="pt-16 p-6 space-y-4">
                                                <FormField
                                                    control={control}
                                                    name={`features.${index}.title`}
                                                    render={({ field: titleField }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-blue-700 font-medium flex items-center gap-2">
                                                                <CheckCircle className="h-4 w-4" />
                                                                Заголовок темы *
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Например: Основы React Hooks"
                                                                    {...titleField}
                                                                    disabled={disabled}
                                                                    className="bg-white/80 backdrop-blur-sm border-blue-200/50 focus:border-blue-500/50 focus:ring-blue-500/20"
                                                                />
                                                            </FormControl>
                                                            <FormMessage>{featureErrors?.title?.message}</FormMessage>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={control}
                                                    name={`features.${index}.description`}
                                                    render={({ field: descField }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-blue-700 font-medium flex items-center gap-2">
                                                                <Target className="h-4 w-4" />
                                                                Описание темы *
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Textarea
                                                                    placeholder="Подробно опишите, что изучат студенты в этой теме..."
                                                                    className="min-h-[100px] bg-white/80 backdrop-blur-sm border-blue-200/50 focus:border-blue-500/50 focus:ring-blue-500/20"
                                                                    {...descField}
                                                                    disabled={disabled}
                                                                />
                                                            </FormControl>
                                                            <FormMessage>
                                                                {featureErrors?.description?.message}
                                                            </FormMessage>
                                                        </FormItem>
                                                    )}
                                                />

                                                <div className="flex justify-end pt-2">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => remove(index)}
                                                        disabled={disabled}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover/card:opacity-100 transition-all duration-300"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Удалить тему
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>
                )}

                <motion.div
                    className="flex justify-center pt-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                >
                    <Button
                        type="button"
                        onClick={() => append({ title: '', description: '' })}
                        disabled={disabled}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Добавить новую тему
                    </Button>
                </motion.div>

                {errors.features && errors.features.root && (
                    <motion.p
                        className="text-sm font-medium text-destructive mt-4 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {errors.features.root.message}
                    </motion.p>
                )}
            </div>

            <div className="absolute top-4 right-4 opacity-5 group-hover/section:opacity-10 transition-opacity duration-500">
                <Lightbulb className="h-20 w-20 text-blue-500 transform rotate-12" />
            </div>
        </motion.div>
    );
};

export default FeatureEditor;
