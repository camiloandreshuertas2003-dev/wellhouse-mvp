import React, { useState, useEffect } from 'react';
import { X, Calendar as CalIcon, AlertCircle, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ProposalComposer({
  property,
  isHost,
  onCancel,
  onSubmit,
  defaultValues
}: {
  property: any;
  isHost: boolean;
  onCancel: () => void;
  onSubmit: (data: any) => void;
  defaultValues?: any;
}) {
  const [startDate, setStartDate] = useState(defaultValues?.start_date || '');
  const [endDate, setEndDate] = useState(defaultValues?.end_date || '');
  const [wpPerNight, setWpPerNight] = useState(defaultValues?.wp_per_night || property?.wellrank || 150);
  const [exchangeType, setExchangeType] = useState(defaultValues?.exchange_type || 'reciprocal');
  const [overlappingCount, setOverlappingCount] = useState(0);

  const baseWp = property?.wellrank || 150;
  const maxHostWp = Math.round(baseWp * 1.10); // Host can increase by max 10%
  const isAuctionEnabled = overlappingCount > 0; // Only enable extra bidding if there are other interested users

  // Check for other interested users
  useEffect(() => {
    if (!isHost && property?.id && startDate && endDate) {
      const checkOverlapping = async () => {
        const { count } = await supabase
          .from('conversations')
          .select('id', { count: 'exact', head: true })
          .eq('property_id', property.id)
          .eq('status', 'proposal_sent');
        // We consider it overlapping if there's any other conversation with a sent proposal for this property
        setOverlappingCount(count || 0);
      };
      checkOverlapping();
    }
  }, [property?.id, startDate, endDate, isHost]);

  // Handle WP changes with limits
  const handleWpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = Number(e.target.value);
    if (isHost && val > maxHostWp) val = maxHostWp;
    if (!isHost && !isAuctionEnabled && val > baseWp) val = baseWp; 
    setWpPerNight(val);
  };

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

      {!isHost && isAuctionEnabled && (
        <div className="mb-4 bg-wellpoint-gold/10 border border-wellpoint-gold/20 rounded-xl p-3 flex gap-3 items-start">
          <TrendingUp className="w-5 h-5 text-wellpoint-gold flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-ink-teal-900">¡Hay demanda en estas fechas!</p>
            <p className="text-[11px] text-ink-teal-900/70 mt-0.5 leading-relaxed">
              Actualmente hay otras solicitudes pendientes para esta propiedad. Si quieres asegurar tu lugar, puedes ofrecer una cantidad mayor de WellPoints por noche.
            </p>
          </div>
        </div>
      )}

      {isHost && (
        <div className="mb-4 bg-surface-mist rounded-xl p-3 flex gap-3 items-start">
          <AlertCircle className="w-4 h-4 text-ink-teal-900/60 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-ink-teal-900/80 leading-relaxed">
            Como anfitrión, puedes contraofertar aumentando hasta un máximo de 10% sobre tu WellRank base ({maxHostWp} WP).
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end w-full">
        <div className="flex-1 min-w-0 sm:min-w-[120px]">
          <label className="block text-xs font-semibold text-ink-teal-900 mb-1.5">Llegada</label>
          <input
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-surface-mist-dark rounded-xl text-sm focus:ring-2 focus:ring-ink-teal-900/20 focus:border-ink-teal-900 outline-none"
          />
        </div>
        <div className="flex-1 min-w-0 sm:min-w-[120px]">
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
        <div className="w-full sm:w-28">
          <label className="block text-xs font-semibold text-ink-teal-900 mb-1.5">WP/noche</label>
          <input
            type="number"
            required
            min={baseWp}
            max={isHost ? maxHostWp : (!isAuctionEnabled ? baseWp : undefined)}
            readOnly={!isHost && !isAuctionEnabled}
            value={wpPerNight}
            onChange={handleWpChange}
            className={`w-full px-3 py-2 border border-surface-mist-dark rounded-xl text-sm focus:ring-2 focus:ring-ink-teal-900/20 focus:border-ink-teal-900 outline-none font-bold ${
              !isHost && !isAuctionEnabled ? 'bg-surface-mist text-ink-teal-900 cursor-not-allowed' : 'bg-white text-wellpoint-gold'
            }`}
          />
        </div>
        <div className="flex-1 min-w-0 sm:min-w-[120px]">
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
        
        <button type="submit" className="w-full sm:w-auto px-6 py-2.5 sm:py-2 bg-accent-cobalt text-white font-semibold rounded-xl text-sm hover:opacity-90 transition min-w-[120px]">
          Enviar
        </button>
      </form>
    </div>
  );
}
