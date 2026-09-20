import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  BellRing, 
  BarChart3, 
  Settings, 
  LogOut, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { ActivePage } from '../types';

interface SidebarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  unreadAlertCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  unreadAlertCount,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'page3_cw_dashboard' as ActivePage,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'page4_patients' as ActivePage,
      label: 'Patients',
      icon: Users,
    },
    {
      id: 'page5_add_patient' as ActivePage,
      label: 'Add Patient',
      icon: UserPlus,
      highlight: true,
    },
    {
      id: 'page8_alert_centre' as ActivePage,
      label: 'Alert Centre',
      icon: BellRing,
      badge: unreadAlertCount > 0 ? unreadAlertCount : undefined,
    },
    {
      id: 'page12_reports' as ActivePage,
      label: 'Reports',
      icon: BarChart3,
    },
  ];

  const handleNav = (page: ActivePage) => {
    onNavigate(page);
    onCloseMobile();
  };

  const content = (
    <div className="h-full flex flex-col justify-between py-6 px-3">
      <div className="space-y-6">
        
        {/* Sidebar Mini Header */}
        <div className="px-3 pb-3 border-b border-slate-200/70">
          <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Care Worker Portal</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Verified TB DOTS Adherence
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-700/20'
                    : item.highlight
                    ? 'bg-teal-50/80 text-teal-900 hover:bg-teal-100/80 border border-teal-200/60'
                    : 'text-slate-700 hover:bg-white/80 hover:text-teal-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-teal-600' : 'text-slate-500 group-hover:text-teal-600'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white text-rose-600' : 'bg-rose-500 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.highlight && !isActive && (
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-200/60 px-1.5 py-0.5 rounded">
                    NEW
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Nav / Settings & Logout */}
      <div className="pt-4 border-t border-slate-200/70 space-y-1">
        <button
          onClick={() => {
            alert('Settings: DoseSure v2.4 Platform configuration, ESP32 MQTT broker sync & SMS Gateway settings are active.');
          }}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-4 h-4 text-slate-500" />
            <span>Settings</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        <button
          onClick={() => handleNav('page1_landing')}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50/80 transition-colors"
        >
          <LogOut className="w-4 h-4 text-rose-600" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Glass Sidebar */}
      <aside className="hidden md:block w-64 glass-panel rounded-2xl border border-white/70 shadow-lg h-[calc(100vh-5.5rem)] sticky top-20 my-4 ml-4">
        {content}
      </aside>

      {/* Mobile Slide Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 glass-panel h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
