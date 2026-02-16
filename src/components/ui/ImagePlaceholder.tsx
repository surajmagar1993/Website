import React from 'react';
import { ImageIcon } from 'lucide-react';

interface ImagePlaceholderProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  text?: string;
}

const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({ 
  className = '',
  text = 'Image not available'
}) => {
  return (
    <div 
      className={`relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 w-full h-full ${className}`}
    >
      {/* Abstract Pattern Overlay */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      <div className="relative z-10 flex flex-col items-center gap-2 text-[var(--color-text-muted)] p-4 text-center">
        <ImageIcon size={32} className="opacity-50" />
        <span className="text-sm font-medium opacity-70">{text}</span>
      </div>
    </div>
  );
};

export default ImagePlaceholder;
