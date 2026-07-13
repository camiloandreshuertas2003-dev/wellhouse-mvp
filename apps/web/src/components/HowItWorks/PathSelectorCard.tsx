import React from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';

interface PathSelectorCardProps {
  title: string;
  description: string;
  imageSrc: string;
  isSelected: boolean;
  onSelect: () => void;
}

export default function PathSelectorCard({
  title,
  description,
  imageSrc,
  isSelected,
  onSelect,
}: PathSelectorCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`relative w-full bg-white rounded-2xl border-2 text-left transition-all duration-300 overflow-hidden ${
        isSelected
          ? 'border-[#2D6FE0] shadow-lg shadow-[#2D6FE0]/10'
          : 'border-[#e8e4dc] hover:border-[#2D6FE0]/40 hover:shadow-md'
      }`}
    >
      {/* Selection badge */}
      {isSelected && (
        <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-[#2D6FE0] flex items-center justify-center shadow-sm">
          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        </div>
      )}

      {/* Image — 16:9 compact on all devices */}
      <div className="aspect-[16/9] relative w-full bg-[#FBFAF7] overflow-hidden">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover"
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* Text block */}
      <div className="p-3">
        <h3 className="font-space-grotesk font-bold text-sm sm:text-base text-[#1a3c34] mb-1 leading-tight">
          {title}
        </h3>
        <p className="font-inter text-xs text-[#4a5568] leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>
    </button>
  );
}
