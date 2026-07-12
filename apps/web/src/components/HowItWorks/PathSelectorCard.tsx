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
      className={`relative w-full p-6 bg-white rounded-[24px] border-2 text-left transition-all duration-300 hover:-translate-y-1 ${
        isSelected 
          ? 'border-[#2D6FE0] shadow-md' 
          : 'border-[#e8e4dc] hover:border-[#2D6FE0]/50 hover:shadow-sm'
      }`}
    >
      <div className="aspect-[4/3] relative w-full mb-6 rounded-[16px] bg-[#FBFAF7] overflow-hidden border border-[#e8e4dc]">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover"
        />
      </div>

      <h3 className="font-space-grotesk font-semibold text-2xl text-[#1a3c34] mb-2">
        {title}
      </h3>
      
      <p className="font-inter text-[#4a5568] mb-6 leading-relaxed">
        {description}
      </p>

      <div className={`flex items-center font-inter font-semibold ${isSelected ? 'text-[#2D6FE0]' : 'text-[#4a5568]'}`}>
        Elegir <ChevronRight className="w-5 h-5 ml-1" />
      </div>
    </button>
  );
}
