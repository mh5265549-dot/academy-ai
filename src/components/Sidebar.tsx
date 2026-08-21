import React from 'react';
import { LayoutDashboard, BookOpen, Calendar, UserCheck, Terminal, HelpCircle, Footprints } from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentRole: UserRole;
  enrolledCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  currentRole,
  enrolledCount
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses', label: 'Course Catalog', icon: BookOpen, badge: enrolledCount > 0 ? `${enrolledCount}` : undefined },
    { id: 'timetable', label: 'Schedule', icon: Calendar },
    { id: 'profile', label: 'Profile', icon: UserCheck },
    { id: 'journey', label: 'Journey Game', icon: Footprints, highlight: true },
    { id: 'docs', label: 'Architecture & API', icon: Terminal }
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 text-slate-700 flex-shrink-0 p-6 flex md:flex-col justify-between md:min-h-[calc(100vh-65px)]">
      <div className="space-y-6 w-full">
        {/* Workspace context banner */}
        <div className="hidden md:block p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Active Workspace</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5 capitalize">{currentRole} Portal</div>
          <p className="text-xs text-slate-500 mt-1 leading-snug">
            {currentRole === 'student' && 'Enrolled in Spring 2026 Term'}
            {currentRole === 'teacher' && 'Faculty Department & Grading Access'}
            {currentRole === 'admin' && 'Academy Operations & System Admin'}
          </p>
        </div>

        {/* Navigation links */}
        <nav className="flex md:flex-col gap-1.5 w-full overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-1 md:flex-none ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                } ${item.highlight ? 'border border-indigo-200' : ''}`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Pro Account / Status Bottom Bento Block */}
      <div className="hidden md:block pt-4 border-t border-slate-100">
        <div className="bg-indigo-900 rounded-2xl p-5 text-white space-y-2 shadow-md">
          <p className="text-xs text-indigo-300 uppercase tracking-widest font-bold">Pro Account</p>
          <p className="text-xs text-indigo-100 leading-relaxed">Unlock advanced learning analytics and tutor mentorship.</p>
          <button 
            onClick={() => onTabChange('profile')}
            className="w-full py-2 mt-2 bg-indigo-500 hover:bg-indigo-400 rounded-lg text-xs font-bold transition-colors text-white shadow-sm"
          >
            SYSTEM STATUS: ONLINE
          </button>
        </div>
      </div>
    </aside>
  );
};
