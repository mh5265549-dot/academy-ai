import { Course, TimetableSlot, UserProfile, Announcement, SchemaDoc, ApiRouteDoc, AnalyticsSummary } from '../types';

export const initialProfiles: Record<string, UserProfile> = {
  student: {
    id: 'usr_student_101',
    name: 'Alex Rivera',
    email: 'alex.rivera@academy.edu',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    gradeLevel: 'Grade 11 - STEM Honors',
    bio: 'Passionate 11th-grade student majoring in Advanced Computer Science and Physics. Building algorithms & robotics projects in spare time.',
    gpa: 3.88,
    enrolledCount: 5,
    completedCount: 12,
    attendanceRate: 96.5,
    skills: ['Python', 'Calculus', 'Data Structures', 'Lab Physics', 'Technical Writing'],
    studentId: 'STU-2026-8842',
    badges: [
      { id: 'b1', title: 'Honor Roll Q2', description: 'Maintained GPA above 3.8 in STEM courses', iconName: 'Award', earnedDate: 'Jan 2026' },
      { id: 'b2', title: 'Code Master', description: 'Completed 100% of CS-201 coding challenges', iconName: 'Code', earnedDate: 'Feb 2026' },
      { id: 'b3', title: 'Perfect Attendance', description: 'Zero unexcused absences for 3 consecutive months', iconName: 'CheckCircle2', earnedDate: 'Mar 2026' },
      { id: 'b4', title: 'Lab Innovator', description: 'Top honors in Physics II term experiment', iconName: 'Zap', earnedDate: 'Apr 2026' }
    ]
  },
  teacher: {
    id: 'usr_teacher_201',
    name: 'Dr. Evelyn Vance',
    email: 'evelyn.vance@academy.edu',
    role: 'teacher',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    department: 'Computer Science & Mathematics',
    title: 'Senior Lecturer & AI Curriculum Lead',
    bio: 'Ph.D. in Applied Computer Science from MIT. 12+ years leading STEM educational tracks, specializing in Machine Learning and Data Structures.',
    teachingCount: 4,
    skills: ['Algorithms', 'Machine Learning', 'Curriculum Design', 'Python', 'Mentorship'],
    employeeId: 'EMP-CS-1049',
    badges: [
      { id: 'bt1', title: 'Educator of the Year', description: 'Awarded by Academy Student Board 2025', iconName: 'Medal', earnedDate: 'Dec 2025' },
      { id: 'bt2', title: 'Research Grant Holder', description: 'NSF STEM Education Technology Grant', iconName: 'BookOpen', earnedDate: 'Jan 2026' }
    ]
  },
  admin: {
    id: 'usr_admin_301',
    name: 'Marcus Vance',
    email: 'marcus.vance@academy.edu',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    department: 'Academy Academic Affairs',
    title: 'Dean of Academic Operations & LMS Admin',
    bio: 'Overseeing curriculum standards, enrollment systems, and faculty deployment across high school and undergraduate STEM divisions.',
    employeeId: 'ADM-2020-001',
    skills: ['Academic Leadership', 'LMS Operations', 'Policy', 'Data Analytics'],
    badges: [
      { id: 'ba1', title: 'System Architect', description: 'Deployed Next-Gen Academy Platform', iconName: 'ShieldCheck', earnedDate: 'Aug 2025' }
    ]
  }
};

