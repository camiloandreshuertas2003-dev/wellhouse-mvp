'use client'

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import HowItWorksWizard from '@/components/HowItWorks/HowItWorksWizard';
import WellBot from '@/components/WellBot';

export default function HowItWorksPage() {
  const [botOpen, setBotOpen] = useState(false);
  const [botContext, setBotContext] = useState('');

  const handleOpenBot = (context: string) => {
    setBotContext(context);
    setBotOpen(true);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FBFAF7]">
        <HowItWorksWizard onOpenBot={handleOpenBot} />
      </main>

      {/* WellBot Floating/Modal */}
      {botOpen && (
        <WellBot
          isOpen={botOpen}
          onClose={() => setBotOpen(false)}
          initialMessage={botContext ? `Hola! Vi que estabas en la página de "Cómo Funciona". ¿En qué te puedo ayudar con el tema: "${botContext}"?` : undefined}
        />
      )}
    </>
  );
}
