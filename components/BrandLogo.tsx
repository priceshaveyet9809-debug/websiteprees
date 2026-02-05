import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', showText = true }) => {
  const sizes = {
    sm: { text: 'text-lg' },
    md: { text: 'text-2xl' },
    lg: { text: 'text-4xl' },
  };

  return (
    <div className="flex items-center gap-3">
      {showText && (
        <span className={`${sizes[size].text} font-sans font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-pink-600`}>
          PREES
        </span>
      )}
    </div>
  );
};