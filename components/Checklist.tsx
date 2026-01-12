
import React, { useState } from 'react';
import { ChecklistItem } from '../types';
import { Plus, Trash2, CheckCircle, Circle } from 'lucide-react';

interface ChecklistProps {
  items: ChecklistItem[];
  onToggle: (id: string) => void;
  onAdd: (text: string) => void;
  onRemove: (id: string) => void;
}

const Checklist: React.FC<ChecklistProps> = ({ items, onToggle, onAdd, onRemove }) => {
  const [newItemText, setNewItemText] = useState('');

  const handleAdd = () => {
    if (newItemText.trim()) {
      onAdd(newItemText.trim());
      setNewItemText('');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add an item..."
          className="flex-1 text-sm border-b border-gray-200 focus:border-indigo-500 outline-none py-1 bg-transparent text-slate-800"
        />
        <button
          onClick={handleAdd}
          className="p-1 hover:bg-indigo-50 text-indigo-600 rounded-full transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1">
        {items.map((item) => (
          <div key={item.id} className="flex items-center group gap-2 py-1">
            <button
              onClick={() => onToggle(item.id)}
              className={`transition-colors ${item.isCompleted ? 'text-green-500' : 'text-gray-300 hover:text-indigo-400'}`}
            >
              {item.isCompleted ? <CheckCircle size={18} /> : <Circle size={18} />}
            </button>
            <span className={`flex-1 text-sm ${item.isCompleted ? 'line-through text-gray-400' : 'text-gray-700'}`}>
              {item.text}
            </span>
            <button
              onClick={() => onRemove(item.id)}
              className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-gray-400 italic">No checklist items yet.</p>
        )}
      </div>
    </div>
  );
};

export default Checklist;
