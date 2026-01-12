
export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
}

export type Priority = 'low' | 'medium' | 'high';

export interface Schedule {
  id: string;
  title: string;
  description: string;
  notes?: string;
  date: string; // ISO string
  priority: Priority;
  checklist: ChecklistItem[];
  color: string;
  createdAt: number;
}

export interface AIResponse {
  message: string;
  suggestions: string[];
}
