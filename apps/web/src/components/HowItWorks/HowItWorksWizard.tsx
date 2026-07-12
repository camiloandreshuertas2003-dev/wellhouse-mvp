'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import WizardStep from './WizardStep';
import PathSelectorCard from './PathSelectorCard';
import FAQAccordion, { FAQItem } from './FAQAccordion';

type PathType = 'host' | 'guest' | null;

const FAQS: FAQItem[] = [
  {
    id: 'q1',
    q: '¿Qué es un WellPoint exactamente?',
    a: 'Es la moneda interna de la plataforma. No es dinero ni una tarifa fija; es una medida de hospitalidad y reciprocidad. Hospedas para ganar WellPoints y los usas para hospedarte en otras casas.',
    stepToJump: 3,
  },
  {
    id: 'q2',
    q: '¿Tengo que tener una casa para usar esto?',
    a: '¡No! Si no tienes una vivienda para intercambiar, puedes elegir el camino de invitado y comprar paquetes de WellPoints para viajar, o aplicar a una membresía especial.',
    stepToJump: 2,
  },
  {
    id: 'q3',
    q: '¿Por qué esta casa cuesta más WP que otra?',
    a: 'El valor en WellPoints está ligado al WellRank™ de la vivienda, el cual se calcula en base a la capacidad, habitaciones, amenidades y si tiene fotos o no.',
    stepToJump: 4,
  },
  {
    id: 'q4',
    q: '¿Es seguro? ¿Cómo sé que el anfitrión es real?',
    a: 'Todos los perfiles pasan por una verificación estricta de identidad con su documento oficial. La plataforma se basa en la confianza mutua, y las reseñas de huéspedes reales fortalecen la seguridad.',
    stepToJump: 5,
  },
  {
    id: 'q5',
    q: '¿Qué pasa si no tengo suficientes WP para la casa que quiero?',
    a: 'Siempre puedes publicar nuevas fechas en tu calendario para hospedar a más personas y ganar más WP, o comprar WP adicionales directamente desde tu panel.',
    stepToJump: 3,
  }
];

interface HowItWorksWizardProps {
  onOpenBot: (context: string) => void;
}

