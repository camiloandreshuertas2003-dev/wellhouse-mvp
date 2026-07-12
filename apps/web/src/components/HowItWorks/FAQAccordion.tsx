import React, { useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';

export interface FAQItem {
  id: string;
  q: string;
  a: React.ReactNode;
  stepToJump?: number;
}

interface FAQAccordionProps {
  items: FAQItem[];
  onJumpToStep: (step: number) => void;
}

export default function FAQAccordion({ items, onJumpToStep }: FAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {items.map((item) => (
        <div 
          key={item.id} 
          className="bg-white border border-[#e8e4dc] rounded-[16px] overflow-hidden transition-all hover:border-[#1a3c34]/20"
        >
          <button
            onClick={() => toggle(item.id)}
            className="w-full flex items-center justify-between p-6 text-left"
          >
            <span className="font-space-grotesk font-semibold text-lg text-[#1a3c34] pr-4">
              {item.q}
            </span>
            <ChevronDown 
              className={`w-5 h-5 text-[#6b7280] transition-transform duration-300 flex-shrink-0 ${openId === item.id ? 'rotate-180' : ''}`}
            />
          </button>
          
          <div 
            className={`transition-all duration-300 ease-in-out ${
              openId === item.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="p-6 pt-0 font-inter text-[#4a5568] leading-relaxed border-t border-[#f0ede8] mt-2">
              <div className="pt-4">
                {item.a}
                {item.stepToJump && (
                  <button
                    onClick={() => onJumpToStep(item.stepToJump!)}
                    className="mt-4 flex items-center gap-2 font-inter font-semibold text-[#2D6FE0] hover:text-[#1e4eb0] transition-colors"
                  >
                    Ver esto en el paso {item.stepToJump} <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
