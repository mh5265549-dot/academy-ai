import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Video, AlertCircle, Plus, CheckCircle2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { TimetableSlot, UserRole } from '../types';

interface TimetableScheduleViewProps {
  timetable: TimetableSlot[];
  currentRole: UserRole;
  onAddTimetableSlot: (slot: Partial<TimetableSlot>) => void;
}

export const TimetableScheduleView: React.FC<TimetableScheduleViewProps> = ({
  timetable,
  currentRole,
  onAddTimetableSlot
}) => {
  const [selectedDay, setSelectedDay] = useState<'All Week' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('All Week');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form
  const [courseCode, setCourseCode] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('Monday');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('10:15 AM');
  const [room, setRoom] = useState('Lab 302');

  const days: Array<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'> = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const filteredSlots = selectedDay === 'All Week'
    ? timetable
    : timetable.filter(t => t.dayOfWeek === selectedDay);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode || !courseTitle) return;
    onAddTimetableSlot({
      courseCode,
      courseTitle,
      dayOfWeek,
      startTime,
      endTime,
      room
    });
    setShowAddModal(false);
    setCourseCode('');
    setCourseTitle('');
  };

  return (
    <div className="space-y-6 pb-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Interactive Weekly Timetable</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time schedule for lectures, laboratory sessions, and live recitation blocks.</p>
        </div>

        <div className="flex items-center gap-3">
          {(currentRole === 'teacher' || currentRole === 'admin') && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Class Event</span>
            </button>
          )}
        </div>
      </div>

      {/* Day Selector Pills */}
      <div className="p-3 rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-wrap gap-1.5">
        <button
          onClick={() => setSelectedDay('All Week')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            selectedDay === 'All Week' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Week Grid
        </button>
        {days.map(d => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              selectedDay === d ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Grid Layout View */}
      {selectedDay === 'All Week' ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {days.map(day => {
            const daySlots = timetable.filter(t => t.dayOfWeek === day);
            return (
              <div key={day} className="rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-3 bg-indigo-900 text-white text-center font-bold text-xs uppercase tracking-wider">
                  {day}
                </div>
                <div className="p-3 space-y-3 flex-1">
                  {daySlots.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs italic">No scheduled sessions</div>
                  ) : (
                    daySlots.map(slot => (
                      <div
                        key={slot.id}
                        className={`p-3 rounded-xl border text-xs space-y-2 transition-all ${
                          slot.status === 'live'
                            ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/30'
                            : slot.status === 'completed'
                            ? 'bg-slate-50 border-slate-200 opacity-80'
                            : 'bg-white border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[10px]">
                            {slot.courseCode}
                          </span>
                          <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                            slot.status === 'live' ? 'bg-amber-500 text-slate-950 animate-pulse' : 'text-slate-400 bg-slate-100'
                          }`}>
                            {slot.status}
                          </span>
                        </div>

                        <div className="font-bold text-slate-900 leading-tight">{slot.courseTitle}</div>

                        <div className="space-y-1 text-[11px] text-slate-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{slot.startTime} - {slot.endTime}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{slot.room}</span>
                          </div>
                        </div>

                        {slot.meetingUrl && (
                          <a
                            href={slot.meetingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 w-full py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center gap-1"
                          >
                            <Video className="w-3 h-3" />
                            <span>Join Video Call</span>
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Single Day Detailed View */
        <div className="space-y-3">
          {filteredSlots.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-400 text-sm">
              No class sessions scheduled for {selectedDay}.
            </div>
          ) : (
            filteredSlots.map(slot => (
              <div
                key={slot.id}
                className={`p-5 rounded-2xl bg-white border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  slot.status === 'live' ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200/80'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 flex flex-col items-center justify-center font-bold text-xs flex-shrink-0">
                    <Clock className="w-4 h-4 mb-0.5" />
                    <span>{slot.startTime}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {slot.courseCode}
                      </span>
                      <span className="text-xs font-medium text-slate-500">{slot.category}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        slot.status === 'live' ? 'bg-amber-500 text-slate-950 animate-pulse' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {slot.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{slot.courseTitle}</h3>
                    <p className="text-xs text-slate-500">Instructor: {slot.instructorName} • Location: <strong>{slot.room}</strong></p>

                    {slot.assignmentDue && (
                      <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold pt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Due: {slot.assignmentDue}</span>
                      </div>
                    )}
                  </div>
                </div>

                {slot.meetingUrl && (
                  <a
                    href={slot.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join Class Session</span>
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Timetable Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">Schedule Class Session</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Course Code</label>
                <input
                  type="text"
                  required
                  placeholder="CS-201"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Session Title</label>
                <input
                  type="text"
                  required
                  placeholder="Recitation & Lab Practice"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Day of Week</label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Room / Venue</label>
                  <input
                    type="text"
                    placeholder="Lab 302"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    placeholder="09:00 AM"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Time</label>
                  <input
                    type="text"
                    placeholder="10:15 AM"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-600 font-semibold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow">Save Event</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
