import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({
    className,
    type,
    endIcon,
    errMsg,
    ...props
}: React.ComponentProps<'input'> & { endIcon?: React.ReactNode; errMsg?: string }) {
    return (
        <React.Fragment>
            <input
                type={type}
                data-slot="input"
                className={cn(
                    'file:text-foreground caret-primary border-b border-muted ring-0 outline-0 placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground aria-invalid:border-destructive/60 dark:aria-invalid:border-destructive flex h-9 pt-2 w-full min-w-0 bg-transparent text-base transition-[color] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                    className
                )}
                {...props}
            />
            {endIcon && <span className="absolute right-4 top-1/2 -translate-y-1/2">{endIcon}</span>}
            {errMsg && <span className="absolute -bottom-6 left-0 text-destructive text-sm">{errMsg}</span>}
        </React.Fragment>
    );
}

export { Input };
