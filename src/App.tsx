import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { CourseCatalogView } from './components/CourseCatalogView';
import { TimetableScheduleView } from './components/TimetableScheduleView';
import { ProfileOverviewView } from './components/ProfileOverviewView';
import { ArchitectureDocsView } from './components/ArchitectureDocsView';
import { AiTutorDrawer } from './components/AiTutorDrawer';
import { TeacherTestDispatcherDrawer } from './components/TeacherTestDispatcherDrawer';

import { Course, TimetableSlot, UserProfile, UserRole, Announcement, SchemaDoc, ApiRouteDoc } from './types';
import { initialProfiles, initialCourses, initialTimetable, initialAnnouncements, schemaDocs, apiRoutesDocs } from './data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const [currentUser, setCurrentUser] = useState<UserProfile>(initialProfiles.student);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [timetable, setTimetable] = useState<TimetableSlot[]>(initialTimetable);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  
  const [selectedCourseModal, setSelectedCourseModal] = useState<Course | null>(null);
  const [isAiTutorOpen, setIsAiTutorOpen] = useState<boolean>(false);
  const [isTestDispatcherOpen, setIsTestDispatcherOpen] = useState<boolean>(false);

  // Fetch initial data from Express REST backend
  useEffect(() => {
    fetch('/api/auth/me?role=' + currentRole)
      .then(res => res.json())
      .then(data => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(() => setCurrentUser(initialProfiles[currentRole]));

    fetch('/api/courses')
      .then(res => res.json())
      .then(data => {
        if (data.courses) setCourses(data.courses);
      })
      .catch(() => setCourses(initialCourses));

    fetch('/api/timetable')
      .then(res => res.json())
      .then(data => {
        if (data.timetable) setTimetable(data.timetable);
      })
      .catch(() => setTimetable(initialTimetable));
  }, [currentRole]);

  // Handle Role Switch Context
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    setCurrentUser(initialProfiles[role] || initialProfiles.student);
  };

  // Toggle Enroll Status via Express API
  const handleEnrollToggle = async (courseId: string) => {
    // Optimistic UI update
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        const nextState = !c.isEnrolled;
        return {
          ...c,
          isEnrolled: nextState,
          enrolledCount: nextState ? c.enrolledCount + 1 : Math.max(0, c.enrolledCount - 1)
        };
      }
      return c;
    }));

    if (selectedCourseModal && selectedCourseModal.id === courseId) {
      setSelectedCourseModal(prev => prev ? {
        ...prev,
        isEnrolled: !prev.isEnrolled,
        enrolledCount: !prev.isEnrolled ? prev.enrolledCount + 1 : Math.max(0, prev.enrolledCount - 1)
      } : null);
    }

    try {
      await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: currentUser.id })
      });
    } catch (err) {
      console.warn('Backend sync failed, UI remains optimistically updated');
    }
  };

  // Faculty create course
  const handleCreateCourse = async (courseData: Partial<Course>) => {
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData)
      });
      const data = await res.json();
      if (data.course) {
        setCourses(prev => [data.course, ...prev]);
      }
    } catch (err) {
      // Fallback local addition
      const fallbackCourse: Course = {
        id: `crs_${Date.now()}`,
        code: courseData.code || 'CS-300',
        title: courseData.title || 'New Course',
        description: 'Newly created faculty course syllabus',
        category: courseData.category || 'Computer Science',
        subject: courseData.subject || 'Computer Science',
        gradeLevel: (courseData.gradeLevel as any) || 'Grade 11',
        difficulty: (courseData.difficulty as any) || 'Intermediate',
        instructorId: currentUser.id,
        instructorName: currentUser.name,
        instructorAvatar: currentUser.avatar,
        instructorTitle: currentUser.title || 'Faculty',
        rating: 5.0,
        reviewCount: 1,
        enrolledCount: 0,
        capacity: courseData.capacity || 30,
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600',
        durationWeeks: 12,
        credits: 3,
        scheduleDays: ['Monday', 'Wednesday'],
        scheduleTime: '10:00 AM - 11:30 AM',
        room: 'Lab 302',
        syllabusOverview: 'Full semester syllabus details',
        modules: [],
        isEnrolled: false,
        status: 'Active'
      };
      setCourses(prev => [fallbackCourse, ...prev]);
    }
  };

  // Add Timetable Slot
  const handleAddTimetableSlot = async (slotData: Partial<TimetableSlot>) => {
    try {
      const res = await fetch('/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slotData)
      });
      const data = await res.json();
      if (data.slot) {
        setTimetable(prev => [...prev, data.slot]);
      }
    } catch (err) {
      const newSlot: TimetableSlot = {
        id: `ts_${Date.now()}`,
        courseId: 'crs_custom',
        courseCode: slotData.courseCode || 'CS-201',
        courseTitle: slotData.courseTitle || 'Class Session',
        instructorName: currentUser.name,
        room: slotData.room || 'Lab 302',
        dayOfWeek: slotData.dayOfWeek || 'Monday',
        startTime: slotData.startTime || '09:00 AM',
        endTime: slotData.endTime || '10:15 AM',
        status: 'upcoming',
        category: 'Academic'
      };
      setTimetable(prev => [...prev, newSlot]);
    }
  };

  // Profile update
  const handleUpdateBio = async (bio: string, skills: string[]) => {
    setCurrentUser(prev => ({ ...prev, bio, skills }));
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio, skills })
      });
    } catch (err) {
      console.warn('Backend sync failed, client state updated');
    }
  };

  // Post announcement
  const handlePostAnnouncement = (title: string, content: string) => {
    const newAnn: Announcement = {
      id: `ann_${Date.now()}`,
      title,
      content,
      authorName: currentUser.name,
      authorRole: currentUser.title || 'Faculty',
      authorAvatar: currentUser.avatar,
      date: 'Just now',
      category: 'General'
    };
    setAnnouncements(prev => [newAnn, ...prev]);
  };

  const enrolledCount = courses.filter(c => c.isEnrolled).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      
      {/* Top Header Navbar */}
      <Navbar
        currentUser={currentUser}
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAiTutor={() => setIsAiTutorOpen(true)}
        onOpenTestDispatcher={() => setIsTestDispatcherOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          currentRole={currentRole}
          enrolledCount={enrolledCount}
        />

        {/* Content View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              user={currentUser}
              role={currentRole}
              courses={courses}
              timetable={timetable}
              announcements={announcements}
              onNavigateTab={setActiveTab}
              onOpenAiTutor={() => setIsAiTutorOpen(true)}
              onCourseSelect={(c) => setSelectedCourseModal(c)}
            />
          )}

          {activeTab === 'courses' && (
            <CourseCatalogView
              courses={courses}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCourse={selectedCourseModal}
              onCourseSelect={setSelectedCourseModal}
              onEnrollToggle={handleEnrollToggle}
              currentRole={currentRole}
              onCreateCourse={handleCreateCourse}
            />
          )}

          {activeTab === 'timetable' && (
            <TimetableScheduleView
              timetable={timetable}
              currentRole={currentRole}
              onAddTimetableSlot={handleAddTimetableSlot}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileOverviewView
              user={currentUser}
              role={currentRole}
              courses={courses}
              onUpdateBio={handleUpdateBio}
              onPostAnnouncement={handlePostAnnouncement}
            />
          )}

          {activeTab === 'docs' && (
            <ArchitectureDocsView
              schemas={schemaDocs}
              routes={apiRoutesDocs}
            />
          )}
        </main>

      </div>

      {/* Floating AI Study Tutor Drawer */}
      <AiTutorDrawer
        isOpen={isAiTutorOpen}
        onClose={() => setIsAiTutorOpen(false)}
      />

      {/* Teacher Test Result Dispatcher Drawer (staff only) */}
      {(currentRole === 'teacher' || currentRole === 'admin') && (
        <TeacherTestDispatcherDrawer
          isOpen={isTestDispatcherOpen}
          onClose={() => setIsTestDispatcherOpen(false)}
        />
      )}

    </div>
  );
}
