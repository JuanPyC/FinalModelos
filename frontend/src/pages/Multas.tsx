import React, { useState } from 'react';
import { useGetMultas, usePayMulta } from '../hooks/useMultas';
import { 
  CreditCard, 
  CheckCircle, 
  Clock, 
  Filter,
  DollarSign
} from 'lucide-react';

export const Multas: React.FC = () => {
  const { data: multas, isLoading } = useGetMultas();
  const payMulta = usePayMulta();
  const [filter, setFilter] = useState<'TODAS' | 'PENDIENTE' | 'PAGADA'>('TODAS');

  const filteredMultas = multas?.filter(m => 
    filter === 'TODAS' || m.estado_pago === filter
  );

  const handlePay = (id: number) => {
    payMulta.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-slate">Seguimiento de Multas</h1>
          <p className="text-slate-500 text-sm">Control de pagos por inasistencias o cancelaciones tardías.</p>
        </div>
        
        <div className="flex bg-white rounded-xl border border-brand-border p-1 shadow-sm">
          {(['TODAS', 'PENDIENTE', 'PAGADA'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === f ? 'bg-brand-slate text-white' : 'text-slate-500 hover:text-brand-slate'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3].map(i => <div key={i} className="h-48 bg-white rounded-2xl border border-brand-border animate-pulse" />)
        ) : filteredMultas?.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-brand-border">
            <CreditCard className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">No hay multas que coincidan con el filtro.</p>
          </div>
        ) : (
          filteredMultas?.map(multa => (
            <div key={multa.multa_id} className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-xl ${multa.estado_pago === 'PAGADA' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                    multa.estado_pago === 'PAGADA' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {multa.estado_pago}
                  </span>
                </div>
                
                <h4 className="font-bold text-brand-slate mb-1">{multa.estudiante?.nombre}</h4>
                <p className="text-xs text-slate-500 mb-4">Sesión #{multa.inscripcion?.sesion_id} · {new Date(multa.fecha_generacion).toLocaleDateString()}</p>
                
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-brand-slate">${parseFloat(multa.monto).toFixed(2)}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase">USD</span>
                </div>
              </div>

              {multa.estado_pago === 'PENDIENTE' && (
                <button 
                  onClick={() => handlePay(multa.multa_id)}
                  className="w-full py-4 bg-brand-secondary border-t border-brand-border text-xs font-bold text-brand-slate hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Marcar como Pagada
                </button>
              )}
              {multa.estado_pago === 'PAGADA' && (
                <div className="w-full py-4 bg-emerald-50 border-t border-emerald-100 text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Pago Completado
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