export const initialCourses: Course[] = [
  {
    id: 'crs_cs101',
    code: 'CS-201',
    title: 'Data Structures & Algorithms in Python',
    description: 'Master foundational computational concepts including arrays, linked lists, trees, graph traversal, dynamic programming, and algorithm runtime complexity analysis.',
    category: 'Computer Science',
    subject: 'Computer Science',
    gradeLevel: 'Grade 11',
    difficulty: 'Intermediate',
    instructorId: 'usr_teacher_201',
    instructorName: 'Dr. Evelyn Vance',
    instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    instructorTitle: 'Senior CS Lecturer',
    rating: 4.9,
    reviewCount: 128,
    enrolledCount: 34,
    capacity: 40,
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600',
    durationWeeks: 14,
    credits: 4,
    scheduleDays: ['Monday', 'Wednesday', 'Friday'],
    scheduleTime: '09:00 AM - 10:15 AM',
    room: 'Lab 302 - Science Wing',
    syllabusOverview: 'Covers Big-O analysis, linear data structures, recursive search, sorting algorithms, balanced BSTs, graph algorithms (Dijkstra, BFS/DFS), and algorithm optimization.',
    progressPercentage: 68,
    isEnrolled: true,
    status: 'Active',
    modules: [
      {
        id: 'm1',
        title: 'Module 1: Big-O Notation & Memory Allocation',
        duration: '2 Weeks',
        lessons: [
          { id: 'l1', title: '1.1 Complexity Analysis Basics', type: 'video', duration: '25 min', completed: true },
          { id: 'l2', title: '1.2 Space vs Time Tradeoffs', type: 'reading', duration: '15 min', completed: true },
          { id: 'l3', title: 'Quiz 1: Big-O Complexity', type: 'quiz', duration: '20 min', completed: true }
        ]
      },
      {
        id: 'm2',
        title: 'Module 2: Arrays, Stacks, & Linked Lists',
        duration: '3 Weeks',
        lessons: [
          { id: 'l4', title: '2.1 Singly vs Doubly Linked Lists', type: 'video', duration: '30 min', completed: true },
          { id: 'l5', title: '2.2 Stack and Queue Implementations', type: 'video', duration: '35 min', completed: true },
          { id: 'l6', title: 'Assignment 1: Custom Deque in Python', type: 'assignment', duration: '2 hours', completed: true }
        ]
      },
      {
        id: 'm3',
        title: 'Module 3: Trees, Heaps & Graph Traversal',
        duration: '4 Weeks',
        lessons: [
          { id: 'l7', title: '3.1 Binary Search Trees & AVL Balancing', type: 'video', duration: '40 min', completed: true },
          { id: 'l8', title: '3.2 Breadth-First & Depth-First Search', type: 'video', duration: '45 min', completed: false },
          { id: 'l9', title: 'Assignment 2: Graph Shortest Path Visualizer', type: 'assignment', duration: '3 hours', completed: false }
        ]
      }
    ]
  },
  {
    id: 'crs_math301',
    code: 'MATH-301',
    title: 'AP Calculus BC & Multivariable Concepts',
    description: 'An accelerated study of differential and integral calculus, infinite series, parametric vectors, partial derivatives, and multiple integrals.',
    category: 'Mathematics',
    subject: 'Mathematics',
    gradeLevel: 'AP Level',
    difficulty: 'Honors / AP',
    instructorId: 'usr_teacher_202',
    instructorName: 'Prof. Arthur Pendelton',
    instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
    instructorTitle: 'Department Head of Mathematics',
    rating: 4.8,
    reviewCount: 94,
    enrolledCount: 28,
    capacity: 32,
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=600',
    durationWeeks: 16,
    credits: 5,
    scheduleDays: ['Tuesday', 'Thursday'],
    scheduleTime: '10:30 AM - 12:00 PM',
    room: 'Hall B - Math Building',
    syllabusOverview: 'Deep dive into Taylor/Maclaurin series, polar calculus, vector calculus, line integrals, and applications in physical modeling.',
    progressPercentage: 42,
    isEnrolled: true,
    status: 'Active',
    modules: [
      {
        id: 'mm1',
        title: 'Module 1: Advanced Integration Techniques',
        duration: '3 Weeks',
        lessons: [
          { id: 'ml1', title: '1.1 Integration by Parts & Partial Fractions', type: 'video', duration: '35 min', completed: true },
          { id: 'ml2', title: '1.2 Improper Integrals', type: 'reading', duration: '20 min', completed: true }
        ]
      },
      {
        id: 'mm2',
        title: 'Module 2: Infinite Sequences & Power Series',
        duration: '4 Weeks',
        lessons: [
          { id: 'ml3', title: '2.1 Convergence Tests', type: 'video', duration: '40 min', completed: true },
          { id: 'ml4', title: '2.2 Taylor Polynomial Approximations', type: 'assignment', duration: '1.5 hours', completed: false }
        ]
      }
    ]
  },
  {
    id: 'crs_phy202',
    code: 'PHY-202',
    title: 'Honors Physics II: Electromagnetism & Waves',
    description: 'Explore electric fields, Gauss Law, magnetic induction, Maxwell equations, wave optics, and modern quantum physics fundamentals.',
    category: 'Science',
    subject: 'Science',
    gradeLevel: 'Grade 11',
    difficulty: 'Advanced',
    instructorId: 'usr_teacher_203',
    instructorName: 'Dr. Sarah Lin',
    instructorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250',
    instructorTitle: 'Associate Professor of Physics',
    rating: 4.9,
    reviewCount: 86,
    enrolledCount: 30,
    capacity: 35,
    image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=600',
    durationWeeks: 14,
    credits: 4,
    scheduleDays: ['Monday', 'Wednesday'],
    scheduleTime: '01:15 PM - 02:45 PM',
    room: 'Physics Lab 101',
    syllabusOverview: 'Covers electrostatics, circuit analysis, electromagnetism, wave interference, diffraction, and introductory atomic physics.',
    progressPercentage: 85,
    isEnrolled: true,
    status: 'Active',
    modules: [
      {
        id: 'pm1',
        title: 'Module 1: Electric Charges & Fields',
        duration: '3 Weeks',
        lessons: [
          { id: 'pl1', title: '1.1 Coulombs Law & Electric Flux', type: 'video', duration: '30 min', completed: true }
        ]
      }
    ]
  },
  {
    id: 'crs_lit104',
    code: 'LIT-104',
    title: 'World Literature & Critical Analysis',
    description: 'Analyze classical and modern world literary masterpieces, investigating cultural narratives, symbolism, themes, and expository essay composition.',
    category: 'Humanities',
    subject: 'Humanities',
    gradeLevel: 'Grade 10',
    difficulty: 'Intermediate',
    instructorId: 'usr_teacher_204',
    instructorName: 'Elena Rostova',
    instructorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
    instructorTitle: 'Chair of Humanities',
    rating: 4.7,
    reviewCount: 65,
    enrolledCount: 22,
    capacity: 30,
    image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=600',
    durationWeeks: 12,
    credits: 3,
    scheduleDays: ['Tuesday', 'Thursday'],
    scheduleTime: '08:30 AM - 09:45 AM',
    room: 'Humanities Wing 204',
    syllabusOverview: 'Reading list includes Homer, Shakespeare, Gabriel García Márquez, and contemporary post-colonial prose.',
    progressPercentage: 0,
    isEnrolled: false,
    status: 'Active',
    modules: []
  },
  {
    id: 'crs_ai401',
    code: 'CS-401',
    title: 'Intro to Artificial Intelligence & Neural Networks',
    description: 'Practical introduction to machine learning algorithms, supervised classification, deep neural networks, computer vision, and NLP with PyTorch.',
    category: 'Computer Science',
    subject: 'Computer Science',
    gradeLevel: 'Undergraduate',
    difficulty: 'Advanced',
    instructorId: 'usr_teacher_201',
    instructorName: 'Dr. Evelyn Vance',
    instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    instructorTitle: 'Senior CS Lecturer',
    rating: 5.0,
    reviewCount: 142,
    enrolledCount: 38,
    capacity: 40,
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=600',
    durationWeeks: 15,
    credits: 4,
    scheduleDays: ['Wednesday', 'Friday'],
    scheduleTime: '11:00 AM - 12:30 PM',
    room: 'AI Innovation Hub 401',
    syllabusOverview: 'Gradient descent, backpropagation, CNN architectures, Transformers, ethics in AI deployment, and capstone team project.',
    progressPercentage: 0,
    isEnrolled: false,
    status: 'Active',
    modules: []
  },
  {
    id: 'crs_art205',
    code: 'ART-205',
    title: 'Digital UI/UX Design & Product Prototyping',
    description: 'Learn human-centered design principles, visual hierarchy, user research, wireframing, interactive prototyping in Figma, and usability testing.',
    category: 'Art & Design',
    subject: 'Art & Design',
    gradeLevel: 'Grade 12',
    difficulty: 'Intermediate',
    instructorId: 'usr_teacher_205',
    instructorName: 'Marcus Sterling',
    instructorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=250',
    instructorTitle: 'Adjunct Professor of Design',
    rating: 4.85,
    reviewCount: 52,
    enrolledCount: 25,
    capacity: 25,
    image: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&q=80&w=600',
    durationWeeks: 12,
    credits: 3,
    scheduleDays: ['Monday', 'Wednesday'],
    scheduleTime: '03:00 PM - 04:30 PM',
    room: 'Design Studio B',
    syllabusOverview: 'User personas, information architecture, design systems, accessibility WCAG compliance, interactive prototyping.',
    progressPercentage: 15,
    isEnrolled: true,
    status: 'Active',
    modules: []
  }
];

