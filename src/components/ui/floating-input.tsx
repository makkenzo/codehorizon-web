import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import * as React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const FloatingInput = React.forwardRef<HTMLInputElement, InputProps & { endIcon?: React.ReactNode; errMsg?: string }>(
    ({ className, endIcon, errMsg, ...props }, ref) => {
        return (
            <Input
                placeholder=" "
                className={cn('peer', className)}
                ref={ref}
                endIcon={endIcon}
                errMsg={errMsg}
                {...props}
            />
        );
    }
);
FloatingInput.displayName = 'FloatingInput';

const FloatingLabel = React.forwardRef<
    React.ElementRef<typeof Label>,
    React.ComponentPropsWithoutRef<typeof Label> & { hasPlaceholderAndLabel?: boolean }
>(({ className, hasPlaceholderAndLabel, ...props }, ref) => {
    return (
        <Label
            className={cn(
                'peer-focus:secondary peer-focus:dark:secondary absolute start-0 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-background px-0 text-lg text-border duration-300 dark:bg-background cursor-text',
                hasPlaceholderAndLabel
                    ? 'top-2 -translate-y-4 rtl:left-auto scale-75 px-2 rtl:translate-x-1/4'
                    : 'peer-focus:top-2 peer-focus:-translate-y-4 rtl:peer-focus:left-auto peer-focus:scale-75 rtl:peer-focus:translate-x-1/4 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100',
                className
            )}
            ref={ref}
            {...props}
        />
    );
});
FloatingLabel.displayName = 'FloatingLabel';

type FloatingLabelInputProps = InputProps & { label?: string };

const FloatingLabelInput = React.forwardRef<
    React.ElementRef<typeof FloatingInput>,
    React.PropsWithoutRef<FloatingLabelInputProps> & { endIcon?: React.ReactNode; errMsg?: string }
>(({ id, label, endIcon, errMsg, ...props }, ref) => {
    const hasPlaceholderAndLabel = Boolean(props.placeholder && label);

    return (
        <div className={cn('relative flex', errMsg && '-translate-y-2')}>
            <FloatingInput ref={ref} id={id} endIcon={endIcon} errMsg={errMsg} {...props} />
            <FloatingLabel htmlFor={id} hasPlaceholderAndLabel={hasPlaceholderAndLabel}>
                {label}
            </FloatingLabel>
        </div>
    );
});
FloatingLabelInput.displayName = 'FloatingLabelInput';

export { FloatingInput, FloatingLabel, FloatingLabelInput };

