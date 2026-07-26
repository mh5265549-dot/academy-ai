import React, { useState } from 'react';
import { Terminal, FolderTree, Database, Code, Play, Check, Copy, ArrowRight, Shield, Layers, FileCode } from 'lucide-react';
import { SchemaDoc, ApiRouteDoc } from '../types';

interface ArchitectureDocsViewProps {
  schemas: SchemaDoc[];
  routes: ApiRouteDoc[];
}

export const ArchitectureDocsView: React.FC<ArchitectureDocsViewProps> = ({
  schemas,
  routes
}) => {
  const [activeTab, setActiveTab] = useState<'structure' | 'schemas' | 'api'>('structure');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Live API test bench response state
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/api/courses');
  const [isExecutingApi, setIsExecutingApi] = useState(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExecuteApi = async (endpoint: string, method: string = 'GET', body?: any) => {
    setSelectedEndpoint(endpoint);
    setIsExecutingApi(true);
    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
      });
      const data = await res.json();
      setApiResponse(data);
    } catch (err: any) {
      setApiResponse({ error: err.message });
    } finally {
      setIsExecutingApi(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-2">
            <Terminal className="w-3.5 h-3.5" />
            <span>Developer Reference & System Architecture</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Technical Implementation Guide</h1>
          <p className="text-sm text-slate-500 mt-1">Full-stack project directory structure, database models, and Express REST API documentation.</p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('structure')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'structure'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>1. Project Folder Structure</span>
        </button>

        <button
          onClick={() => setActiveTab('schemas')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'schemas'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>2. Database Schemas (Mongo / SQL)</span>
        </button>

        <button
          onClick={() => setActiveTab('api')}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'api'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>3. Express API Test Bench</span>
        </button>
      </div>

      {/* TAB 1: Folder Structure */}
      {activeTab === 'structure' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Frontend Tree */}
            <div className="p-6 rounded-3xl bg-slate-900 text-slate-200 font-mono text-xs space-y-4 shadow-lg border border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="font-bold text-indigo-400 text-sm flex items-center gap-2">
                  <FolderTree className="w-4 h-4" /> Frontend Components & State
                </span>
                <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded">React 19 + Vite</span>
              </div>

              <pre className="text-emerald-400 leading-relaxed overflow-x-auto">
{`academy-lms/
├── index.html
├── package.json
├── vite.config.ts
└── src/
    ├── main.tsx                # Entry mounting React app
    ├── App.tsx                 # Main layout shell & tab routing
    ├── index.css               # Tailwind CSS v4 directives
    ├── types.ts                # Data models & interfaces
    │
    ├── data/
    │   └── mockData.ts         # Seed datasets, schemas, API docs
    │
    └── components/
        ├── Navbar.tsx          # Top header & role switcher
        ├── Sidebar.tsx         # Navigation drawer
        ├── DashboardView.tsx   # Metrics & upcoming classes
        ├── CourseCatalogView.tsx # Filterable course catalog & modal
        ├── TimetableScheduleView.tsx # Weekly timetable grid
        ├── ProfileOverviewView.tsx # Role-tailored transcript & bio
        ├── ArchitectureDocsView.tsx # Developer reference & API test bench
        └── AiTutorDrawer.tsx   # Gemini powered AI tutor`}
              </pre>
            </div>

            {/* Backend Tree */}
            <div className="p-6 rounded-3xl bg-slate-900 text-slate-200 font-mono text-xs space-y-4 shadow-lg border border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="font-bold text-amber-400 text-sm flex items-center gap-2">
                  <FolderTree className="w-4 h-4" /> Express Server Architecture
                </span>
                <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded">Node.js + Express</span>
              </div>

              <pre className="text-amber-300 leading-relaxed overflow-x-auto">
{`server.ts                       # Main Express Server File
├── GET  /api/health            # Service health status
├── GET  /api/auth/me           # Get active user session
├── POST /api/auth/login        # Role-based authentication
├── GET  /api/courses           # Filterable course catalog query
├── GET  /api/courses/:id       # Course detail & module progress
├── POST /api/courses/:id/enroll # Student enrollment controller
├── POST /api/courses           # Faculty course creation
├── GET  /api/timetable         # Weekly schedule controller
├── POST /api/timetable         # Create timetable slot
├── GET  /api/profile           # Retrieve profile & transcript
├── PUT  /api/profile           # Update bio & competencies
├── GET  /api/analytics         # Academy operational metrics
└── POST /api/ai/tutor          # Gemini AI study assistant proxy`}
              </pre>
            </div>

          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Key Architectural Best Practices Applied</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Separation of Concerns:</strong> Clear boundary between React UI presentation components and Express REST API controller routes.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Server-Side Secret Isolation:</strong> Gemini API keys are kept strictly in `server.ts` and never exposed to client browser state.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Compound Indexing:</strong> Mongoose & SQL Drizzle schema definitions optimized for quick filtering by Grade Level and Subject.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Stateful In-Memory Store:</strong> Live runtime persistence allows student enrollments and profile updates to update across tabs.</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 2: Database Schema Models */}
      {activeTab === 'schemas' && (
        <div className="space-y-6">
          {schemas.map(sch => (
            <div key={sch.id} className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-slate-900">{sch.modelName}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-200/60">
                      {sch.dbEngine}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{sch.description}</p>
                </div>

                <button
                  onClick={() => copyToClipboard(sch.definition, sch.id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5"
                >
                  {copiedId === sch.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === sch.id ? 'Copied' : 'Copy Schema'}</span>
                </button>
              </div>

              {/* Code Definition */}
              <div className="rounded-2xl bg-slate-950 p-4 text-slate-200 font-mono text-xs overflow-x-auto shadow-inner">
                <pre>{sch.definition}</pre>
              </div>

              {/* Schema Metadata & JSON sample */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 space-y-2">
                  <div className="font-bold text-slate-800">Database Indexing Strategy</div>
                  <ul className="list-disc list-inside text-slate-600 space-y-1">
                    {sch.indexes.map(idx => <li key={idx}>{idx}</li>)}
                  </ul>
                  <div className="font-bold text-slate-800 pt-2">Relational & Foreign Key Mappings</div>
                  <ul className="list-disc list-inside text-slate-600 space-y-1">
                    {sch.relations.map(rel => <li key={rel}>{rel}</li>)}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 space-y-2">
                  <div className="font-bold text-slate-800">Sample JSON BSON Payload</div>
                  <pre className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] font-mono text-indigo-900 overflow-x-auto">
                    {sch.jsonExample}
                  </pre>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Express API Test Bench */}
      {activeTab === 'api' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Live REST API Endpoint Test Bench</h3>
            <p className="text-xs text-slate-500">Test real requests against the Express Node.js backend running on port 3000.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Route list buttons */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Select API Route to Execute</label>
                <div className="space-y-2">
                  {routes.map(r => (
                    <div
                      key={r.id}
                      onClick={() => handleExecuteApi(r.endpoint, r.method)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedEndpoint === r.endpoint
                          ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20'
                          : 'bg-white border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          r.method === 'GET' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {r.method}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-800">{r.endpoint}</span>
                      </div>

                      <button className="p-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm">
                        <Play className="w-3 h-3 fill-white" />
                        <span className="text-[10px]">Execute</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Response Inspector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Response Payload ({selectedEndpoint})</span>
                  {isExecutingApi && <span className="text-indigo-600 animate-pulse">Requesting...</span>}
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs min-h-[300px] max-h-[500px] overflow-y-auto border border-slate-800">
                  {apiResponse ? (
                    <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
                  ) : (
                    <div className="text-slate-500 text-center py-20 italic">
                      Click "Execute" on any API route to view real server JSON output.
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
