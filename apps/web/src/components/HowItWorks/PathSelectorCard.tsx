import React from 'react';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

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
      className={`relative w-full p-4 sm:p-6 bg-white rounded-[20px] border-2 text-left transition-all duration-300 hover:-translate-y-1 ${
        isSelected
          ? 'border-[#2D6FE0] shadow-md'
          : 'border-[#e8e4dc] hover:border-[#2D6FE0]/50 hover:shadow-sm'
      }`}
    >
      {/* Image — shorter on mobile so the card fits on screen */}
      <div className="aspect-[16/9] sm:aspect-[4/3] relative w-full mb-3 sm:mb-5 rounded-[12px] bg-[#FBFAF7] overflow-hidden border border-[#e8e4dc]">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover"
        />
      </div>

      <h3 className="font-space-grotesk font-semibold text-lg sm:text-2xl text-[#1a3c34] mb-1 sm:mb-2">
        {title}
      </h3>

      <p className="font-inter text-sm sm:text-base text-[#4a5568] mb-3 sm:mb-5 leading-relaxed line-clamp-3">
        {description}
      </p>

      <div className={`flex items-center font-inter font-semibold text-sm ${isSelected ? 'text-[#2D6FE0]' : 'text-[#4a5568]'}`}>
        Elegir <ChevronRight className="w-4 h-4 ml-1" />
      </div>
    </button>
  );
}
