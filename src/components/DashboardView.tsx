import React from 'react';
import { BookOpen, Award, Clock, ArrowRight, Play, CheckCircle2, Sparkles, Megaphone, Video, ChevronRight, FileText } from 'lucide-react';
import { Course, TimetableSlot, UserProfile, UserRole, Announcement } from '../types';

interface DashboardViewProps {
  user: UserProfile;
  role: UserRole;
  courses: Course[];
  timetable: TimetableSlot[];
  announcements: Announcement[];
  onNavigateTab: (tab: string) => void;
  onOpenAiTutor: () => void;
  onCourseSelect: (course: Course) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  role,
  courses,
  timetable,
  announcements,
  onNavigateTab,
  onOpenAiTutor,
  onCourseSelect
}) => {
  const enrolledCourses = courses.filter(c => c.isEnrolled);
  const liveSlot = timetable.find(t => t.status === 'live');
  const upcomingSlots = timetable.filter(t => t.status === 'upcoming').slice(0, 3);

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-900">

      {/* Header Section */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Student Dashboard</h1>
          <p className="text-slate-500 text-sm">Welcome back, {user.name}. You have {upcomingSlots.length + (liveSlot ? 1 : 0)} sessions scheduled today.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-700">Spring 2026 Term</span>
          </div>

          <button
            onClick={onOpenAiTutor}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>AI Study Tutor</span>
          </button>
        </div>
      </header>

      {/* Live Session Alert Box if active */}
      {liveSlot && (
        <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold animate-pulse flex-shrink-0">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500 text-slate-950">LIVE NOW</span>
                <span className="text-sm font-bold text-slate-900">{liveSlot.courseCode}: {liveSlot.courseTitle}</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">Instructor: {liveSlot.instructorName} • Venue: {liveSlot.room}</p>
            </div>
          </div>
          {liveSlot.meetingUrl && (
            <a
              href={liveSlot.meetingUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>Join Lecture Room</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* Bento Grid Main Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Course Catalog (Span 2 Cols, 1 Row) */}
        <section className="md:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Course Catalog</h3>
              <p className="text-xs text-slate-500">Active enrolled modules and syllabus completion status</p>
            </div>
            <div className="flex space-x-2">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-semibold">Grade 11</span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold">STEM</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            {enrolledCourses.slice(0, 2).map((course, idx) => {
              const bgBannerClass = idx % 2 === 0 ? 'bg-indigo-100 text-indigo-500' : 'bg-rose-100 text-rose-500';
              const progressColorClass = idx % 2 === 0 ? 'bg-indigo-500' : 'bg-rose-500';

              return (
                <div
                  key={course.id}
                  onClick={() => onCourseSelect(course)}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between hover:bg-slate-100/70 transition-all cursor-pointer group"
                >
                  <div>
                    <div className={`w-full h-24 ${bgBannerClass} rounded-xl mb-3 flex items-center justify-center relative overflow-hidden`}>
                      <img src={course.image} alt={course.title} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/80 backdrop-blur text-white text-[10px] font-bold rounded">
                        {course.code}
                      </div>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors line-clamp-1">{course.title}</h4>
                    <p className="text-xs text-slate-500 mb-4">{course.instructorName}</p>
                  </div>

                  <div className="mt-auto space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-600">{course.progressPercentage || 65}% Complete</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{course.scheduleDays.join(', ')}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full ${progressColorClass} rounded-full`} style={{ width: `${course.progressPercentage || 65}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">{enrolledCourses.length} active courses enrolled</span>
            <button
              onClick={() => onNavigateTab('courses')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Explore All Courses</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* Profile Card (1 Col, 2 Rows) */}
        <section className="md:row-span-2 bg-indigo-600 rounded-3xl p-8 text-white shadow-lg flex flex-col items-center text-center justify-between">
          <div className="flex flex-col items-center">
            <div className="relative mb-6">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-indigo-400/50 p-1 object-cover bg-indigo-800"
              />
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-400 border-2 border-indigo-600 rounded-full"></div>
            </div>

            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-indigo-200 text-xs sm:text-sm mb-6">{user.title || user.gradeLevel || 'Computer Science • STEM'}</p>
          </div>

          <div className="w-full space-y-3.5 my-2">
            <div className="bg-indigo-700/50 p-4 rounded-2xl flex justify-between items-center text-left">
              <div>
                <p className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider">Current GPA</p>
                <p className="text-xl font-bold">{user.gpa || 3.92}</p>
              </div>
              <Award className="w-7 h-7 text-indigo-300/40" />
            </div>

            <div className="bg-indigo-700/50 p-4 rounded-2xl flex justify-between items-center text-left">
              <div>
                <p className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider">Attendance</p>
                <p className="text-xl font-bold">{user.attendanceRate || 98.4}%</p>
              </div>
              <CheckCircle2 className="w-7 h-7 text-indigo-300/40" />
            </div>

            <div className="bg-indigo-700/50 p-4 rounded-2xl flex justify-between items-center text-left">
              <div>
                <p className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider">Credits Earned</p>
                <p className="text-xl font-bold">18 / 24</p>
              </div>
              <Clock className="w-7 h-7 text-indigo-300/40" />
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('profile')}
            className="w-full mt-4 py-3.5 bg-white text-indigo-600 rounded-2xl font-bold shadow-xl hover:bg-indigo-50 transition-colors text-xs sm:text-sm"
          >
            View Full Transcript & Badges
          </button>
        </section>

        {/* Interactive Timetable (2 Cols, 1 Row) */}
        <section className="md:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">Weekly Schedule</h3>
            <button
              onClick={() => onNavigateTab('timetable')}
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              Full Schedule Grid →
            </button>
          </div>

          <div className="space-y-3">
            {timetable.slice(0, 3).map((slot, idx) => {
              const isNow = slot.status === 'live';
              return (
                <div
                  key={slot.id}
                  className={`flex items-center space-x-4 p-3.5 rounded-2xl border transition-all ${
                    isNow
                      ? 'border-indigo-100 bg-indigo-50/40 ring-1 ring-indigo-200'
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className={`text-center w-16 border-r pr-2 ${isNow ? 'border-indigo-100' : 'border-slate-100'}`}>
                    <p className={`text-xs font-bold uppercase ${isNow ? 'text-indigo-600' : 'text-slate-400'}`}>
                      {slot.startTime}
                    </p>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h5 className={`font-bold text-sm truncate ${isNow ? 'text-indigo-900' : 'text-slate-800'}`}>
                      {slot.courseTitle}
                      {isNow && <span className="ml-2 text-[10px] bg-indigo-200 text-indigo-700 px-1.5 py-0.5 rounded uppercase font-extrabold">Now</span>}
                    </h5>
                    <p className={`text-xs ${isNow ? 'text-indigo-600' : 'text-slate-500'}`}>
                      {slot.room} • {slot.instructorName}
                    </p>
                  </div>

                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isNow ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}`}></div>
                </div>
              );
            })}
          </div>

          {/* AI Tutor Assistant Callout Box */}
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-slate-50 to-amber-50/60 border border-indigo-100/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div>
                <h5 className="font-bold text-xs text-slate-800">Need help preparing for tomorrow's lab?</h5>
                <p className="text-[11px] text-slate-500">Ask the AI Assistant to generate practice quizzes or break down complex concepts.</p>
              </div>
            </div>
            <button
              onClick={onOpenAiTutor}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs whitespace-nowrap shadow-sm"
            >
              Ask AI Tutor
            </button>
          </div>
        </section>

      </div>

    </div>
  );
};
