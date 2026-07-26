import React, { useState } from 'react';
import { User, Award, BookOpen, CheckCircle2, Edit3, Save, Shield, Star, Mail, Code, Sparkles, Check, Send } from 'lucide-react';
import { UserProfile, UserRole, Course, Announcement } from '../types';

interface ProfileOverviewViewProps {
  user: UserProfile;
  role: UserRole;
  courses: Course[];
  onUpdateBio: (bio: string, skills: string[]) => void;
  onPostAnnouncement?: (title: string, content: string) => void;
}

export const ProfileOverviewView: React.FC<ProfileOverviewViewProps> = ({
  user,
  role,
  courses,
  onUpdateBio,
  onPostAnnouncement
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [bioText, setBioText] = useState(user.bio);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [skillsList, setSkillsList] = useState<string[]>(user.skills || []);

  // Post announcement state for teachers/admins
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPosted, setAnnPosted] = useState(false);

  const enrolledCourses = courses.filter(c => c.isEnrolled);

  const handleSaveProfile = () => {
    onUpdateBio(bioText, skillsList);
    setIsEditing(false);
  };

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !skillsList.includes(newSkillInput.trim())) {
      setSkillsList([...skillsList, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (sk: string) => {
    setSkillsList(skillsList.filter(s => s !== sk));
  };

  const handleAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;
    if (onPostAnnouncement) {
      onPostAnnouncement(annTitle, annContent);
    }
    setAnnPosted(true);
    setAnnTitle('');
    setAnnContent('');
    setTimeout(() => setAnnPosted(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">

      {/* Top Profile Card */}
      <div className="rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        
        {/* Cover Banner */}
        <div className="h-32 sm:h-40 bg-indigo-900 relative">
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur text-white text-xs font-bold uppercase tracking-wider border border-white/20">
              {role} Account
            </span>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6 sm:p-8 -mt-16 sm:-mt-20 relative z-10 space-y-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-white shadow-lg bg-slate-100"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{user.name}</h1>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200/60">
                    {user.studentId || user.employeeId || 'ACADEMY-MEMBER'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  {user.title || user.gradeLevel || user.department}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{user.email}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>
          </div>

          {/* Bio section */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Biography & Focus</h3>
            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  rows={3}
                  className="w-full p-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                
                {/* Skills Editor */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Competencies & Skills</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add skill (e.g. PyTorch)..."
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    />
                    <button onClick={handleAddSkill} type="button" className="px-3 py-1.5 bg-indigo-600 text-white font-bold text-xs rounded-xl">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {skillsList.map(sk => (
                      <span key={sk} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold flex items-center gap-1">
                        {sk}
                        <button onClick={() => handleRemoveSkill(sk)} className="text-slate-400 hover:text-rose-600">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{user.bio}</p>
            )}
          </div>

          {/* Skills Badges */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Verified Competencies</h3>
            <div className="flex flex-wrap gap-2">
              {(skillsList || []).map(sk => (
                <span key={sk} className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200/60">
                  ⚡ {sk}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Role Tailored Details */}
      {role === 'student' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Transcript / Performance */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <span>Academic Transcript</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
                <span className="font-medium text-slate-600">Cumulative GPA</span>
                <span className="font-extrabold text-indigo-700 text-base">{user.gpa || 3.88} / 4.00</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="font-medium text-slate-600">Completed Credits</span>
                <span className="font-bold text-slate-800">42 Units</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="font-medium text-slate-600">Attendance Standard</span>
                <span className="font-bold text-emerald-600">{user.attendanceRate || 96.5}%</span>
              </div>
            </div>
          </div>

          {/* Achievements & Badges */}
          <div className="md:col-span-2 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Earned Honor Badges</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {user.badges.map(b => (
                <div key={b.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold flex-shrink-0">
                    <Star className="w-5 h-5 fill-slate-950" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">{b.title}</span>
                      <span className="text-[10px] text-slate-400">{b.earnedDate}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Faculty Tools if Teacher or Admin */}
      {(role === 'teacher' || role === 'admin') && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Send className="w-5 h-5 text-indigo-600" />
            <span>Faculty Notice Announcement Board</span>
          </h3>

          <form onSubmit={handleAnnouncementSubmit} className="space-y-3 text-xs max-w-xl">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Announcement Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Midterm Review Office Hours"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Notice Content</label>
              <textarea
                required
                rows={3}
                placeholder="Details regarding upcoming deadlines, office hours, or lab safety protocols..."
                value={annContent}
                onChange={(e) => setAnnContent(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            {annPosted && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" /> Announcement published to student dashboard!
              </div>
            )}

            <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow">
              Broadcast Notice
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
