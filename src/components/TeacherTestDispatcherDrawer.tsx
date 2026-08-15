import React, { useState } from 'react';
import { ClipboardCheck, X, Send, Bot, User, ShieldAlert, CheckCircle2, RefreshCw, History } from 'lucide-react';
import { ParsedTestCommand, TestDispatchRecord } from '../types';

interface TeacherTestDispatcherDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type ChatEntry =
  | { id: string; kind: 'user'; text: string }
  | { id: string; kind: 'assistant'; text: string }
  | { id: string; kind: 'confirm'; parsed: ParsedTestCommand }
  | { id: string; kind: 'dispatched'; record: TestDispatchRecord };

export const TeacherTestDispatcherDrawer: React.FC<TeacherTestDispatcherDrawerProps> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [entries, setEntries] = useState<ChatEntry[]>([
    {
      id: 'welcome',
      kind: 'assistant',
      text: 'Describe a test result to send, e.g. "Send ID 12345\'s test score 92/100 in Physics to their parent." I will look up the student and show you exactly who it will go to before anything is sent — nothing is dispatched without your confirmation.'
    }
  ]);

  if (!isOpen) return null;

  const handleSend = async () => {
    const command = input.trim();
    if (!command || isLoading) return;

    setEntries(prev => [...prev, { id: `u_${Date.now()}`, kind: 'user', text: command }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/teacher/test-results/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setEntries(prev => [...prev, { id: `e_${Date.now()}`, kind: 'assistant', text: data.error || 'Sorry, something went wrong parsing that command.' }]);
        return;
      }

      const parsed: ParsedTestCommand = data.parsed;
      if (parsed.ambiguous) {
        setEntries(prev => [...prev, { id: `e_${Date.now()}`, kind: 'assistant', text: parsed.error || 'I could not confidently match that to one student and score — please include a student ID and a numeric score.' }]);
      } else {
        setEntries(prev => [...prev, { id: `c_${Date.now()}`, kind: 'confirm', parsed }]);
      }
    } catch {
      setEntries(prev => [...prev, { id: `e_${Date.now()}`, kind: 'assistant', text: 'Network error while parsing that command. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDispatch = async (parsed: ParsedTestCommand) => {
    if (!parsed.student || parsed.score === null) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/teacher/test-results/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: parsed.student.id,
          score: parsed.score,
          maxScore: parsed.maxScore,
          subject: parsed.subject || 'General'
        })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setEntries(prev => [...prev, { id: `e_${Date.now()}`, kind: 'assistant', text: data.error || 'Dispatch failed.' }]);
        return;
      }

      setEntries(prev => [...prev, { id: `d_${Date.now()}`, kind: 'dispatched', record: data.record }]);
    } catch {
      setEntries(prev => [...prev, { id: `e_${Date.now()}`, kind: 'assistant', text: 'Network error while dispatching. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelConfirm = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    setEntries(prev => [...prev, { id: `x_${Date.now()}`, kind: 'assistant', text: 'Cancelled — nothing was sent.' }]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-200">

        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>Test Result Dispatcher</span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30">Demo</span>
              </h2>
              <p className="text-[11px] text-slate-300">Parses & sends test results to parents — with confirmation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice */}
        <div className="px-4 pt-3">
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 leading-relaxed">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Demo environment: no real email provider is configured, so dispatches are simulated and logged rather than delivered. Every dispatch requires your explicit confirmation below.</span>
          </div>
        </div>

        {/* Messages Body */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {entries.map(entry => {
            if (entry.kind === 'user') {
              return (
                <div key={entry.id} className="flex gap-3 text-xs leading-relaxed justify-end">
                  <div className="p-3.5 rounded-2xl max-w-[85%] bg-emerald-600 text-white font-medium rounded-tr-none shadow-sm">
                    <p className="whitespace-pre-wrap">{entry.text}</p>
                  </div>
                  <div className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold flex-shrink-0 text-[10px]">You</div>
                </div>
              );
            }
            if (entry.kind === 'assistant') {
              return (
                <div key={entry.id} className="flex gap-3 text-xs leading-relaxed justify-start">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3.5 rounded-2xl max-w-[85%] bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60">
                    <p className="whitespace-pre-wrap">{entry.text}</p>
                  </div>
                </div>
              );
            }
            if (entry.kind === 'confirm') {
              const { parsed } = entry;
              const student = parsed.student!;
              return (
                <div key={entry.id} className="flex gap-3 text-xs justify-start">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-2xl max-w-[90%] bg-white border-2 border-emerald-200 rounded-tl-none space-y-2.5 shadow-sm">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Confirm before sending</div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                      <span className="text-slate-400">Student</span>
                      <span className="font-semibold text-slate-800">{student.name} (ID {student.id})</span>
                      <span className="text-slate-400">Parent</span>
                      <span className="font-semibold text-slate-800">{student.parentName}</span>
                      <span className="text-slate-400">Sending to</span>
                      <span className="font-semibold text-slate-800">{student.parentEmail}</span>
                      <span className="text-slate-400">Score</span>
                      <span className="font-semibold text-slate-800">{parsed.score}/{parsed.maxScore}</span>
                      <span className="text-slate-400">Subject</span>
                      <span className="font-semibold text-slate-800">{parsed.subject || 'General'}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleConfirmDispatch(parsed)}
                        disabled={isLoading}
                        className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-[11px] flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Confirm & Dispatch
                      </button>
                      <button
                        onClick={() => handleCancelConfirm(entry.id)}
                        disabled={isLoading}
                        className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              );
            }
            // dispatched
            const { record } = entry;
            return (
              <div key={entry.id} className="flex gap-3 text-xs justify-start">
                <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="p-3.5 rounded-2xl max-w-[85%] bg-emerald-50 text-emerald-900 rounded-tl-none border border-emerald-200 space-y-1">
                  <p className="font-semibold">Dispatch recorded (simulated)</p>
                  <p className="text-[11px] leading-relaxed">
                    {record.studentName}'s result ({record.score}/{record.maxScore} in {record.subject}) was logged for {record.parentEmail}. No real email was sent in this demo.
                  </p>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 text-xs justify-start items-center">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-100 text-slate-500 rounded-tl-none flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span>Processing...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g. Send ID 12345's test score 92/100 in Physics to their parent"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="mt-2 text-[10px] text-slate-400 flex items-center gap-1"><History className="w-3 h-3" /> Every parsed command must be confirmed before anything is dispatched.</p>
        </div>
      </div>
    </div>
  );
};