export const initialTimetable: TimetableSlot[] = [
  {
    id: 'ts_1',
    courseId: 'crs_cs101',
    courseCode: 'CS-201',
    courseTitle: 'Data Structures & Algorithms',
    instructorName: 'Dr. Evelyn Vance',
    room: 'Lab 302',
    dayOfWeek: 'Monday',
    startTime: '09:00 AM',
    endTime: '10:15 AM',
    status: 'completed',
    meetingUrl: 'https://academy.edu/meet/cs201-mon',
    assignmentDue: 'Assignment 2: Graph Traversals due 11:59 PM',
    category: 'Computer Science'
  },
  {
    id: 'ts_2',
    courseId: 'crs_phy202',
    courseCode: 'PHY-202',
    courseTitle: 'Honors Physics II Lab',
    instructorName: 'Dr. Sarah Lin',
    room: 'Physics Lab 101',
    dayOfWeek: 'Monday',
    startTime: '01:15 PM',
    endTime: '02:45 PM',
    status: 'completed',
    meetingUrl: 'https://academy.edu/meet/phy202-lab',
    category: 'Science'
  },
  {
    id: 'ts_3',
    courseId: 'crs_art205',
    courseCode: 'ART-205',
    courseTitle: 'Digital UI/UX Studio',
    instructorName: 'Marcus Sterling',
    room: 'Design Studio B',
    dayOfWeek: 'Monday',
    startTime: '03:00 PM',
    endTime: '04:30 PM',
    status: 'completed',
    category: 'Art & Design'
  },
  {
    id: 'ts_4',
    courseId: 'crs_math301',
    courseCode: 'MATH-301',
    courseTitle: 'AP Calculus BC',
    instructorName: 'Prof. Arthur Pendelton',
    room: 'Hall B - Math Bldg',
    dayOfWeek: 'Tuesday',
    startTime: '10:30 AM',
    endTime: '12:00 PM',
    status: 'completed',
    assignmentDue: 'Problem Set #6: Power Series',
    category: 'Mathematics'
  },
  {
    id: 'ts_5',
    courseId: 'crs_cs101',
    courseCode: 'CS-201',
    courseTitle: 'Data Structures & Algorithms',
    instructorName: 'Dr. Evelyn Vance',
    room: 'Lab 302',
    dayOfWeek: 'Wednesday',
    startTime: '09:00 AM',
    endTime: '10:15 AM',
    status: 'live',
    meetingUrl: 'https://academy.edu/meet/cs201-live',
    assignmentDue: 'Live Coding Benchmark',
    category: 'Computer Science'
  },
  {
    id: 'ts_6',
    courseId: 'crs_phy202',
    courseCode: 'PHY-202',
    courseTitle: 'Honors Physics II Lecture',
    instructorName: 'Dr. Sarah Lin',
    room: 'Physics Lab 101',
    dayOfWeek: 'Wednesday',
    startTime: '01:15 PM',
    endTime: '02:45 PM',
    status: 'upcoming',
    meetingUrl: 'https://academy.edu/meet/phy202-wed',
    category: 'Science'
  },
  {
    id: 'ts_7',
    courseId: 'crs_art205',
    courseCode: 'ART-205',
    courseTitle: 'Design System Critique',
    instructorName: 'Marcus Sterling',
    room: 'Design Studio B',
    dayOfWeek: 'Wednesday',
    startTime: '03:00 PM',
    endTime: '04:30 PM',
    status: 'upcoming',
    category: 'Art & Design'
  },
  {
    id: 'ts_8',
    courseId: 'crs_math301',
    courseCode: 'MATH-301',
    courseTitle: 'AP Calculus BC Review',
    instructorName: 'Prof. Arthur Pendelton',
    room: 'Hall B - Math Bldg',
    dayOfWeek: 'Thursday',
    startTime: '10:30 AM',
    endTime: '12:00 PM',
    status: 'upcoming',
    category: 'Mathematics'
  },
  {
    id: 'ts_9',
    courseId: 'crs_cs101',
    courseCode: 'CS-201',
    courseTitle: 'Data Structures Lab & Recitation',
    instructorName: 'Dr. Evelyn Vance',
    room: 'Lab 302',
    dayOfWeek: 'Friday',
    startTime: '09:00 AM',
    endTime: '10:15 AM',
    status: 'upcoming',
    category: 'Computer Science'
  }
];

