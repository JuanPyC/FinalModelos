import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  CreditCard, 
  Settings,
  Languages
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
  { icon: Users, label: 'Estudiantes', to: '/estudiantes' },
  { icon: Calendar, label: 'Sesiones', to: '/sesiones' },
  { icon: CreditCard, label: 'Multas', to: '/multas' },
  { icon: Settings, label: 'Configuración', to: '/configuracion' },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-brand-border bg-white flex flex-col">
      <div className="p-6 flex items-center gap-3 border-b border-brand-border">
        <div className="bg-primary p-2 rounded-lg">
          <Languages className="text-white w-6 h-6" />
        </div>
        <span className="font-bold text-xl tracking-tight text-brand-slate">Speak Up</span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-slate-500 hover:bg-brand-secondary hover:text-brand-slate"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-brand-border">
        <div className="bg-brand-secondary rounded-lg p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Academy Admin</p>
          <p className="text-sm font-medium text-brand-slate">English Portal v1.0</p>
        </div>
      </div>
    </aside>
  );
};
