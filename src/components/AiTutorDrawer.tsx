import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, User, BookOpen, RefreshCw } from 'lucide-react';

interface AiTutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiTutorDrawer: React.FC<AiTutorDrawerProps> = ({ isOpen, onClose }) => {
  const [promptInput, setPromptInput] = useState('');
  const [messages, setMessages] = useState<Array<{ id: string; sender: 'user' | 'tutor'; text: string; time: string }>>([
    {
      id: 'm0',
      sender: 'tutor',
      text: 'Hello! I am your **Academy AI Study Assistant** powered by Gemini. Ask me anything about Data Structures, Calculus, Physics, or literature assignments!',
      time: 'Just now'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const sampleQuestions = [
    'Explain Dijkstra shortest path in simple terms',
    'How do I calculate infinite Taylor series convergence?',
    'Summarize Gauss Law for electric flux',
    'Tips for writing a high scoring CS-201 essay'
  ];

  const handleSendPrompt = async (textToSend?: string) => {
    const query = textToSend || promptInput;
    if (!query.trim() || isLoading) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user' as const,
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setPromptInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query, courseCode: 'CS-201' })
      });
      const data = await res.json();

      const tutorMsg = {
        id: `tut_${Date.now()}`,
        sender: 'tutor' as const,
        text: data.answer || 'I am ready to help you with your question.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, tutorMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'tutor',
          text: 'Sorry, I ran into a network error processing your request. Please try again.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>Academy AI Tutor</span>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded border border-indigo-400/30">Gemini 2.5</span>
              </h2>
              <p className="text-[11px] text-slate-300">24/7 Educational Study Companion</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {messages.map(m => (
            <div
              key={m.id}
              className={`flex gap-3 text-xs leading-relaxed ${
                m.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.sender === 'tutor' && (
                <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`p-3.5 rounded-2xl max-w-[85%] space-y-1 ${
                m.sender === 'user'
                  ? 'bg-indigo-600 text-white font-medium rounded-tr-none shadow-sm'
                  : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60'
              }`}>
                <p className="whitespace-pre-wrap">{m.text}</p>
                <div className={`text-[9px] text-right font-normal ${m.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {m.time}
                </div>
              </div>

              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold flex-shrink-0 text-[10px]">
                  You
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 text-xs justify-start items-center">
              <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-100 text-slate-500 rounded-tl-none flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span>Generating step-by-step study answer...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Sample Questions */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sample Prompts</div>
          <div className="flex flex-wrap gap-1.5">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendPrompt(q)}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 text-[11px] text-slate-700 font-medium transition-colors text-left line-clamp-1"
              >
                💡 {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendPrompt(); }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask a question about your courses..."
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              type="submit"
              disabled={isLoading || !promptInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
