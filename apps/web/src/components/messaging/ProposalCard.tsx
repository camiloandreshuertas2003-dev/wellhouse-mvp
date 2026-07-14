import React from 'react';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';

export default function ProposalCard({
  proposal,
  isMyProposal,
  onAccept,
  onReject,
  onCounter
}: {
  proposal: any;
  isMyProposal: boolean;
  onAccept: () => void;
  onReject: () => void;
  onCounter: () => void;
}) {
  const isPending = proposal.status === 'pending';
  const isAccepted = proposal.status === 'accepted';
  const isRejected = proposal.status === 'rejected';

  // calculate nights
  const start = new Date(proposal.start_date);
  const end = new Date(proposal.end_date);
  const nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const totalWp = nights * proposal.wp_per_night;

  return (
    <div className="w-full max-w-sm rounded-2xl border border-surface-mist-dark bg-white overflow-hidden shadow-sm my-2">
      <div className="bg-surface-mist px-4 py-3 border-b border-surface-mist-dark flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-ink-teal-900" />
          <span className="font-fraunces font-bold text-sm text-ink-teal-900">Propuesta de intercambio</span>
        </div>
        {isAccepted && <span className="text-xs font-bold text-[#10b981] flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Aceptada</span>}
        {isRejected && <span className="text-xs font-bold text-red-500 flex items-center gap-1"><XCircle className="w-3 h-3"/> Rechazada</span>}
      </div>
      
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-[#6b7280]">Fechas:</span>
          <span className="font-semibold text-ink-teal-900">{start.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} - {end.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} ({nights} n)</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-[#6b7280]">Valor por noche:</span>
          <span className="font-semibold text-wellpoint-gold">{proposal.wp_per_night} WP</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-[#6b7280]">Total:</span>
          <span className="font-bold text-ink-teal-900">{totalWp} WP</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-[#6b7280]">Tipo:</span>
          <span className="font-medium text-ink-teal-900 capitalize">{proposal.exchange_type}</span>
        </div>
      </div>

      {isPending && !isMyProposal && (
        <div className="p-4 bg-surface-mist/50 border-t border-surface-mist-dark flex flex-col gap-2">
          <button 
            onClick={onAccept}
            className="w-full py-2.5 bg-accent-cobalt text-white font-semibold rounded-xl text-sm hover:opacity-90 transition"
          >
            Aceptar propuesta
          </button>
          <div className="flex gap-2">
            <button onClick={onCounter} className="flex-1 py-2 bg-white border border-surface-mist-dark text-ink-teal-900 font-semibold rounded-xl text-sm hover:bg-surface-mist transition">
              Contraoferta
            </button>
            <button onClick={onReject} className="flex-1 py-2 bg-white border border-red-200 text-red-600 font-semibold rounded-xl text-sm hover:bg-red-50 transition">
              Rechazar
            </button>
          </div>
        </div>
      )}

      {isPending && isMyProposal && (
        <div className="p-3 bg-surface-mist/50 border-t border-surface-mist-dark text-center">
          <span className="text-xs font-medium text-[#6b7280]">Esperando respuesta del anfitrión...</span>
        </div>
      )}
    </div>
  );
}
