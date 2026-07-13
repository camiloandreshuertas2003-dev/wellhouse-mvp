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
    <div className="w-full max-w-4xl mx-auto h-[calc(100vh-100px)] lg:h-auto lg:min-h-[70vh] flex flex-col lg:flex-row items-center gap-4 lg:gap-10 pb-4">
      {/* Mobile progress indicators (top) */}
      <div className="w-full lg:hidden flex items-center justify-center gap-2 mt-2 mb-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i + 1 === step ? 'w-8 bg-[#2D6FE0]' : i + 1 < step ? 'w-2 bg-[#1a3c34]' : 'w-2 bg-[#e8e4dc]'
            }`}
          />
        ))}
      </div>

      {/* Image Side */}
      <div className="w-full lg:w-1/2 flex justify-center flex-1 min-h-0 overflow-hidden">
        <div className="relative w-full max-w-[280px] lg:max-w-[400px] h-full lg:aspect-square rounded-[24px] bg-[#FBFAF7] border border-[#e8e4dc] shadow-sm animate-float">
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

        <h2 className="font-space-grotesk font-semibold text-3xl md:text-4xl text-[#1a3c34] mb-4">
          {title}
        </h2>
        
        <p className="font-inter text-lg text-[#4a5568] leading-relaxed mb-8">
          {body}
        </p>

        {/* WellBot CTA */}
        <button
          onClick={onChat}
          className="flex items-center gap-3 bg-[#e0e7ff] text-[#2D6FE0] px-4 py-3 rounded-[12px] hover:bg-[#c7d2fe] transition-colors self-start mb-10"
        >
          <Bot className="w-5 h-5" />
          <span className="font-inter font-medium text-sm">¿Tienes dudas? Pregúntale a WellBot</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Navigation Actions */}
        <div className="mt-auto flex items-center justify-between pt-6 border-t border-[#e8e4dc]">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 font-inter font-semibold text-[#4a5568] hover:text-[#1a3c34] transition-colors ${
              step === 1 ? 'invisible' : ''
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Atrás
          </button>

          <button
            onClick={onNext}
            className="flex items-center gap-2 bg-[#2D6FE0] text-white px-8 py-3.5 rounded-[12px] font-inter font-semibold hover:bg-[#255bc2] transition-colors shadow-sm"
          >
            {nextLabel}
            {step < totalSteps && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
