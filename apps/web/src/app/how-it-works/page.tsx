'use client'

import React, { useState } from 'react';
import HowItWorksWizard from '@/components/HowItWorks/HowItWorksWizard';

export default function HowItWorksPage() {
  const handleOpenBot = (context: string) => {
    // Despachamos un evento personalizado para abrir el WellBot global de layout.tsx
    window.dispatchEvent(new CustomEvent('open-wellbot', { detail: { context } }));
  };

  return (
    <main className="min-h-screen bg-[#FBFAF7]">
      <HowItWorksWizard onOpenBot={handleOpenBot} />
    </main>
  );
}
