import React, { useState } from 'react';
import { GraduationCap, Search, Bell, Sparkles, User, Shield, Check, BookOpen, Layers } from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface NavbarProps {
  currentUser: UserProfile;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAiTutor: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentRole,
  onRoleChange,
  searchQuery,
  onSearchChange,
  onOpenAiTutor,
  activeTab,
  onTabChange
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'Assignment 2 Extended', time: '10m ago', text: 'Dr. Vance extended CS-201 deadline by 24h.' },
    { id: 2, title: 'New Exam Room Added', time: '1h ago', text: 'Math-301 examination room assigned to Hall B.' },
    { id: 3, title: 'Badge Unlocked!', time: '3h ago', text: 'You earned the "Perfect Attendance" badge.' }
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200/80 px-4 md:px-6 py-3 transition-all">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-indigo-900 text-xl tracking-tight">Nexus Academy</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">LMS</span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">Integrated Student & Faculty Portal</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses, instructors, subjects, code..."
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (activeTab !== 'courses') onTabChange('courses');
              }}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200/60 rounded-full w-4 h-4 flex items-center justify-center"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* AI Study Tutor Trigger */}
          <button
            onClick={onOpenAiTutor}
            className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 text-white font-medium text-xs sm:text-sm shadow-sm hover:shadow-md hover:opacity-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
            <span className="hidden sm:inline">AI Study Assistant</span>
            <span className="sm:hidden">AI Assistant</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="font-semibold text-sm text-slate-800">Notifications</span>
                  <span className="text-xs text-indigo-600 font-medium cursor-pointer hover:underline">Mark all read</span>
                </div>
                <div className="space-y-2">
                  {notifications.map(n => (
                    <div key={n.id} className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-xs space-y-1">
                      <div className="flex items-center justify-between font-semibold text-slate-800">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{n.time}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{n.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher Badge */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/60 transition-all text-xs font-semibold text-slate-700"
            >
              <div className={`w-2 h-2 rounded-full ${
                currentRole === 'student' ? 'bg-emerald-500' : currentRole === 'teacher' ? 'bg-indigo-500' : 'bg-amber-500'
              }`}></div>
              <span className="capitalize">{currentRole} View</span>
              <span className="text-slate-400 text-[10px]">▼</span>
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 space-y-1">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Switch View Context</div>
                
                <button
                  onClick={() => { onRoleChange('student'); setShowRoleDropdown(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    currentRole === 'student' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Student Context</span>
                  </div>
                  {currentRole === 'student' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </button>

                <button
                  onClick={() => { onRoleChange('teacher'); setShowRoleDropdown(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    currentRole === 'teacher' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Teacher / Faculty</span>
                  </div>
                  {currentRole === 'teacher' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </button>

                <button
                  onClick={() => { onRoleChange('admin'); setShowRoleDropdown(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    currentRole === 'admin' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-amber-600" />
                    <span>Administrator</span>
                  </div>
                  {currentRole === 'admin' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </button>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div 
            onClick={() => onTabChange('profile')}
            className="flex items-center gap-2 pl-2 border-l border-slate-200 cursor-pointer group"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/20 group-hover:ring-indigo-500 transition-all"
            />
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-none">{currentUser.name}</div>
              <div className="text-[10px] text-slate-500 font-medium truncate max-w-[120px]">{currentUser.title || currentUser.gradeLevel || currentUser.email}</div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
