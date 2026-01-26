'use client';

import React, { useState, useEffect } from 'react';

interface OptimizedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    onValueChange: (value: string) => void;
    containerClassName?: string;
    labelClassName?: string;
}

export const OptimizedTextarea = ({
    label,
    value,
    onValueChange,
    className,
    containerClassName,
    labelClassName,
    ...props
}: OptimizedTextareaProps) => {
    const [localValue, setLocalValue] = useState(value as string || '');

    useEffect(() => {
        setLocalValue(value as string || '');
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setLocalValue(e.target.value);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        if (localValue !== value) {
            onValueChange(localValue);
        }
        if (props.onBlur) {
            props.onBlur(e);
        }
    };

    return (
        <div className={containerClassName}>
            {label && <label className={labelClassName}>{label}</label>}
            <textarea
                {...props}
                value={localValue}
                onChange={handleChange}
                onBlur={handleBlur}
                className={className}
            />
        </div>
    );
};
