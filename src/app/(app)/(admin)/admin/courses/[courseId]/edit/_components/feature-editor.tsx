import { PlusCircle } from 'lucide-react';
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

    return (
        <div className="space-y-4 rounded-md border border-border/50 bg-card p-4 shadow-inner">
            <FormLabel className="text-base font-semibold block mb-2">Ключевые темы</FormLabel>
            {fields.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">Нет добавленных тем.</p>
            )}
            {fields.map((field, index) => {
                const featureErrors = errors.features?.[index];

                return (
                    <div
                        key={field.id}
                        className="flex flex-col md:flex-row items-start gap-4 border-b pb-4 last:border-b-0 last:pb-0 relative group"
                    >
                        <div className="flex-1 space-y-3 w-full">
                            <FormField
                                control={control}
                                name={`features.${index}.title`}
                                render={({ field: titleField }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Заголовок темы {index + 1} *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Название темы" {...titleField} disabled={disabled} />
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
                                        <FormLabel className="text-xs">Описание темы {index + 1} *</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Описание темы..."
                                                className="min-h-[80px]"
                                                {...descField}
                                                disabled={disabled}
                                            />
                                        </FormControl>
                                        <FormMessage>{featureErrors?.description?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                );
            })}

            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ title: '', description: '' })}
                disabled={disabled}
                className="mt-4"
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                Добавить тему
            </Button>
            {errors.features && errors.features.root && (
                <p className="text-sm font-medium text-destructive mt-2">{errors.features.root.message}</p>
            )}
        </div>
    );
};

export default FeatureEditor;