export const initialAnnouncements: Announcement[] = [
  {
    id: 'ann_1',
    title: 'Midterm Exam Schedule & Room Allocations Released',
    content: 'All Spring midterm examination dates and hall allocations are now finalized. Please check your personalized examination schedule on the student dashboard before Friday.',
    authorName: 'Marcus Vance',
    authorRole: 'Dean of Academic Affairs',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    date: '2 hours ago',
    category: 'Exam'
  },
  {
    id: 'ann_2',
    title: 'CS-201 Assignment 2 Extension & Office Hours',
    content: 'Dr. Vance has extended Assignment 2 (Graph Shortest Paths) by 24 hours. Extra teaching assistant office hours will be held in Lab 302 on Thursday afternoon.',
    authorName: 'Dr. Evelyn Vance',
    authorRole: 'CS Department Lead',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    date: 'Yesterday',
    category: 'General',
    targetCourseCode: 'CS-201'
  },
  {
    id: 'ann_3',
    title: 'Academy Hackathon 2026: Registration Open',
    content: 'Join over 300 student builders for 36 hours of coding, hardware prototyping, and AI challenges. $10,000 in scholarship awards!',
    authorName: 'Academy Tech Club',
    authorRole: 'Student Affairs',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    date: '3 days ago',
    category: 'Event'
  }
];

