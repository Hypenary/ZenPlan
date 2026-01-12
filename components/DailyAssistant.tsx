
import React, { useEffect, useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { getDailyReminder } from '../services/geminiService';
import { Schedule } from '../types';

interface DailyAssistantProps {
  schedules: Schedule[];
}

const DailyAssistant: React.FC<DailyAssistantProps> = ({ schedules }) => {
  const [data, setData] = useState<{ message: string; suggestions: string[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReminder = async () => {
    setLoading(true);
    const result = await getDailyReminder(schedules);
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchReminder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-xl mb-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-500">
        <Sparkles size={120} />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Sparkles size={20} className="text-indigo-100" />
            </div>
            <h2 className="font-bold text-lg">Daily Companion</h2>
          </div>
          <button 
            onClick={fetchReminder}
            className={`p-1.5 hover:bg-white/10 rounded-full transition-colors ${loading ? 'animate-spin' : ''}`}
            disabled={loading}
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-white/20 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-white/20 rounded w-1/2 animate-pulse"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-indigo-50 text-lg leading-relaxed font-medium">
              {data?.message || "Preparing your daily focus..."}
            </p>
            {data?.suggestions && data.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.suggestions.map((suggestion, idx) => (
                  <span 
                    key={idx} 
                    className="bg-white/10 border border-white/20 px-3 py-1 rounded-full text-xs font-medium hover:bg-white/20 transition-colors cursor-default"
                  >
                    {suggestion}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyAssistant;
