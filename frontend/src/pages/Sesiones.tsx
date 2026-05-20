import React, { useState } from 'react';
import { 
  useGetSesiones, useInscribirEstudiante, useUpdateAsistencia, 
  useCreateSesion, useUpdateSesion, useDeleteSesion, useDeleteInscripcion 
} from '../hooks/useSesiones';
import { useGetEstudiantes } from '../hooks/useEstudiantes';
import { useGetNiveles, useGetProfesores, useGetSalones } from '../hooks/useSettings';
import { 
  Calendar, 
  MapPin, 
  User, 
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Edit2
} from 'lucide-react';
import type { Sesion } from '../types';

export const Sesiones: React.FC = () => {
  const { data: sesiones, isLoading } = useGetSesiones();
  const { data: estudiantes } = useGetEstudiantes();
  
  // Data for the creation modal
  const { data: niveles } = useGetNiveles();
  const { data: profesores } = useGetProfesores();
  const { data: salones } = useGetSalones();

  const inscribir = useInscribirEstudiante();
  const updateAsistencia = useUpdateAsistencia();
  const createSesion = useCreateSesion();
  const updateSesion = useUpdateSesion();
  const deleteSesion = useDeleteSesion();
  const deleteInscripcion = useDeleteInscripcion();

  const [selectedSesion, setSelectedSesion] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSesion, setEditingSesion] = useState<Sesion | null>(null);

  const handleEnroll = (sesionId: number, estudianteId: number) => {
    inscribir.mutate({ sesion_id: sesionId, estudiante_id: estudianteId });
  };

  const handleAsistencia = (inscripcionId: number, estado: string) => {
    updateAsistencia.mutate({ id: inscripcionId, estado });
  };

  const handleRemoveInscripcion = (inscripcionId: number) => {
    if (confirm('¿Eliminar esta inscripción? Si hay multa pendiente, se descontará del saldo.')) {
      deleteInscripcion.mutate(inscripcionId);
    }
  };

  const [selectedEstudiante, setSelectedEstudiante] = useState<string>('');

  const openModal = (sesion: Sesion | null = null) => {
    setEditingSesion(sesion);
    setShowModal(true);
  };

  const closeModal = () => {
    setEditingSesion(null);
    setShowModal(false);
  };

  const handleSaveSesion = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      nivel_id: parseInt(formData.get('nivel_id') as string),
      profesor_id: parseInt(formData.get('profesor_id') as string),
      salon_id: parseInt(formData.get('salon_id') as string),
      fecha: new Date(formData.get('fecha') as string).toISOString(),
      hora_inicio: `1970-01-01T${formData.get('hora_inicio')}:00Z`,
      duracion_min: parseInt(formData.get('duracion_min') as string),
      cupos_disponibles: parseInt(formData.get('cupos_disponibles') as string),
    };

    if (editingSesion) {
      updateSesion.mutate({ id: editingSesion.sesion_id, data }, { onSuccess: closeModal });
    } else {
      createSesion.mutate(data, { onSuccess: closeModal });
    }
  };

  const handleDeleteSesion = (id: number) => {
    if (confirm('¿Eliminar esta sesión? Se cancelarán todas las inscripciones asociadas.')) {
      deleteSesion.mutate(id, {
        onSuccess: () => {
          if (selectedSesion === id) setSelectedSesion(null);
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-slate">Calendario de Sesiones</h1>
          <p className="text-slate-500 text-sm">Gestiona las clases, profesores y asistencia.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-primary text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Nueva Sesión
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            [1, 2, 3].map(i => <div key={i} className="h-40 bg-white rounded-2xl border border-brand-border animate-pulse" />)
          ) : sesiones?.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-brand-border">
              <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">No hay sesiones programadas.</p>
            </div>
          ) : (
            sesiones?.map(sesion => (
              <div 
                key={sesion.sesion_id} 
                className={`bg-white p-6 rounded-2xl border transition-all cursor-pointer relative group ${selectedSesion === sesion.sesion_id ? 'border-primary shadow-md ring-1 ring-primary/20' : 'border-brand-border hover:shadow-sm'}`}
                onClick={() => setSelectedSesion(sesion.sesion_id)}
              >
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); openModal(sesion); }} className="p-1.5 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-100 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteSesion(sesion.sesion_id); }} className="p-1.5 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex justify-between items-start mb-4 pr-16">
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
                      <Clock className="w-4 h-4" /> {new Date(sesion.hora_inicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} ({sesion.duracion_min} min)
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
                    <div key={ins.inscripcion_id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-brand-secondary/50 border border-brand-border/50 group">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-brand-slate truncate">{ins.estudiante?.nombre}</p>
                        <p className={`text-[10px] font-bold uppercase ${
                          ins.estado_asistencia === 'ASISTIO' ? 'text-emerald-500' :
                          ins.estado_asistencia === 'FALTO' ? 'text-rose-500' : 'text-slate-400'
                        }`}>
                          {ins.estado_asistencia}
                        </p>
                      </div>
                      <div className="flex gap-1 items-center">
                        <button
                          type="button"
                          onClick={() => handleAsistencia(ins.inscripcion_id, 'ASISTIO')}
                          className={`p-1.5 rounded-lg transition-colors ${ins.estado_asistencia === 'ASISTIO' ? 'bg-emerald-500 text-white' : 'hover:bg-emerald-100 text-emerald-500'}`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAsistencia(ins.inscripcion_id, 'FALTO')}
                          className={`p-1.5 rounded-lg transition-colors ${ins.estado_asistencia === 'FALTO' ? 'bg-rose-500 text-white' : 'hover:bg-rose-100 text-rose-500'}`}
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveInscripcion(ins.inscripcion_id)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                          title="Eliminar Inscripción"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
                    value={selectedEstudiante}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val && selectedSesion) {
                        handleEnroll(selectedSesion, parseInt(val));
                        setSelectedEstudiante('');
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

      {showModal && (
        <div className="fixed inset-0 bg-brand-slate/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-brand-border w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-brand-border flex justify-between items-center">
              <h3 className="text-xl font-bold text-brand-slate">{editingSesion ? 'Editar Sesión' : 'Programar Sesión'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-brand-slate">&times;</button>
            </div>
            <form onSubmit={handleSaveSesion} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nivel</label>
                <select defaultValue={editingSesion?.nivel_id} required name="nivel_id" className="w-full px-4 py-2 rounded-xl border border-brand-border focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                  <option value="">Seleccionar nivel...</option>
                  {niveles?.map(n => <option key={n.nivel_id} value={n.nivel_id}>{n.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Profesor</label>
                <select defaultValue={editingSesion?.profesor_id} required name="profesor_id" className="w-full px-4 py-2 rounded-xl border border-brand-border focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                  <option value="">Seleccionar profesor...</option>
                  {profesores?.map(p => <option key={p.profesor_id} value={p.profesor_id}>{p.nombre} ({p.especialidad})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Salón</label>
                <select defaultValue={editingSesion?.salon_id} required name="salon_id" className="w-full px-4 py-2 rounded-xl border border-brand-border focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                  <option value="">Seleccionar salón...</option>
                  {salones?.map(s => <option key={s.salon_id} value={s.salon_id}>{s.nombre} (Cap: {s.capacidad})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha</label>
                  <input defaultValue={editingSesion ? new Date(editingSesion.fecha).toISOString().split('T')[0] : ''} required name="fecha" type="date" className="w-full px-4 py-2 rounded-xl border border-brand-border focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hora Inicio</label>
                  <input defaultValue={editingSesion ? new Date(editingSesion.hora_inicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}) : ''} required name="hora_inicio" type="time" className="w-full px-4 py-2 rounded-xl border border-brand-border focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Duración (Min)</label>
                  <input defaultValue={editingSesion?.duracion_min || 60} required name="duracion_min" type="number" min="30" step="15" className="w-full px-4 py-2 rounded-xl border border-brand-border focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cupos Libres</label>
                  <input defaultValue={editingSesion?.cupos_disponibles || 10} required name="cupos_disponibles" type="number" min="0" className="w-full px-4 py-2 rounded-xl border border-brand-border focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 rounded-xl border border-brand-border font-semibold text-slate-500 hover:bg-brand-secondary transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 bg-primary text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm">{editingSesion ? 'Actualizar' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

