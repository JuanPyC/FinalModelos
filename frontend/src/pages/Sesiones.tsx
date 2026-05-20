import React, { useState } from 'react';
import { useGetSesiones, useInscribirEstudiante, useUpdateAsistencia } from '../hooks/useSesiones';
import { useGetEstudiantes } from '../hooks/useEstudiantes';
import { 
  Calendar, 
  MapPin, 
  User, 
  Users,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export const Sesiones: React.FC = () => {
  const { data: sesiones, isLoading } = useGetSesiones();
  const { data: estudiantes } = useGetEstudiantes();
  const inscribir = useInscribirEstudiante();
  const updateAsistencia = useUpdateAsistencia();

  const [selectedSesion, setSelectedSesion] = useState<number | null>(null);

  const handleEnroll = (sesionId: number, estudianteId: number) => {
    inscribir.mutate({ sesion_id: sesionId, estudiante_id: estudianteId });
  };

  const handleAsistencia = (inscripcionId: number, estado: string) => {
    updateAsistencia.mutate({ id: inscripcionId, estado });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-brand-slate">Calendario de Sesiones</h1>
          <p className="text-slate-500 text-sm">Gestiona las clases, profesores y asistencia.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            [1, 2, 3].map(i => <div key={i} className="h-40 bg-white rounded-2xl border border-brand-border animate-pulse" />)
          ) : (
            sesiones?.map(sesion => (
              <div 
                key={sesion.sesion_id} 
                className={`bg-white p-6 rounded-2xl border transition-all cursor-pointer ${selectedSesion === sesion.sesion_id ? 'border-primary shadow-md ring-1 ring-primary/20' : 'border-brand-border hover:shadow-sm'}`}
                onClick={() => setSelectedSesion(sesion.sesion_id)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-primary mb-1 block">
                      {sesion.nivel?.nombre}
                    </span>
                    <h3 className="text-lg font-bold text-brand-slate">Sesión #{sesion.sesion_id}</h3>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Calendar className="w-4 h-4" /> {new Date(sesion.fecha).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Clock className="w-4 h-4" /> {sesion.hora_inicio} ({sesion.duracion_min} min)
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="p-2 bg-brand-secondary rounded-lg">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Profesor</p>
                      <p className="font-medium">{sesion.profesor?.nombre}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="p-2 bg-brand-secondary rounded-lg">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Salón</p>
                      <p className="font-medium">{sesion.salon?.nombre}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-brand-border">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-600">
                      {sesion.inscripciones?.length || 0} / {sesion.salon?.capacidad} Inscritos
                    </span>
                  </div>
                  <div className="flex -space-x-2">
                    {sesion.inscripciones?.slice(0, 3).map(ins => (
                      <div key={ins.inscripcion_id} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                        {ins.estudiante?.nombre.charAt(0)}
                      </div>
                    ))}
                    {(sesion.inscripciones?.length || 0) > 3 && (
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-brand-secondary flex items-center justify-center text-[10px] font-bold text-slate-500">
                        +{sesion.inscripciones!.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm sticky top-8">
            <h3 className="font-bold text-lg text-brand-slate mb-4">Detalle de Inscritos</h3>
            {!selectedSesion ? (
              <p className="text-sm text-slate-400 text-center py-8 italic">Selecciona una sesión para ver inscritos y tomar asistencia.</p>
            ) : (
              <div className="space-y-6">
                <div className="space-y-3">
                  {sesiones?.find(s => s.sesion_id === selectedSesion)?.inscripciones?.map(ins => (
                    <div key={ins.inscripcion_id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-brand-secondary/50 border border-brand-border/50">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-brand-slate truncate">{ins.estudiante?.nombre}</p>
                        <p className={`text-[10px] font-bold uppercase ${
                          ins.estado_asistencia === 'ASISTIO' ? 'text-emerald-500' :
                          ins.estado_asistencia === 'FALTO' ? 'text-rose-500' : 'text-slate-400'
                        }`}>
                          {ins.estado_asistencia}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleAsistencia(ins.inscripcion_id, 'ASISTIO')}
                          className={`p-1.5 rounded-lg transition-colors ${ins.estado_asistencia === 'ASISTIO' ? 'bg-emerald-500 text-white' : 'hover:bg-emerald-100 text-emerald-500'}`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleAsistencia(ins.inscripcion_id, 'FALTO')}
                          className={`p-1.5 rounded-lg transition-colors ${ins.estado_asistencia === 'FALTO' ? 'bg-rose-500 text-white' : 'hover:bg-rose-100 text-rose-500'}`}
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {sesiones?.find(s => s.sesion_id === selectedSesion)?.inscripciones?.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4">No hay estudiantes inscritos aún.</p>
                  )}
                </div>

                <div className="pt-4 border-t border-brand-border">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-3">Inscribir Estudiante</p>
                  <select 
                    className="w-full px-4 py-2 rounded-xl border border-brand-border text-sm focus:ring-2 focus:ring-primary/20 outline-none mb-3"
                    onChange={(e) => {
                      if (e.target.value) {
                        handleEnroll(selectedSesion, parseInt(e.target.value));
                        e.target.value = "";
                      }
                    }}
                  >
                    <option value="">Seleccionar estudiante...</option>
                    {estudiantes?.filter(est => 
                      !sesiones?.find(s => s.sesion_id === selectedSesion)?.inscripciones?.some(ins => ins.estudiante_id === est.estudiante_id)
                    ).map(est => (
                      <option key={est.estudiante_id} value={est.estudiante_id}>{est.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
