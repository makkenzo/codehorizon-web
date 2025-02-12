import { cn } from '@/lib/utils';
import * as React from 'react';

function Input({ className, type, endIcon, ...props }: React.ComponentProps<'input'> & { endIcon?: React.ReactNode }) {
    return (
        <React.Fragment>
            <input
                type={type}
                data-slot="input"
                className={cn(
                    'file:text-foreground caret-primary border-b border-muted ring-0 outline-0 placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground aria-invalid:outline-destructive/60 dark:aria-invalid:outline-destructive aria-invalid:border-destructive/60 dark:aria-invalid:border-destructive flex h-9 pt-2 w-full min-w-0 bg-transparent text-base transition-[color] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:focus-visible:ring-[3px] aria-invalid:focus-visible:outline-none md:text-sm',
                    className
                )}
                {...props}
            />
            {endIcon && <span className="absolute right-4 top-1/2 -translate-y-1/2">{endIcon}</span>}
        </React.Fragment>
    );
}

export { Input };