export const schemaDocs: SchemaDoc[] = [
  {
    id: 'sch_users_mongo',
    modelName: 'User Schema',
    dbEngine: 'MongoDB (Mongoose)',
    description: 'Stores student, teacher, and administrator credentials, profiles, academic achievements, and system metadata.',
    definition: `import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'student' | 'teacher' | 'admin';
  avatar?: string;
  gradeLevel?: string;
  department?: string;
  title?: string;
  bio?: string;
  gpa?: number;
  skills: string[];
  badges: Array<{
    title: string;
    description: string;
    iconName: string;
    earnedDate: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
  avatar: { type: String },
  gradeLevel: { type: String },
  department: { type: String },
  title: { type: String },
  bio: { type: String },
  gpa: { type: Number, min: 0, max: 4.0 },
  skills: [{ type: String }],
  badges: [{
    title: String,
    description: String,
    iconName: String,
    earnedDate: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

UserSchema.index({ role: 1, department: 1 });

export default mongoose.model<IUser>('User', UserSchema);`,
    jsonExample: JSON.stringify({
      _id: '65e9b21f8a7c3a1094f311a2',
      name: 'Alex Rivera',
      email: 'alex.rivera@academy.edu',
      role: 'student',
      gradeLevel: 'Grade 11 - STEM Honors',
      gpa: 3.88,
      skills: ['Python', 'Calculus', 'Data Structures'],
      createdAt: '2026-01-15T08:00:00.000Z'
    }, null, 2),
    indexes: ['email (unique)', 'role + department (compound)'],
    relations: ['One-to-Many with Enrollments', 'One-to-Many with Timetable Slots (Instructor)']
  },
  {
    id: 'sch_courses_sql',
    modelName: 'Courses Table',
    dbEngine: 'PostgreSQL (SQL / Drizzle)',
    description: 'Relational table tracking all academy courses, syllabus structure, instructor foreign keys, and enrollment capacities.',
    definition: `import { pgTable, varchar, text, integer, decimal, boolean, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const courses = pgTable('courses', {
  id: varchar('id', { length: 36 }).primaryKey(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  subject: varchar('subject', { length: 100 }).notNull(),
  gradeLevel: varchar('grade_level', { length: 50 }).notNull(),
  difficulty: varchar('difficulty', { length: 50 }).notNull(),
  instructorId: varchar('instructor_id', { length: 36 }).references(() => users.id),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('5.00'),
  enrolledCount: integer('enrolled_count').default(0),
  capacity: integer('capacity').notNull(),
  image: text('image'),
  durationWeeks: integer('duration_weeks').notNull(),
  credits: integer('credits').notNull(),
  room: varchar('room', { length: 100 }),
  status: varchar('status', { length: 20 }).default('Active'),
  createdAt: timestamp('created_at').defaultNow()
});`,
    jsonExample: JSON.stringify({
      id: 'crs_cs101',
      code: 'CS-201',
      title: 'Data Structures & Algorithms in Python',
      category: 'Computer Science',
      grade_level: 'Grade 11',
      instructor_id: 'usr_teacher_201',
      capacity: 40,
      enrolled_count: 34
    }, null, 2),
    indexes: ['idx_courses_code (UNIQUE)', 'idx_courses_category_grade (COMPOUND)'],
    relations: ['Foreign Key instructor_id -> users.id', 'Referenced by enrollments.course_id']
  },
  {
    id: 'sch_enrollments_mongo',
    modelName: 'Enrollment Schema',
    dbEngine: 'MongoDB (Mongoose)',
    description: 'Tracks student-course relationships, module completion progress, letter grades, and attendance metrics.',
    definition: `import mongoose, { Schema, Document } from 'mongoose';

export interface IEnrollment extends Document {
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  enrollmentDate: Date;
  status: 'active' | 'completed' | 'dropped';
  progressPercentage: number;
  finalGrade?: string;
  completedLessonIds: string[];
}

const EnrollmentSchema = new Schema<IEnrollment>({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  enrollmentDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'completed', 'dropped'], default: 'active' },
  progressPercentage: { type: Number, default: 0 },
  finalGrade: { type: String },
  completedLessonIds: [{ type: String }]
}, { timestamps: true });

EnrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export default mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);`,
    jsonExample: JSON.stringify({
      _id: '65e9b9901234a1094f311c99',
      studentId: '65e9b21f8a7c3a1094f311a2',
      courseId: '65e9b3309990b1094f311b55',
      status: 'active',
      progressPercentage: 68,
      completedLessonIds: ['l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7']
    }, null, 2),
    indexes: ['studentId + courseId (compound unique)'],
    relations: ['References User (student)', 'References Course']
  }
];

