import React, { useState } from 'react';
import { Search, Filter, BookOpen, Star, Users, Clock, Plus, CheckCircle2, X, ChevronRight, Play, Shield, Award } from 'lucide-react';
import { Course, UserRole } from '../types';

interface CourseCatalogViewProps {
  courses: Course[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCourse: Course | null;
  onCourseSelect: (course: Course | null) => void;
  onEnrollToggle: (courseId: string) => void;
  currentRole: UserRole;
  onCreateCourse: (courseData: Partial<Course>) => void;
}

export const CourseCatalogView: React.FC<CourseCatalogViewProps> = ({
  courses,
  searchQuery,
  onSearchChange,
  selectedCourse,
  onCourseSelect,
  onEnrollToggle,
  currentRole,
  onCreateCourse
}) => {
  const [selectedGrade, setSelectedGrade] = useState<string>('All Grades');
  const [selectedSubject, setSelectedSubject] = useState<string>('All Subjects');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All Difficulties');
  const [enrolledOnly, setEnrolledOnly] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // New course form state
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Computer Science');
  const [newGrade, setNewGrade] = useState<'Grade 9' | 'Grade 10' | 'Grade 11' | 'Grade 12' | 'AP Level' | 'Undergraduate'>('Grade 11');
  const [newDifficulty, setNewDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Honors / AP'>('Intermediate');
  const [newCapacity, setNewCapacity] = useState(30);

  const gradeOptions = ['All Grades', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'AP Level', 'Undergraduate'];
  const subjectOptions = ['All Subjects', 'Computer Science', 'Mathematics', 'Science', 'Humanities', 'Art & Design'];
  const difficultyOptions = ['All Difficulties', 'Beginner', 'Intermediate', 'Advanced', 'Honors / AP'];

  const filteredCourses = courses.filter(c => {
    if (selectedGrade !== 'All Grades' && c.gradeLevel !== selectedGrade) return false;
    if (selectedSubject !== 'All Subjects' && c.subject !== selectedSubject && c.category !== selectedSubject) return false;
    if (selectedDifficulty !== 'All Difficulties' && c.difficulty !== selectedDifficulty) return false;
    if (enrolledOnly && !c.isEnrolled) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = c.title.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.instructorName.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newTitle) return;
    onCreateCourse({
      code: newCode,
      title: newTitle,
      category: newCategory,
      subject: newCategory,
      gradeLevel: newGrade,
      difficulty: newDifficulty,
      capacity: Number(newCapacity)
    });
    setShowCreateModal(false);
    setNewCode('');
    setNewTitle('');
  };

  return (
    <div className="space-y-6 pb-12">

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Academic Course Catalog</h1>
          <p className="text-sm text-slate-500 mt-1">Explore accredited high school, AP level, and undergraduate STEM & Humanities curricula.</p>
        </div>

        {(currentRole === 'teacher' || currentRole === 'admin') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Course</span>
          </button>
        )}
      </div>

      {/* Filters Toolbar */}
      <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
        
        {/* Top Search & Filter Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search course title, code (e.g. CS-201), instructor..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 focus:bg-white text-slate-800 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            
            {/* Grade Filter */}
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
            </select>

            {/* Subject Filter */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {subjectOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {difficultyOptions.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            {/* Enrolled Toggle Button */}
            <button
              onClick={() => setEnrolledOnly(!enrolledOnly)}
              className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all ${
                enrolledOnly ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {enrolledOnly ? '✓ Enrolled Courses' : 'My Courses'}
            </button>

          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>Showing <strong className="text-slate-800">{filteredCourses.length}</strong> available courses</span>
          {(selectedGrade !== 'All Grades' || selectedSubject !== 'All Subjects' || selectedDifficulty !== 'All Difficulties' || enrolledOnly) && (
            <button
              onClick={() => {
                setSelectedGrade('All Grades');
                setSelectedSubject('All Subjects');
                setSelectedDifficulty('All Difficulties');
                setEnrolledOnly(false);
                onSearchChange('');
              }}
              className="text-indigo-600 hover:underline font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map(course => (
          <div
            key={course.id}
            className="group rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col justify-between"
          >
            <div>
              {/* Image & Badges Overlay */}
              <div className="relative h-44 overflow-hidden bg-slate-100">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20"></div>

                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-slate-900/90 backdrop-blur text-white font-extrabold text-[11px] uppercase tracking-wider">
                    {course.code}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-indigo-600/90 backdrop-blur text-white font-bold text-[11px]">
                    {course.gradeLevel}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  {course.isEnrolled ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 shadow">
                      <CheckCircle2 className="w-3 h-3" /> Enrolled
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-slate-900/80 text-slate-200 font-semibold text-[10px] backdrop-blur">
                      {course.difficulty}
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between text-xs font-semibold">
                  <span>{course.scheduleDays.join(', ')}</span>
                  <span>{course.credits} Credits</span>
                </div>
              </div>

              {/* Course Info Body */}
              <div className="p-5 space-y-3">
                <h3 
                  onClick={() => onCourseSelect(course)}
                  className="font-extrabold text-slate-900 text-base group-hover:text-indigo-600 transition-colors line-clamp-1 cursor-pointer"
                >
                  {course.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                  {course.description}
                </p>

                {/* Instructor */}
                <div className="flex items-center gap-2.5 pt-1">
                  <img
                    src={course.instructorAvatar}
                    alt={course.instructorName}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                  />
                  <div className="text-xs">
                    <div className="font-bold text-slate-800">{course.instructorName}</div>
                    <div className="text-[10px] text-slate-500">{course.instructorTitle}</div>
                  </div>
                </div>

                {/* Rating & Stats */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{course.rating}</span>
                    <span className="text-slate-400 font-normal">({course.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{course.enrolledCount}/{course.capacity} students</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => onCourseSelect(course)}
                className="text-xs font-bold text-slate-700 hover:text-indigo-600 flex items-center gap-1"
              >
                <span>View Syllabus</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onEnrollToggle(course.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                  course.isEnrolled
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {course.isEnrolled ? 'Drop Course' : 'Enroll Now'}
              </button>
            </div>

          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Courses Match Your Query</h3>
          <p className="text-xs text-slate-500">Try adjusting your filters or search terms.</p>
        </div>
      )}

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in-95">
            
            {/* Modal Header Image */}
            <div className="relative h-56 bg-slate-900">
              <img src={selectedCourse.image} alt={selectedCourse.title} className="w-full h-full object-cover opacity-60" />
              <button
                onClick={() => onCourseSelect(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-md bg-indigo-600 font-extrabold text-xs uppercase">{selectedCourse.code}</span>
                  <span className="px-3 py-1 rounded-md bg-slate-900/80 font-semibold text-xs">{selectedCourse.gradeLevel}</span>
                </div>
                <h2 className="text-2xl font-extrabold">{selectedCourse.title}</h2>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8 space-y-6">
              
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Instructor</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedCourse.instructorName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Schedule</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedCourse.scheduleTime}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Location</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedCourse.room}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Duration</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedCourse.durationWeeks} Weeks</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-base">Course Description & Syllabus</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{selectedCourse.description}</p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium bg-amber-50/60 p-3 rounded-xl border border-amber-200/50 mt-2">
                  📌 <strong>Syllabus Focus:</strong> {selectedCourse.syllabusOverview}
                </p>
              </div>

              {/* Modules breakdown */}
              {selectedCourse.modules.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-slate-900 text-base">Curriculum Breakdown</h3>
                  <div className="space-y-3">
                    {selectedCourse.modules.map((m, idx) => (
                      <div key={m.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
                        <div className="flex items-center justify-between font-bold text-xs text-slate-800">
                          <span>{m.title}</span>
                          <span className="text-slate-400 font-normal">{m.duration}</span>
                        </div>
                        <div className="space-y-1.5 pt-1">
                          {m.lessons.map(l => (
                            <div key={l.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white border border-slate-100">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${l.completed ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                <span className="font-medium text-slate-700">{l.title}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-semibold uppercase">{l.type} • {l.duration}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button onClick={() => onCourseSelect(null)} className="text-xs font-bold text-slate-500 hover:text-slate-800">
                  Close Window
                </button>
                <button
                  onClick={() => onEnrollToggle(selectedCourse.id)}
                  className={`px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md ${
                    selectedCourse.isEnrolled
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {selectedCourse.isEnrolled ? 'Drop Course' : 'Confirm Enrollment'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Teacher Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">Create New Academy Course</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Course Code (e.g. CS-302)</label>
                <input
                  type="text"
                  required
                  placeholder="CS-302"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="Introduction to Quantum Computing"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="Humanities">Humanities</option>
                    <option value="Art & Design">Art & Design</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Grade Level</label>
                  <select value={newGrade} onChange={(e) => setNewGrade(e.target.value as any)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                    <option value="AP Level">AP Level</option>
                    <option value="Undergraduate">Undergraduate</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-slate-600 font-semibold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow">Publish Course</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
