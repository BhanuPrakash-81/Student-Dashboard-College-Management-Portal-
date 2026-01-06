import React from 'react';

export const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ size = 'md' }) => {
    const sizes = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-xl',
        lg: 'w-16 h-16 text-3xl',
        xl: 'w-24 h-24 text-5xl'
    };

    return (
        <div className={`bg-gradient-to-tr from-red-600 to-red-900 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/20 ${sizes[size]} font-bold text-white`}>
            KL
        </div>
    );
};

export default Logo;