export const apiRoutesDocs: ApiRouteDoc[] = [
  {
    id: 'api_1',
    method: 'GET',
    endpoint: '/api/courses',
    category: 'Courses',
    description: 'Retrieve filterable course catalog list by Grade, Subject, Difficulty, or Search keyword.',
    responseExample: JSON.stringify({
      success: true,
      count: 6,
      courses: ['[Array of Course Objects]']
    }, null, 2)
  },
  {
    id: 'api_2',
    method: 'POST',
    endpoint: '/api/courses/:id/enroll',
    category: 'Enrollments',
    description: 'Toggle student enrollment status for a specific course ID.',
    requestBody: JSON.stringify({ studentId: 'usr_student_101' }, null, 2),
    responseExample: JSON.stringify({
      success: true,
      isEnrolled: true,
      message: 'Successfully enrolled in CS-201: Data Structures & Algorithms',
      course: { id: 'crs_cs101', code: 'CS-201', enrolledCount: 35 }
    }, null, 2)
  },
  {
    id: 'api_3',
    method: 'GET',
    endpoint: '/api/timetable',
    category: 'Timetable',
    description: 'Fetch weekly interactive class schedule slots filtered by Day or User Role.',
    responseExample: JSON.stringify({
      success: true,
      timetable: ['[Array of TimetableSlot Objects]']
    }, null, 2)
  },
  {
    id: 'api_4',
    method: 'POST',
    endpoint: '/api/auth/login',
    category: 'Authentication',
    description: 'Authenticates student or faculty credentials and returns user profile & active role token.',
    requestBody: JSON.stringify({ email: 'alex.rivera@academy.edu', role: 'student' }, null, 2),
    responseExample: JSON.stringify({
      success: true,
      token: 'jwt.ey...sample_token',
      user: { id: 'usr_student_101', name: 'Alex Rivera', role: 'student' }
    }, null, 2)
  },
  {
    id: 'api_5',
    method: 'PUT',
    endpoint: '/api/profile',
    category: 'Profiles',
    description: 'Updates student or teacher profile biography, skills, or personal information.',
    requestBody: JSON.stringify({ bio: 'Updated bio text...', skills: ['Python', 'Rust', 'Algorithms'] }, null, 2),
    responseExample: JSON.stringify({
      success: true,
      message: 'Profile updated successfully',
      profile: { id: 'usr_student_101', bio: 'Updated bio text...' }
    }, null, 2)
  },
  {
    id: 'api_6',
    method: 'POST',
    endpoint: '/api/ai/tutor',
    category: 'Courses',
    description: 'AI Study Assistant endpoint powered by Gemini API to answer course questions or summarize lectures.',
    requestBody: JSON.stringify({ prompt: 'Explain Dijkstra shortest path algorithm with a simple example', courseCode: 'CS-201' }, null, 2),
    responseExample: JSON.stringify({
      success: true,
      answer: 'Dijkstra algorithm finds the shortest path from a starting node to all other nodes in a weighted graph...'
    }, null, 2)
  }
];
