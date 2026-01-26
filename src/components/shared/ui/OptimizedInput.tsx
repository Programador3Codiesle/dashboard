'use client';

import React, { useState, useEffect } from 'react';

interface OptimizedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    onValueChange: (value: string) => void;
    containerClassName?: string;
    labelClassName?: string;
}

export const OptimizedInput = ({
    label,
    value,
    onValueChange,
    className,
    containerClassName,
    labelClassName,
    ...props
}: OptimizedInputProps) => {
    const [localValue, setLocalValue] = useState(value as string || '');

    useEffect(() => {
        setLocalValue(value as string || '');
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalValue(e.target.value);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
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
            <input
                {...props}
                value={localValue}
                onChange={handleChange}
                onBlur={handleBlur}
                className={className}
            />
        </div>
    );
};
