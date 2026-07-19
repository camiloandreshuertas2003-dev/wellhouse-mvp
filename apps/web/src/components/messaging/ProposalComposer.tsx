import React, { useState } from 'react';
import { X, Calendar as CalIcon } from 'lucide-react';

export default function ProposalComposer({
  property,
  onCancel,
  onSubmit,
  defaultValues
}: {
  property: any;
  onCancel: () => void;
  onSubmit: (data: any) => void;
  defaultValues?: any;
}) {
  const [startDate, setStartDate] = useState(defaultValues?.start_date || '');
  const [endDate, setEndDate] = useState(defaultValues?.end_date || '');
  const [wpPerNight, setWpPerNight] = useState(defaultValues?.wp_per_night || property?.wellrank || 150);
  const [exchangeType, setExchangeType] = useState(defaultValues?.exchange_type || 'reciprocal');

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!startDate || !endDate) return;
    onSubmit({
      start_date: startDate,
      end_date: endDate,
      wp_per_night: wpPerNight,
      exchange_type: exchangeType
    });
  };

  return (
    <div className="bg-white border-t border-surface-mist-dark p-4 sm:p-6 w-full shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-fraunces font-bold text-ink-teal-900 flex items-center gap-2">
          <CalIcon className="w-4 h-4" /> Armar propuesta
        </h3>
        <button onClick={onCancel} className="p-1 hover:bg-surface-mist rounded-full transition text-text-muted-custom">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 min-w-[120px]">
          <label className="block text-xs font-semibold text-ink-teal-900 mb-1.5">Llegada</label>
          <input
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-surface-mist-dark rounded-xl text-sm focus:ring-2 focus:ring-ink-teal-900/20 focus:border-ink-teal-900 outline-none"
          />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="block text-xs font-semibold text-ink-teal-900 mb-1.5">Salida</label>
          <input
            type="date"
            required
            min={startDate}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-surface-mist-dark rounded-xl text-sm focus:ring-2 focus:ring-ink-teal-900/20 focus:border-ink-teal-900 outline-none"
          />
        </div>
        <div className="w-24">
          <label className="block text-xs font-semibold text-ink-teal-900 mb-1.5">WP/noche</label>
          <input
            type="number"
            required
            value={wpPerNight}
            onChange={(e) => setWpPerNight(Number(e.target.value))}
            className="w-full px-3 py-2 border border-surface-mist-dark rounded-xl text-sm focus:ring-2 focus:ring-ink-teal-900/20 focus:border-ink-teal-900 outline-none text-wellpoint-gold font-bold"
          />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="block text-xs font-semibold text-ink-teal-900 mb-1.5">Tipo</label>
          <select 
            value={exchangeType}
            onChange={(e) => setExchangeType(e.target.value)}
            className="w-full px-3 py-2 border border-surface-mist-dark rounded-xl text-sm focus:ring-2 focus:ring-ink-teal-900/20 focus:border-ink-teal-900 outline-none bg-white"
          >
            <option value="reciprocal">Recíproco</option>
            <option value="points">Solo Puntos</option>
          </select>
        </div>
        
        <button type="submit" className="px-6 py-2 bg-accent-cobalt text-white font-semibold rounded-xl text-sm hover:opacity-90 transition min-w-[120px]">
          Enviar
        </button>
      </form>
    </div>
  );
}
