import React from 'react';
import { useGetEstudiantes } from '../hooks/useEstudiantes';
import { useGetSesiones } from '../hooks/useSesiones';
import { useGetMultasPendientes } from '../hooks/useMultas';
import { 
  Users, 
  Calendar, 
  CreditCard, 
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color, to }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-brand-slate">{value}</h3>
      </div>
      <div className={`${color} p-3 rounded-xl`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    <Link to={to} className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary hover:gap-2 transition-all uppercase tracking-wider">
      Ver detalles <ArrowRight className="w-3 h-3" />
    </Link>
  </div>
);

export const Dashboard: React.FC = () => {
  const { data: estudiantes, isLoading: loadingEst } = useGetEstudiantes();
  const { data: sesiones, isLoading: loadingSes } = useGetSesiones();
  const { data: multas, isLoading: loadingMult } = useGetMultasPendientes();

  const stats = [
    { 
      title: 'Total Estudiantes', 
      value: estudiantes?.length || 0, 
      icon: Users, 
      color: 'bg-blue-500',
      to: '/estudiantes'
    },
    { 
      title: 'Sesiones Activas', 
      value: sesiones?.length || 0, 
      icon: Calendar, 
      color: 'bg-indigo-500',
      to: '/sesiones'
    },
    { 
      title: 'Multas Pendientes', 
      value: multas?.length || 0, 
      icon: CreditCard, 
      color: 'bg-rose-500',
      to: '/multas'
    },
    { 
      title: 'Ingresos Proyectados', 
      value: `$${multas?.reduce((acc, m) => acc + parseFloat(m.monto), 0).toFixed(2) || '0.00'}`, 
      icon: TrendingUp, 
      color: 'bg-emerald-500',
      to: '/multas'
    },
  ];

  if (loadingEst || loadingSes || loadingMult) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-8 w-48 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-brand-slate">Bienvenido, Admin</h1>
        <p className="text-slate-500 mt-1">Aquí tienes un resumen de la academia hoy.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (stat && <StatCard key={idx} {...stat} />))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm">
          <h3 className="font-bold text-lg text-brand-slate mb-4">Sesiones Próximas</h3>
          <div className="space-y-4">
            {sesiones?.slice(0, 5).map((sesion) => (
              <div key={sesion.sesion_id} className="flex items-center justify-between p-3 rounded-xl hover:bg-brand-secondary transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    {sesion.nivel?.nombre.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-brand-slate">{sesion.nivel?.nombre}</p>
                    <p className="text-xs text-slate-500">{new Date(sesion.fecha).toLocaleDateString()} · {sesion.hora_inicio}</p>
                  </div>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                  {sesion.cupos_disponibles} cupos
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm">
          <h3 className="font-bold text-lg text-brand-slate mb-4">Estudiantes Recientes</h3>
          <div className="space-y-4">
            {estudiantes?.slice(0, 5).map((est) => (
              <div key={est.estudiante_id} className="flex items-center justify-between p-3 rounded-xl hover:bg-brand-secondary transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                    {est.nombre.split(' ').filter(Boolean).map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-brand-slate">{est.nombre}</p>
                    <p className="text-xs text-slate-500">{est.email}</p>
                  </div>
                </div>
                <Link to="/estudiantes" className="p-2 hover:bg-white rounded-lg transition-colors">
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
