import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className = '', ...props }) => {
  let baseStyles = 'px-4 py-2 font-semibold rounded-lg transition duration-200 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-4';
  
  switch (variant) {
    case 'primary':
      baseStyles += ' brand-bg text-white brand-bg-hover focus:ring-[var(--color-primary-ring)]';
      break;
    case 'secondary':
      baseStyles += ' bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400/50';
      break;
    case 'danger':
      baseStyles += ' bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/50';
      break;
  }

  return (
    <button className={`${baseStyles} ${className}`} {...props}>
      {children}
    </button>
  );
};
