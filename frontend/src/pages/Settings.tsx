import React, { useState } from 'react';
import { 
  useGetNiveles, useCreateNivel, useUpdateNivel, useDeleteNivel,
  useGetProfesores, useCreateProfesor, useUpdateProfesor, useDeleteProfesor,
  useGetSalones, useCreateSalon, useUpdateSalon, useDeleteSalon
} from '../hooks/useSettings';
import { 
  BookOpen, 
  User, 
  MapPin,
  Trash2,
  Edit2,
  Plus,
  Search
} from 'lucide-react';
import type { Nivel, Profesor, Salon } from '../types';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'NIVELES' | 'PROFESORES' | 'SALONES'>('NIVELES');
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Editing state
  const [editingNivel, setEditingNivel] = useState<Nivel | null>(null);
  const [editingProfesor, setEditingProfesor] = useState<Profesor | null>(null);
  const [editingSalon, setEditingSalon] = useState<Salon | null>(null);
  
  const { data: niveles, isLoading: loadingNiv } = useGetNiveles();
  const createNivel = useCreateNivel();
  const updateNivel = useUpdateNivel();
  const deleteNivel = useDeleteNivel();

  const { data: profesores, isLoading: loadingProf } = useGetProfesores();
  const createProfesor = useCreateProfesor();
  const updateProfesor = useUpdateProfesor();
  const deleteProfesor = useDeleteProfesor();

  const { data: salones, isLoading: loadingSal } = useGetSalones();
  const createSalon = useCreateSalon();
  const updateSalon = useUpdateSalon();
  const deleteSalon = useDeleteSalon();

  const tabs = [
    { id: 'NIVELES', label: 'Niveles', icon: BookOpen },
    { id: 'PROFESORES', label: 'Profesores', icon: User },
    { id: 'SALONES', label: 'Salones', icon: MapPin },
  ] as const;

  const filteredNiveles = niveles?.filter(n => n.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredProfesores = profesores?.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || p.email.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredSalones = salones?.filter(s => s.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

  const openModal = (item?: any) => {
    if (activeTab === 'NIVELES') setEditingNivel(item || null);
    if (activeTab === 'PROFESORES') setEditingProfesor(item || null);
    if (activeTab === 'SALONES') setEditingSalon(item || null);
    setShowModal(true);
  };

  const closeModal = () => {
    setEditingNivel(null);
    setEditingProfesor(null);
    setEditingSalon(null);
    setShowModal(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (activeTab === 'NIVELES') {
      const data = {
        nombre: formData.get('nombre') as string,
        descripcion: formData.get('descripcion') as string,
        duracion_semanas: parseInt(formData.get('duracion_semanas') as string),
        precio: formData.get('precio') as string,
      };
      if (editingNivel) {
        updateNivel.mutate({ id: editingNivel.nivel_id, data }, { onSuccess: closeModal });
      } else {
        createNivel.mutate(data, { onSuccess: closeModal });
      }
    } else if (activeTab === 'PROFESORES') {
      const data = {
        nombre: formData.get('nombre') as string,
        email: formData.get('email') as string,
        telefono: formData.get('telefono') as string,
        especialidad: formData.get('especialidad') as string,
      };
      if (editingProfesor) {
        updateProfesor.mutate({ id: editingProfesor.profesor_id, data }, { onSuccess: closeModal });
      } else {
        createProfesor.mutate(data, { onSuccess: closeModal });
      }
    } else if (activeTab === 'SALONES') {
      const data = {
        nombre: formData.get('nombre') as string,
        capacidad: parseInt(formData.get('capacidad') as string),
        equipado: formData.get('equipado') === 'on',
      };
      if (editingSalon) {
        updateSalon.mutate({ id: editingSalon.salon_id, data }, { onSuccess: closeModal });
      } else {
        createSalon.mutate(data, { onSuccess: closeModal });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-slate">Configuración del Sistema</h1>
          <p className="text-slate-500 text-sm">Administra los catálogos maestros de la academia.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-primary text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> 
          Agregar {activeTab === 'NIVELES' ? 'Nivel' : activeTab === 'PROFESORES' ? 'Profesor' : 'Salón'}
        </button>
      </div>

      <div className="flex border-b border-brand-border gap-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSearchTerm('');
            }}
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
        <div className="p-4 border-b border-brand-border bg-brand-secondary/50 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder={`Buscar en ${activeTab.toLowerCase()}...`}
            className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {activeTab === 'NIVELES' && (
          <div className="divide-y divide-brand-border">
            {loadingNiv ? <div className="p-8 animate-pulse bg-slate-50" /> : filteredNiveles?.map(n => (
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
                <div className="flex gap-2">
                  <button onClick={() => openModal(n)} className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => confirm('¿Eliminar nivel?') && deleteNivel.mutate(n.nivel_id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'PROFESORES' && (
          <div className="divide-y divide-brand-border">
            {loadingProf ? <div className="p-8 animate-pulse bg-slate-50" /> : filteredProfesores?.map(p => (
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
                <div className="flex gap-2">
                  <button onClick={() => openModal(p)} className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => confirm('¿Eliminar profesor?') && deleteProfesor.mutate(p.profesor_id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'SALONES' && (
          <div className="divide-y divide-brand-border">
            {loadingSal ? <div className="p-8 animate-pulse bg-slate-50" /> : filteredSalones?.map(s => (
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
                <div className="flex gap-2">
                  <button onClick={() => openModal(s)} className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => confirm('¿Eliminar salón?') && deleteSalon.mutate(s.salon_id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-brand-slate/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-brand-border w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-brand-border flex justify-between items-center">
              <h3 className="text-xl font-bold text-brand-slate">
                {(editingNivel || editingProfesor || editingSalon) ? 'Editar' : 'Nuevo'} {activeTab === 'NIVELES' ? 'Nivel' : activeTab === 'PROFESORES' ? 'Profesor' : 'Salón'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-brand-slate">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {activeTab === 'NIVELES' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre (ej. B2)</label>
                    <input defaultValue={editingNivel?.nombre} required name="nombre" type="text" className="w-full px-4 py-2 rounded-xl border border-brand-border focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Duración (Semanas)</label>
                    <input defaultValue={editingNivel?.duracion_semanas} required name="duracion_semanas" type="number" min="1" className="w-full px-4 py-2 rounded-xl border border-brand-border focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Precio (USD)</label>
                    <input defaultValue={editingNivel?.precio} required name="precio" type="number" step="0.01" min="0" className="w-full px-4 py-2 rounded-xl border border-brand-border focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descripción</label>
                    <textarea defaultValue={editingNivel?.descripcion} name="descripcion" rows={2} className="w-full px-4 py-2 rounded-xl border border-brand-border focus:ring-2 focus:ring-primary/20 outline-none transition-all"></textarea>
                  </div>
                </>
              )}

              {activeTab === 'PROFESORES' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre Completo</label>
                    <input defaultValue={editingProfesor?.nombre} required name="nombre" type="text" className="w-full px-4 py-2 rounded-xl border border-brand-border focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                    <input defaultValue={editingProfesor?.email} required name="email" type="email" className="w-full px-4 py-2 rounded-xl border border-brand-border focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Especialidad (MCER)</label>
                    <select defaultValue={editingProfesor?.especialidad} required name="especialidad" className="w-full px-4 py-2 rounded-xl border border-brand-border focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                      <option value="A1">A1</option>
                      <option value="A2">A2</option>
                      <option value="B1">B1</option>
                      <option value="B2">B2</option>
                      <option value="C1">C1</option>
                      <option value="C2">C2</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teléfono</label>
                    <input defaultValue={editingProfesor?.telefono} name="telefono" type="tel" className="w-full px-4 py-2 rounded-xl border border-brand-border focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                  </div>
                </>
              )}

              {activeTab === 'SALONES' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre del Salón</label>
                    <input defaultValue={editingSalon?.nombre} required name="nombre" type="text" className="w-full px-4 py-2 rounded-xl border border-brand-border focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Capacidad</label>
                    <input defaultValue={editingSalon?.capacidad} required name="capacidad" type="number" min="1" className="w-full px-4 py-2 rounded-xl border border-brand-border focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <input defaultChecked={editingSalon ? editingSalon.equipado : true} name="equipado" type="checkbox" id="equipado" className="w-4 h-4 text-primary rounded border-brand-border focus:ring-primary" />
                    <label htmlFor="equipado" className="text-sm font-medium text-brand-slate">Equipado con A/V</label>
                  </div>
                </>
              )}

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 rounded-xl border border-brand-border font-semibold text-slate-500 hover:bg-brand-secondary transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 bg-primary text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm">{editingNivel || editingProfesor || editingSalon ? 'Actualizar' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

