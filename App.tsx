
import React, { useState, useEffect, useMemo } from 'react';
import { Schedule, ChecklistItem, Priority } from './types';
import DailyAssistant from './components/DailyAssistant';
import Checklist from './components/Checklist';
import { 
  Plus, Calendar, Search, Trash2, Layout, 
  CheckCircle2, StickyNote, X, Save, 
  TrendingUp, CheckSquare, Clock, AlertCircle,
  ClipboardCheck, ChevronDown
} from 'lucide-react';

const COLORS = [
  'bg-blue-50 border-blue-100 text-blue-700',
  'bg-emerald-50 border-emerald-100 text-emerald-700',
  'bg-amber-50 border-amber-100 text-amber-700',
  'bg-rose-50 border-rose-100 text-rose-700',
  'bg-indigo-50 border-indigo-100 text-indigo-700',
  'bg-slate-50 border-slate-100 text-slate-700',
];

const App: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>(() => {
    const saved = localStorage.getItem('zenplan_schedules');
    return saved ? JSON.parse(saved) : [];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');

  // New Schedule State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    localStorage.setItem('zenplan_schedules', JSON.stringify(schedules));
  }, [schedules]);

  const stats = useMemo(() => {
    const today = new Date().toLocaleDateString();
    const todayTasks = schedules.filter(s => new Date(s.date).toLocaleDateString() === today);
    const totalItems = todayTasks.reduce((acc, s) => acc + s.checklist.length, 0);
    const completedItems = todayTasks.reduce((acc, s) => acc + s.checklist.filter(c => c.isCompleted).length, 0);
    const percent = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
    
    return { todayTotal: todayTasks.length, completedItems, totalItems, percent };
  }, [schedules]);

  const filteredSchedules = useMemo(() => {
    return schedules
      .filter(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.notes && s.notes.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .sort((a, b) => {
        const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateDiff !== 0) return dateDiff;
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }, [schedules, searchQuery]);

  const addSchedule = () => {
    if (!newTitle.trim()) return;
    const newSchedule: Schedule = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTitle,
      description: newDesc,
      notes: newNotes,
      priority: newPriority,
      date: newDate,
      checklist: [],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      createdAt: Date.now(),
    };
    setSchedules([newSchedule, ...schedules]);
    setNewTitle('');
    setNewDesc('');
    setNewNotes('');
    setNewPriority('medium');
    setIsModalOpen(false);
  };

  const deleteSchedule = (id: string) => {
    setSchedules(schedules.filter(s => s.id !== id));
  };

  const updateNotes = (id: string, notes: string) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, notes } : s));
    setEditingNotesId(null);
  };

  const updateChecklist = (scheduleId: string, action: 'toggle' | 'add' | 'remove', itemId?: string, text?: string) => {
    setSchedules(prev => prev.map(s => {
      if (s.id !== scheduleId) return s;
      
      let newChecklist = [...s.checklist];
      if (action === 'toggle' && itemId) {
        newChecklist = newChecklist.map(item => 
          item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
        );
      } else if (action === 'add' && text) {
        newChecklist.push({ id: Math.random().toString(36).substr(2, 9), text, isCompleted: false });
      } else if (action === 'remove' && itemId) {
        newChecklist = newChecklist.filter(item => item.id !== itemId);
      }
      
      return { ...s, checklist: newChecklist };
    }));
  };

  const getPriorityStyle = (p: Priority) => {
    switch(p) {
      case 'high': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 max-w-6xl mx-auto px-4 py-8 md:py-12">
      {/* Header & Stats */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-200">
              <Layout className="text-white" size={28} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              ZenPlan
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-600 shadow-sm">
              <Clock size={14} className="text-indigo-500" />
              {stats.todayTotal} Schedules Today
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-600 shadow-sm">
              <CheckSquare size={14} className="text-emerald-500" />
              {stats.completedItems}/{stats.totalItems} Tasks
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-bold text-indigo-700 shadow-sm">
              <TrendingUp size={14} />
              {stats.percent}% Progress
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 w-full md:w-64 transition-all shadow-sm text-slate-900"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-100 active:scale-95 group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" /> New Task
          </button>
        </div>
      </header>

      {/* AI Assistant Section */}
      <DailyAssistant schedules={schedules} />

      {/* Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredSchedules.map((schedule) => {
          const progress = (schedule.checklist.length === 0) ? 0 : Math.round((schedule.checklist.filter(c => c.isCompleted).length / schedule.checklist.length) * 100);
          const isToday = new Date(schedule.date).toLocaleDateString() === new Date().toLocaleDateString();
          
          return (
            <div 
              key={schedule.id} 
              className={`bg-white rounded-[2rem] border transition-all duration-500 flex flex-col h-full group relative overflow-hidden ${
                schedule.priority === 'high' ? 'border-rose-200 shadow-rose-100 shadow-lg ring-1 ring-rose-50' : 'border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-indigo-100'
              }`}
            >
              {/* Card Header Background Decor */}
              <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 ${schedule.color}`} />
              
              <div className="p-7 flex flex-col h-full relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getPriorityStyle(schedule.priority)}`}>
                      {schedule.priority}
                    </div>
                    {isToday && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                        Today
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => deleteSchedule(schedule.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-extrabold text-slate-800 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
                    {schedule.title}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-2 min-h-[2.5rem]">
                    {schedule.description || "Click edit to add a description..."}
                  </p>
                </div>

                {/* Progress Mini Info */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      <span>Progress</span>
                      <span className={progress === 100 ? 'text-emerald-500' : ''}>{progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-700 ease-out ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Notes Toggleable Area */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <StickyNote size={12} className="text-amber-500" /> Quick Notes
                    </h4>
                    <button 
                      onClick={() => {
                        setEditingNotesId(schedule.id);
                        setTempNotes(schedule.notes || '');
                      }}
                      className="text-[10px] text-indigo-500 font-bold hover:underline"
                    >
                      {schedule.notes ? 'Edit' : 'Add'}
                    </button>
                  </div>
                  
                  {editingNotesId === schedule.id ? (
                    <div className="bg-slate-50 rounded-2xl p-3 border border-indigo-100 shadow-inner">
                      <textarea 
                        autoFocus
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                        className="w-full bg-transparent text-xs text-slate-700 focus:outline-none resize-none"
                        rows={4}
                        placeholder="Write something important..."
                      />
                      <div className="flex gap-2 justify-end mt-2">
                        <button onClick={() => setEditingNotesId(null)} className="p-1.5 text-slate-400 hover:bg-white rounded-lg">
                          <X size={14} />
                        </button>
                        <button onClick={() => updateNotes(schedule.id, tempNotes)} className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-lg hover:bg-indigo-700">
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50/50 rounded-2xl p-3 border border-dashed border-slate-200">
                      <p className="text-xs text-slate-500 whitespace-pre-wrap italic">
                        {schedule.notes || "No notes yet. Jot down details here."}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-6 border-t border-slate-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <ClipboardCheck size={14} className="text-indigo-500" /> Milestone Checklist
                    </h4>
                  </div>
                  <Checklist 
                    items={schedule.checklist}
                    onToggle={(itemId) => updateChecklist(schedule.id, 'toggle', itemId)}
                    onAdd={(text) => updateChecklist(schedule.id, 'add', undefined, text)}
                    onRemove={(itemId) => updateChecklist(schedule.id, 'remove', itemId)}
                  />
                </div>
              </div>
            </div>
          );
        })}

        {filteredSchedules.length === 0 && (
          <div className="col-span-full py-24 flex flex-col items-center text-slate-400 bg-white rounded-[3rem] border border-dashed border-slate-200">
            <div className="bg-indigo-50 p-8 rounded-full mb-6">
              <Calendar size={64} className="text-indigo-200" />
            </div>
            <p className="text-2xl font-black text-slate-800">Clear Horizon</p>
            <p className="text-slate-500 max-w-xs text-center mt-2 leading-relaxed">
              No tasks match your search or you haven't started your journey yet.
            </p>
          </div>
        )}
      </div>

      {/* New Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300">
            <div className="bg-indigo-600 p-10 text-white relative">
              <div className="absolute top-0 right-0 p-10 opacity-10">
                <Plus size={120} />
              </div>
              <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
                <Layout size={32} /> Plan Objective
              </h2>
              <p className="text-indigo-100 font-medium">Define your mission parameters.</p>
            </div>
            
            <div className="p-10 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-full">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Objective Title</label>
                  <input 
                    type="text" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="E.g. Quarterly Performance Review"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-900 font-bold"
                  />
                </div>
                
                <div className="col-span-full">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Priority Level</label>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                      <button
                        key={p}
                        onClick={() => setNewPriority(p)}
                        className={`flex-1 py-3 rounded-xl border-2 text-xs font-black uppercase transition-all ${
                          newPriority === p 
                            ? getPriorityStyle(p).replace('bg-', 'bg-').replace('text-', 'text-') + ' border-current scale-[1.02]' 
                            : 'bg-white border-slate-100 text-slate-400'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="col-span-full">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Executive Summary</label>
                  <textarea 
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Briefly describe the outcome..."
                    rows={2}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Target Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="date" 
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-900 font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-8 py-4 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-colors"
                >
                  Discard
                </button>
                <button 
                  onClick={addSchedule}
                  className="flex-1 px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                >
                  Finalize Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-32 pt-12 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-400 text-sm pb-12">
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1.5 rounded-lg">
            <Layout size={16} className="text-slate-400" />
          </div>
          <span className="font-bold tracking-tight text-slate-500">ZENPLAN 2.0</span>
        </div>
        <p className="font-medium text-center">Optimized for high-performance workflows.</p>
        <div className="flex gap-8 font-bold">
          <a href="#" className="hover:text-indigo-600 transition-colors">Vercel Status</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">API Docs</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
