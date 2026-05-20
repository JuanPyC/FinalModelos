import React, { useState } from 'react';
import { useGetNiveles, useGetProfesores, useGetSalones } from '../hooks/useSettings';
import { 
  BookOpen, 
  User, 
  MapPin,
  ChevronRight
} from 'lucide-react';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'NIVELES' | 'PROFESORES' | 'SALONES'>('NIVELES');
  
  const { data: niveles, isLoading: loadingNiv } = useGetNiveles();
  const { data: profesores, isLoading: loadingProf } = useGetProfesores();
  const { data: salones, isLoading: loadingSal } = useGetSalones();

  const tabs = [
    { id: 'NIVELES', label: 'Niveles', icon: BookOpen },
    { id: 'PROFESORES', label: 'Profesores', icon: User },
    { id: 'SALONES', label: 'Salones', icon: MapPin },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-slate">Configuración del Sistema</h1>
        <p className="text-slate-500 text-sm">Administra los catálogos maestros de la academia.</p>
      </div>

      <div className="flex border-b border-brand-border gap-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 py-4 border-b-2 transition-all text-sm font-bold uppercase tracking-widest ${
              activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-brand-slate'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        {activeTab === 'NIVELES' && (
          <div className="divide-y divide-brand-border">
            {loadingNiv ? <div className="p-8 animate-pulse bg-slate-50" /> : niveles?.map(n => (
              <div key={n.nivel_id} className="p-4 hover:bg-brand-secondary/30 flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    {n.nombre.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-slate">{n.nombre}</h4>
                    <p className="text-xs text-slate-500">{n.duracion_semanas} semanas · ${parseFloat(n.precio).toFixed(2)}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'PROFESORES' && (
          <div className="divide-y divide-brand-border">
            {loadingProf ? <div className="p-8 animate-pulse bg-slate-50" /> : profesores?.map(p => (
              <div key={p.profesor_id} className="p-4 hover:bg-brand-secondary/30 flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    {p.nombre.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-slate">{p.nombre}</h4>
                    <p className="text-xs text-slate-500">{p.especialidad || 'General English'} · {p.email}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'SALONES' && (
          <div className="divide-y divide-brand-border">
            {loadingSal ? <div className="p-8 animate-pulse bg-slate-50" /> : salones?.map(s => (
              <div key={s.salon_id} className="p-4 hover:bg-brand-secondary/30 flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    {s.nombre.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-slate">{s.nombre}</h4>
                    <p className="text-xs text-slate-500">Capacidad: {s.capacidad} · {s.equipado ? 'Equipado' : 'Básico'}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
