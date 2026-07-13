import React from 'react';
import Image from 'next/image';
import { Bot, ChevronRight, ChevronLeft } from 'lucide-react';

interface WizardStepProps {
  step: number;
  totalSteps: number;
  title: string;
  body: string;
  imageSrc: string;
  onNext: () => void;
  onBack: () => void;
  onChat: () => void;
  nextLabel?: string;
}

export default function WizardStep({
  step,
  totalSteps,
  title,
  body,
  imageSrc,
  onNext,
  onBack,
  onChat,
  nextLabel = "Siguiente",
}: WizardStepProps) {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col lg:flex-row items-center gap-6 lg:gap-10 pb-4 min-h-0">
      {/* Mobile progress indicators (top) */}
      <div className="w-full lg:hidden flex items-center justify-center gap-2 mt-1 mb-1">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i + 1 === step ? 'w-6 bg-[#2D6FE0]' : i + 1 < step ? 'w-1.5 bg-[#1a3c34]' : 'w-1.5 bg-[#e8e4dc]'
            }`}
          />
        ))}
        <span className="ml-2 text-xs font-medium text-[#6b7280]">{step}/{totalSteps}</span>
      </div>

      {/* Image Side — compact on mobile, full on desktop */}
      <div className="w-full lg:w-1/2 flex justify-center flex-shrink-0">
        <div className="relative w-full max-w-[220px] sm:max-w-[280px] lg:max-w-[400px] aspect-square rounded-[20px] lg:rounded-[24px] bg-[#FBFAF7] border border-[#e8e4dc] shadow-sm overflow-hidden">
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-contain p-4 lg:p-6"
            priority={step === 1}
          />
        </div>
      </div>

      {/* Content Side */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Desktop progress */}
        <div className="hidden lg:flex items-center gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i + 1 === step ? 'w-8 bg-[#2D6FE0]' : i + 1 < step ? 'w-2 bg-[#1a3c34]' : 'w-2 bg-[#e8e4dc]'
              }`}
            />
          ))}
          <span className="ml-2 text-sm font-medium text-[#6b7280]">
            Paso {step} de {totalSteps}
          </span>
        </div>

        <h2 className="font-space-grotesk font-semibold text-2xl sm:text-3xl md:text-4xl text-[#1a3c34] mb-3 leading-tight">
          {title}
        </h2>
        
        <p className="font-inter text-base sm:text-lg text-[#4a5568] leading-relaxed mb-6">
          {body}
        </p>

        {/* WellBot CTA */}
        <button
          onClick={onChat}
          className="flex items-center gap-2 bg-[#e0e7ff] text-[#2D6FE0] px-4 py-2.5 rounded-[12px] hover:bg-[#c7d2fe] transition-colors self-start mb-6 text-sm"
        >
          <Bot className="w-4 h-4 flex-shrink-0" />
          <span className="font-inter font-medium">¿Dudas? Pregúntale a WellBot</span>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
        </button>

        {/* Navigation Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[#e8e4dc]">
          <button
            onClick={onBack}
            className={`flex items-center gap-1.5 font-inter font-semibold text-sm text-[#4a5568] hover:text-[#1a3c34] transition-colors ${
              step === 1 ? 'invisible' : ''
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Atrás
          </button>

          <button
            onClick={onNext}
            className="flex items-center gap-2 bg-[#2D6FE0] text-white px-6 py-3 rounded-[12px] font-inter font-semibold text-sm hover:bg-[#255bc2] transition-colors shadow-sm"
          >
            {nextLabel}
            {step < totalSteps && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
