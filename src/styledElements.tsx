import React from 'react';

interface SelectProps {
    'value': string;
    'onChange': (e: React.ChangeEvent<HTMLSelectElement>) => void;
    'children': React.ReactNode;
    'className'?: string;
    'disabled'?: boolean;
}

export const Select: React.FC<SelectProps> = (props: SelectProps) => {
    const {
        value,
        onChange,
        children,
        className = '',
        disabled = false,
    } = props;

    return (
        <select
            disabled={disabled}
            value={value}
            onChange={onChange}
            className={`text-black  px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        >
            {children}
        </select>
    );
};
