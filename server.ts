import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { initialProfiles, initialCourses, initialTimetable, initialAnnouncements, schemaDocs, apiRoutesDocs, studentRoster } from './src/data/mockData';
import { Course, TimetableSlot, UserProfile, StudentRecord, TestDispatchRecord, ParsedTestCommand } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory persistent database store during runtime
  let currentProfiles: Record<string, UserProfile> = JSON.parse(JSON.stringify(initialProfiles));
  let currentCourses: Course[] = JSON.parse(JSON.stringify(initialCourses));
  let currentTimetable: TimetableSlot[] = JSON.parse(JSON.stringify(initialTimetable));
  let currentActiveRole: 'student' | 'teacher' | 'admin' = 'student';
  const roster: StudentRecord[] = JSON.parse(JSON.stringify(studentRoster));
  let dispatchLog: TestDispatchRecord[] = [];

  function requireStaffRole(res: express.Response): boolean {
    if (currentActiveRole !== 'teacher' && currentActiveRole !== 'admin') {
      res.status(403).json({ success: false, error: 'Only authenticated teachers or admins may access the test result dispatcher.' });
      return false;
    }
    return true;
  }

  // Lazy Gemini client helper
  let aiClient: GoogleGenAI | null = null;
  function getAiClient(): GoogleGenAI | null {
    if (!aiClient && process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return aiClient;
  }

  // API ROUTE HANDLERS

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Auth / Current User
  app.get('/api/auth/me', (req, res) => {
    const role = (req.query.role as string) || currentActiveRole;
    if (role === 'student' || role === 'teacher' || role === 'admin') {
      currentActiveRole = role;
    }
    const user = currentProfiles[currentActiveRole] || currentProfiles.student;
    res.json({ success: true, user, role: currentActiveRole });
  });

  app.post('/api/auth/login', (req, res) => {
    const { role = 'student' } = req.body;
    if (role === 'student' || role === 'teacher' || role === 'admin') {
      currentActiveRole = role;
      const user = currentProfiles[role];
      return res.json({
        success: true,
        message: `Authenticated as ${user.name} (${role})`,
        user,
        token: `mock_jwt_${role}_token`
      });
    }
    res.status(400).json({ success: false, error: 'Invalid user role specified' });
  });

  // Courses List & Filtering
  app.get('/api/courses', (req, res) => {
    const { subject, gradeLevel, difficulty, search, enrolledOnly } = req.query;

    let filtered = [...currentCourses];

    if (subject && subject !== 'All Subjects') {
      filtered = filtered.filter(c => c.subject.toLowerCase() === (subject as string).toLowerCase() || c.category.toLowerCase() === (subject as string).toLowerCase());
    }

    if (gradeLevel && gradeLevel !== 'All Grades') {
      filtered = filtered.filter(c => c.gradeLevel.toLowerCase() === (gradeLevel as string).toLowerCase());
    }

    if (difficulty && difficulty !== 'All Difficulties') {
      filtered = filtered.filter(c => c.difficulty.toLowerCase() === (difficulty as string).toLowerCase());
    }

    if (search) {
      const q = (search as string).toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(q) || 
        c.code.toLowerCase().includes(q) || 
        c.description.toLowerCase().includes(q) ||
        c.instructorName.toLowerCase().includes(q)
      );
    }

    if (enrolledOnly === 'true') {
      filtered = filtered.filter(c => c.isEnrolled);
    }

    res.json({
      success: true,
      count: filtered.length,
      courses: filtered
    });
  });

  // Get single course by ID
  app.get('/api/courses/:id', (req, res) => {
    const course = currentCourses.find(c => c.id === req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }
    res.json({ success: true, course });
  });

  // Enroll / Unenroll Toggle
  app.post('/api/courses/:id/enroll', (req, res) => {
    const course = currentCourses.find(c => c.id === req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    course.isEnrolled = !course.isEnrolled;
    if (course.isEnrolled) {
      course.enrolledCount += 1;
      course.progressPercentage = course.progressPercentage || 0;
    } else {
      course.enrolledCount = Math.max(0, course.enrolledCount - 1);
    }

    // Update student profile enrolled count
    const student = currentProfiles.student;
    student.enrolledCount = currentCourses.filter(c => c.isEnrolled).length;

    res.json({
      success: true,
      isEnrolled: course.isEnrolled,
      message: course.isEnrolled ? `Enrolled in ${course.code}: ${course.title}` : `Unenrolled from ${course.code}`,
      course
    });
  });

  // Create Course (Teacher/Admin)
  app.post('/api/courses', (req, res) => {
    const newCourseData = req.body;
    if (!newCourseData.code || !newCourseData.title) {
      return res.status(400).json({ success: false, error: 'Code and Title are required' });
    }

    const newCourse: Course = {
      id: `crs_${Date.now()}`,
      code: newCourseData.code,
      title: newCourseData.title,
      description: newCourseData.description || 'New academy curriculum course',
      category: newCourseData.category || 'Computer Science',
      subject: newCourseData.subject || 'Computer Science',
      gradeLevel: newCourseData.gradeLevel || 'Grade 11',
      difficulty: newCourseData.difficulty || 'Intermediate',
      instructorId: currentProfiles.teacher.id,
      instructorName: currentProfiles.teacher.name,
      instructorAvatar: currentProfiles.teacher.avatar,
      instructorTitle: currentProfiles.teacher.title || 'Faculty Member',
      rating: 5.0,
      reviewCount: 1,
      enrolledCount: 0,
      capacity: newCourseData.capacity || 30,
      image: newCourseData.image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600',
      durationWeeks: newCourseData.durationWeeks || 12,
      credits: newCourseData.credits || 3,
      scheduleDays: newCourseData.scheduleDays || ['Monday', 'Wednesday'],
      scheduleTime: newCourseData.scheduleTime || '10:00 AM - 11:30 AM',
      room: newCourseData.room || 'Academy Hall 101',
      syllabusOverview: newCourseData.syllabusOverview || 'Comprehensive syllabus overview',
      modules: [],
      isEnrolled: false,
      status: 'Active'
    };

    currentCourses.unshift(newCourse);
    res.json({ success: true, message: 'Course created successfully', course: newCourse });
  });

  // Timetable schedule
  app.get('/api/timetable', (req, res) => {
    const { day } = req.query;
    let filtered = [...currentTimetable];

    if (day && day !== 'All Days') {
      filtered = filtered.filter(t => t.dayOfWeek.toLowerCase() === (day as string).toLowerCase());
    }

    res.json({
      success: true,
      count: filtered.length,
      timetable: filtered
    });
  });

  // Add event to timetable
  app.post('/api/timetable', (req, res) => {
    const { courseCode, courseTitle, dayOfWeek, startTime, endTime, room, instructorName, meetingUrl } = req.body;
    if (!courseCode || !dayOfWeek || !startTime) {
      return res.status(400).json({ success: false, error: 'Missing required timetable slot fields' });
    }

    const newSlot: TimetableSlot = {
      id: `ts_${Date.now()}`,
      courseId: `crs_custom`,
      courseCode,
      courseTitle: courseTitle || courseCode,
      instructorName: instructorName || 'Faculty',
      room: room || 'Online Room',
      dayOfWeek,
      startTime,
      endTime: endTime || '11:00 AM',
      status: 'upcoming',
      meetingUrl: meetingUrl || 'https://academy.edu/meet/session',
      category: 'Academic'
    };

    currentTimetable.push(newSlot);
    res.json({ success: true, message: 'Timetable event created', slot: newSlot });
  });

  // User Profile GET/PUT
  app.get('/api/profile', (req, res) => {
    const role = (req.query.role as string) || currentActiveRole;
    const profile = currentProfiles[role] || currentProfiles.student;
    res.json({ success: true, profile });
  });

  app.put('/api/profile', (req, res) => {
    const role = currentActiveRole;
    const { bio, skills, gradeLevel, department, title } = req.body;

    const profile = currentProfiles[role];
    if (bio !== undefined) profile.bio = bio;
    if (skills !== undefined) profile.skills = skills;
    if (gradeLevel !== undefined) profile.gradeLevel = gradeLevel;
    if (department !== undefined) profile.department = department;
    if (title !== undefined) profile.title = title;

    res.json({ success: true, message: 'Profile updated successfully', profile });
  });

  // Analytics summary
  app.get('/api/analytics', (_req, res) => {
    res.json({
      success: true,
      summary: {
        totalStudents: 480,
        totalCourses: currentCourses.length,
        avgAttendance: 95.8,
        activeAssignments: 6,
        recentAnnouncementsCount: initialAnnouncements.length,
        topSubject: 'Computer Science & STEM'
      }
    });
  });

  // Teacher Test Result Dispatcher — roster lookup (staff only)
  app.get('/api/teacher/roster', (_req, res) => {
    if (!requireStaffRole(res)) return;
    res.json({ success: true, roster });
  });

  // Parse a free-text teacher command into a candidate student + score.
  // This ONLY extracts a proposal for the teacher to review — it never
  // sends anything by itself. Dispatch requires a separate, explicit call.
  app.post('/api/teacher/test-results/parse', (req, res) => {
    if (!requireStaffRole(res)) return;

    const { command } = req.body as { command?: string };
    if (!command || !command.trim()) {
      return res.status(400).json({ success: false, error: 'A command or note describing the test result is required.' });
    }

    // Match each digit run in the command against real roster IDs, rather than
    // grabbing "the first number", so an ID like 12345 can't be misread as a
    // fragment of a score (e.g. "123" + "45").
    const numberTokens = Array.from(command.matchAll(/\d+(?:\s*\/\s*\d+)?/g)).map(m => m[0]);
    let student: StudentRecord | null = null;
    let idTokenIndex = -1;
    let attemptedId: string | null = null;
    numberTokens.forEach((tok, i) => {
      if (tok.includes('/')) return;
      const plain = tok.trim();
      const match = roster.find(s => s.id === plain);
      if (match && !student) {
        student = match;
        idTokenIndex = i;
      } else if (!student && !attemptedId && plain.length >= 3) {
        attemptedId = plain;
      }
    });

    // Score: prefer an explicit N/M fraction or N%, then fall back to the one
    // remaining standalone number that isn't the student ID token.
    let score: number | null = null;
    let maxScore = 100;
    const fractionMatch = command.match(/(\d{1,3})\s*\/\s*(\d{1,3})/);
    const percentMatch = command.match(/(\d{1,3})\s*%/);
    if (fractionMatch) {
      score = parseInt(fractionMatch[1], 10);
      const m = parseInt(fractionMatch[2], 10);
      if (m > 0) maxScore = m;
    } else if (percentMatch) {
      score = parseInt(percentMatch[1], 10);
    } else {
      const candidate = numberTokens.find((tok, i) => i !== idTokenIndex && !tok.includes('/') && parseInt(tok, 10) <= 100);
      if (candidate) score = parseInt(candidate, 10);
    }

    const subjectMatch = command.match(/\bin\s+([A-Za-z][A-Za-z\s]{2,30}?)(?:\s+(?:to|for|class)\b|$)/i);

    const result: ParsedTestCommand = {
      raw: command,
      student,
      score,
      maxScore,
      subject: subjectMatch ? subjectMatch[1].trim() : null,
      ambiguous: !student || score === null,
      error: !student
        ? (attemptedId ? `No student on the roster matches ID ${attemptedId}.` : 'Could not find a student ID in that command.')
        : score === null
          ? 'Could not find a test score in that command.'
          : undefined
    };

    res.json({ success: true, parsed: result });
  });

  // Dispatch a CONFIRMED test result to a parent. In this demo environment
  // there is no email provider wired up, so this simulates the send and
  // records it to an in-memory audit log rather than contacting a real inbox.
  app.post('/api/teacher/test-results/dispatch', (req, res) => {
    if (!requireStaffRole(res)) return;

    const { studentId, score, maxScore = 100, subject } = req.body as {
      studentId?: string; score?: number; maxScore?: number; subject?: string;
    };

    if (!studentId || typeof score !== 'number') {
      return res.status(400).json({ success: false, error: 'studentId and a numeric score are required to dispatch.' });
    }

    const student = roster.find(s => s.id === studentId);
    if (!student) {
      return res.status(404).json({ success: false, error: `No student on the roster matches ID ${studentId}.` });
    }

    const record: TestDispatchRecord = {
      id: `dsp_${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      parentEmail: student.parentEmail,
      subject: subject || 'General',
      score,
      maxScore,
      dispatchedAt: new Date().toISOString(),
      dispatchedBy: currentProfiles.teacher.name,
      status: 'sent'
    };

    dispatchLog.unshift(record);
    console.log(`[DEMO SIMULATED DISPATCH] Would email ${student.parentEmail} (parent of ${student.name}): score ${score}/${maxScore} in ${record.subject}. No real email was sent — no email provider is configured in this demo.`);

    res.json({
      success: true,
      message: `Simulated dispatch recorded for ${student.name}'s parent (${student.parentEmail}). This demo does not send real email.`,
      record
    });
  });

  app.get('/api/teacher/test-results/log', (_req, res) => {
    if (!requireStaffRole(res)) return;
    res.json({ success: true, log: dispatchLog });
  });

  // AI Tutor / Study Assistant using Google GenAI SDK or fallback
  app.post('/api/ai/tutor', async (req, res) => {
    const { prompt, courseCode = 'CS-201' } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    const ai = getAiClient();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `You are an expert, encouraging Academy LMS AI Tutor. The student is asking about ${courseCode}.\n\nStudent Question: ${prompt}\n\nProvide a clear, structured, step-by-step educational response in Markdown.`
        });

        return res.json({
          success: true,
          answer: response.text || 'I am ready to help you with your course study question.'
        });
      } catch (err: any) {
        console.error('Gemini API Error:', err);
      }
    }

    // Smart contextual fallback response if API key is not configured
    let fallbackAnswer = `**Academy AI Tutor Explanation for ${courseCode}**:\n\nGreat study question regarding: "${prompt}".\n\n1. **Core Concept Overview**: In ${courseCode}, mastering step-by-step problem decomposition is key to deep retention.\n2. **Key Takeaway**: Always review your lecture slides and practice the active assignment problems in Lab 302.\n3. **Recommended Next Step**: Schedule office hours with Dr. Vance or ask a question in the student forum.`;

    res.json({
      success: true,
      answer: fallbackAnswer
    });
  });

  // Architecture & Database Schema Documentation API endpoints
  app.get('/api/architecture/schemas', (_req, res) => {
    res.json({ success: true, schemas: schemaDocs });
  });

  app.get('/api/architecture/routes', (_req, res) => {
    res.json({ success: true, routes: apiRoutesDocs });
  });

  app.get('/api/architecture/structure', (_req, res) => {
    res.json({
      success: true,
      structure: {
        root: 'Academy-LMS-FullStack',
        frontend: [
          '/src/App.tsx (Main LMS Dashboard Shell)',
          '/src/components/Navbar.tsx (Header, Search, Role Switcher)',
          '/src/components/Sidebar.tsx (Navigation Drawer)',
          '/src/components/DashboardView.tsx (Student & Faculty Overview)',
          '/src/components/CourseCatalogView.tsx (Filterable Grid, Course Modal, Course Creator)',
          '/src/components/TimetableScheduleView.tsx (Interactive Weekly Timetable & Class Links)',
          '/src/components/ProfileOverviewView.tsx (Role-Tailored Profile & Transcript)',
          '/src/components/ArchitectureDocsView.tsx (Live Developer Reference, Schemas & API Test Bench)',
          '/src/components/AiTutorDrawer.tsx (Gemini Powered AI Study Assistant)',
          '/src/types.ts (Shared Data Interfaces)'
        ],
        backend: [
          '/server.ts (Express Server + REST Controllers + Vite Dev Middleware)',
          '/src/data/mockData.ts (Seeded Database State, Courses, Timetable, Mongoose & SQL Schemas)'
        ]
      }
    });
  });

  // VITE MIDDLEWARE SETUP
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Academy LMS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