export default function HowItWorksWizard({ onOpenBot }: HowItWorksWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedPath, setSelectedPath] = useState<PathType>(null);
  const totalSteps = 6;

  // Track the flow
  const handleNext = () => {
    if (step === 2 && !selectedPath) return; // Must select a path
    if (step < totalSteps) {
      setStep(s => s + 1);
    } else {
      // CTA at step 6
      if (selectedPath === 'host') {
        router.push('/properties/create');
      } else {
        router.push('/dashboard'); // Or packages page
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
  };

  const handleChat = () => {
    let context = 'Pregunta general sobre cómo funciona.';
    if (step === 1) context = 'Duda sobre qué es Wellhouse y cómo se diferencia de otras plataformas.';
    if (step === 2) context = 'Duda sobre qué camino elegir (tengo vivienda vs quiero viajar sin publicar).';
    if (step === 3) context = 'Duda sobre cómo ganar o comprar WellPoints.';
    if (step === 4) context = 'Duda sobre el WellRank y cómo se decide el costo de cada vivienda.';
    if (step === 5) context = 'Duda sobre verificación, seguridad y confianza en la plataforma.';
    if (step === 6) context = 'Duda sobre cuáles son los siguientes pasos para empezar.';
    
    onOpenBot(context);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <WizardStep
            step={1}
            totalSteps={totalSteps}
            title="¿Qué es Wellhouse?"
            body="No somos una plataforma de alquiler tradicional. Somos una comunidad de intercambio de viviendas basada en la hospitalidad, la confianza y la reciprocidad. Aquí no pagas con dinero, pagas con WellPoints."
            imageSrc="/images/como-funciona/step_1_concept_1783887939348.jpg"
            onNext={handleNext}
            onBack={handleBack}
            onChat={handleChat}
          />
        );
      case 2:
        return (
          <div className="w-full max-w-4xl mx-auto min-h-[70vh] flex flex-col">
            <div className="w-full lg:hidden flex items-center justify-center gap-2 mb-4">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div key={i} className={`h-2 rounded-full ${i + 1 === step ? 'w-8 bg-[#2D6FE0]' : i + 1 < step ? 'w-2 bg-[#1a3c34]' : 'w-2 bg-[#e8e4dc]'}`} />
              ))}
            </div>
            
            <div className="hidden lg:flex items-center justify-center gap-2 mb-10 mt-8">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div key={i} className={`h-2 rounded-full ${i + 1 === step ? 'w-8 bg-[#2D6FE0]' : i + 1 < step ? 'w-2 bg-[#1a3c34]' : 'w-2 bg-[#e8e4dc]'}`} />
              ))}
              <span className="ml-2 text-sm font-medium text-[#6b7280]">Paso 2 de {totalSteps}</span>
            </div>

            <div className="text-center mb-10">
              <h2 className="font-space-grotesk font-semibold text-3xl md:text-4xl text-[#1a3c34] mb-4">Elige tu camino</h2>
              <p className="font-inter text-lg text-[#4a5568]">Existen dos formas principales de vivir la experiencia Wellhouse.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto w-full flex-1">
              <PathSelectorCard
                title="Tengo una vivienda"
                description="Quiero publicar mi espacio, hospedar a otros miembros de la comunidad y acumular WellPoints para viajar sin pagar alojamiento."
                imageSrc="/images/como-funciona/step_2a_host_1783887948050.jpg"
                isSelected={selectedPath === 'host'}
                onSelect={() => setSelectedPath('host')}
              />
              <PathSelectorCard
                title="Quiero viajar sin publicar"
                description="No tengo un espacio para compartir por ahora. Prefiero comprar un paquete de WellPoints o adquirir una membresía para empezar a viajar."
                imageSrc="/images/como-funciona/step_2b_guest_1783887953987.jpg"
                isSelected={selectedPath === 'guest'}
                onSelect={() => setSelectedPath('guest')}
              />
            </div>

            <div className="mt-12 flex items-center justify-between pt-6 border-t border-[#e8e4dc]">
              <button onClick={handleBack} className="flex items-center gap-2 font-inter font-semibold text-[#4a5568] hover:text-[#1a3c34] transition-colors">
                Atrás
              </button>
              <button 
                onClick={handleNext} 
                disabled={!selectedPath}
                className={`flex items-center gap-2 px-8 py-3.5 rounded-[12px] font-inter font-semibold transition-colors shadow-sm ${selectedPath ? 'bg-[#2D6FE0] text-white hover:bg-[#255bc2]' : 'bg-[#e8e4dc] text-[#a0aec0] cursor-not-allowed'}`}
              >
                Siguiente
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <WizardStep
            step={3}
            totalSteps={totalSteps}
            title="Así funcionan los WellPoints"
            body={selectedPath === 'host' 
              ? "Cada vez que recibes a un huésped en tu vivienda, ganas WellPoints que se suman a tu balance. Cuanto mejor sea tu WellRank y más noches hospedes, más puntos ganarás para tus futuros viajes."
              : "Puedes comprar paquetes de WellPoints directamente desde tu panel. Usa esos puntos para reservar estadías en cualquiera de las viviendas de nuestra red global. Simple y directo."
            }
            imageSrc="/images/como-funciona/step_3_wp_1783887994157.jpg"
            onNext={handleNext}
            onBack={handleBack}
            onChat={handleChat}
          />
        );
      case 4:
        return (
          <WizardStep
            step={4}
            totalSteps={totalSteps}
            title="Así se decide el costo"
            body={selectedPath === 'host'
              ? "El WellRank™ evalúa automáticamente la calidad de TU vivienda (capacidad, habitaciones, amenidades y fotos). Este puntaje define cuántos WellPoints ganas por noche cuando alguien se queda en tu casa."
              : "El WellRank™ de una vivienda determina cuántos WellPoints necesitas para quedarte en ella. Casas más grandes o con mejores amenidades tendrán un costo mayor en puntos."
            }
            imageSrc="/images/como-funciona/step_4_score_1783887969182.jpg"
            onNext={handleNext}
            onBack={handleBack}
            onChat={handleChat}
          />
        );
      case 5:
        return (
          <WizardStep
            step={5}
            totalSteps={totalSteps}
            title="Verificación y confianza"
            body="En Wellhouse no eres un extraño. Verificamos la identidad de cada miembro y la titularidad de cada propiedad. Las insignias de confianza y las reseñas tras cada intercambio garantizan la seguridad de todos."
            imageSrc="/images/como-funciona/step_5_trust_1783887974743.jpg"
            onNext={handleNext}
            onBack={handleBack}
            onChat={handleChat}
          />
        );
      case 6:
        return (
          <div className="flex flex-col items-center">
            <WizardStep
              step={6}
              totalSteps={totalSteps}
              title="Ya estás list@"
              body="Tienes todo el conocimiento necesario para empezar a formar parte de nuestra comunidad de hospitalidad global."
              imageSrc="/images/como-funciona/step_6_ready_1783887981285.jpg"
              onNext={handleNext}
              onBack={handleBack}
              onChat={handleChat}
              nextLabel={selectedPath === 'host' ? "Registrar mi vivienda" : "Ver paquetes de WellPoints"}
            />
            
            {/* FAQ Section at the bottom of the last step */}
            <div className="w-full max-w-4xl mx-auto mt-20 pt-20 border-t border-[#e8e4dc]">
              <div className="text-center mb-12">
                <h3 className="font-space-grotesk font-semibold text-3xl text-[#1a3c34] mb-4">Preguntas Frecuentes</h3>
                <p className="font-inter text-[#4a5568]">Resolvemos las dudas más comunes sobre la comunidad.</p>
              </div>
              <FAQAccordion items={FAQS} onJumpToStep={(s) => setStep(s)} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFAF7] py-12 px-4 md:py-20 md:px-8">
      {renderStep()}
    </div>
  );
}
