export type UserRole = 'student' | 'teacher' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  gradeLevel?: string; // e.g. "Grade 11 - Advanced STEM"
  department?: string; // e.g. "Computer Science & Applied Math"
  title?: string; // e.g. "Senior Lecturer & CS Department Head"
  bio: string;
  gpa?: number;
  enrolledCount?: number;
  teachingCount?: number;
  completedCount?: number;
  attendanceRate?: number;
  skills: string[];
  badges: Badge[];
  studentId?: string;
  employeeId?: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  earnedDate: string;
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'quiz' | 'reading' | 'assignment';
  duration: string;
  completed: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  duration: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string; // e.g. "Computer Science", "Mathematics", "Science", "Humanities"
  subject: string;
  gradeLevel: 'Grade 9' | 'Grade 10' | 'Grade 11' | 'Grade 12' | 'AP Level' | 'Undergraduate';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Honors / AP';
  instructorId: string;
  instructorName: string;
  instructorAvatar: string;
  instructorTitle: string;
  rating: number;
  reviewCount: number;
  enrolledCount: number;
  capacity: number;
  image: string;
  durationWeeks: number;
  credits: number;
  scheduleDays: string[];
  scheduleTime: string;
  room: string;
  syllabusOverview: string;
  modules: CourseModule[];
  progressPercentage?: number;
  isEnrolled: boolean;
  status: 'Active' | 'Upcoming' | 'Archived';
}

export interface TimetableSlot {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  instructorName: string;
  room: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  startTime: string; // "09:00 AM"
  endTime: string;   // "10:30 AM"
  status: 'upcoming' | 'live' | 'completed' | 'canceled';
  meetingUrl?: string;
  assignmentDue?: string;
  category: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  date: string;
  category: 'General' | 'Exam' | 'Event' | 'Urgent';
  targetCourseCode?: string;
}

export interface AnalyticsSummary {
  totalStudents: number;
  totalCourses: number;
  avgAttendance: number;
  activeAssignments: number;
  recentAnnouncementsCount: number;
  topSubject: string;
}

export interface SchemaDoc {
  id: string;
  modelName: string;
  dbEngine: 'MongoDB (Mongoose)' | 'PostgreSQL (SQL / Drizzle)';
  description: string;
  definition: string;
  jsonExample: string;
  indexes: string[];
  relations: string[];
}

export interface ApiRouteDoc {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  description: string;
  category: 'Authentication' | 'Courses' | 'Enrollments' | 'Timetable' | 'Profiles' | 'Analytics';
  requestBody?: string;
  responseExample: string;
}

export interface StudentRecord {
  id: string;
  name: string;
  gradeLevel: string;
  parentName: string;
  parentEmail: string;
}

export interface ParsedTestCommand {
  raw: string;
  student: StudentRecord | null;
  score: number | null;
  maxScore: number;
  subject: string | null;
  ambiguous: boolean;
  error?: string;
}

export interface TestDispatchRecord {
  id: string;
  studentId: string;
  studentName: string;
  parentEmail: string;
  subject: string;
  score: number;
  maxScore: number;
  dispatchedAt: string;
  dispatchedBy: string;
  status: 'sent' | 'failed';
}
