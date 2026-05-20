import React, { useState } from 'react';
import { useGetEstudiantes, useCreateEstudiante } from '../hooks/useEstudiantes';
import { 
  Search, 
  MoreHorizontal, 
  Mail, 
  Phone,
  UserPlus
} from 'lucide-react';

export const Estudiantes: React.FC = () => {
  const { data: estudiantes, isLoading } = useGetEstudiantes();
  const createEstudiante = useCreateEstudiante();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filteredEstudiantes = estudiantes?.filter(est => 
    est.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    est.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const nuevo = {
      nombre: formData.get('nombre') as string,
      email: formData.get('email') as string,
      telefono: formData.get('telefono') as string,
      fecha_nacimiento: formData.get('fecha_nacimiento') as string,
    };
    createEstudiante.mutate(nuevo, {
      onSuccess: () => setShowModal(false),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-slate">Gestión de Estudiantes</h1>
          <p className="text-slate-500 text-sm">Administra y registra a los alumnos de la academia.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" /> Nuevo Estudiante
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-brand-border bg-brand-secondary/50 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o email..." 
            className="bg-transparent border-none focus:ring-0 text-sm w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-brand-secondary/30 text-slate-500 font-medium border-b border-brand-border">
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4">F. Registro</th>
                <th className="px-6 py-4">Saldo</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {isLoading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4 h-16 bg-slate-50/50" />
                  </tr>
                ))
              ) : filteredEstudiantes?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No se encontraron estudiantes.
                  </td>
                </tr>
              ) : (
                filteredEstudiantes?.map(est => (
                  <tr key={est.estudiante_id} className="hover:bg-brand-secondary/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                          {est.nombre.charAt(0)}
                        </div>
                        <span className="font-semibold text-brand-slate">{est.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Mail className="w-3 h-3" /> {est.email}
                        </div>
                        {est.telefono && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Phone className="w-3 h-3" /> {est.telefono}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(est.fecha_registro).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-mono font-medium ${parseFloat(est.saldo_pendiente) > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        ${parseFloat(est.saldo_pendiente).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-brand-secondary rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-slate-400" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-brand-slate/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-brand-border w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-brand-border flex justify-between items-center">
              <h3 className="text-xl font-bold text-brand-slate">Nuevo Estudiante</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-brand-slate">&times;</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre Completo</label>
                <input required name="nombre" type="text" className="w-full px-4 py-2 rounded-xl border border-brand-border focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                <input required name="email" type="email" className="w-full px-4 py-2 rounded-xl border border-brand-border focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teléfono</label>
                <input name="telefono" type="tel" className="w-full px-4 py-2 rounded-xl border border-brand-border focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha de Nacimiento</label>
                <input required name="fecha_nacimiento" type="date" className="w-full px-4 py-2 rounded-xl border border-brand-border focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 rounded-xl border border-brand-border font-semibold text-slate-500 hover:bg-brand-secondary transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 bg-primary text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
