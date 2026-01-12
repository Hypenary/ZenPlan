
import { GoogleGenAI, Type } from "@google/genai";
import { Schedule } from "../types";

// Safety check for API key to prevent crashes during initialization
const getApiKey = () => {
  try {
    return process.env.API_KEY || '';
  } catch (e) {
    return '';
  }
};

export const getDailyReminder = async (schedules: Schedule[]): Promise<{ message: string; suggestions: string[] }> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return {
      message: "Welcome back! Add your tasks for today to get personalized AI coaching.",
      suggestions: ["Set your first goal", "Stay productive"]
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  const today = new Date().toLocaleDateString();
  const todaySchedules = schedules.filter(s => new Date(s.date).toLocaleDateString() === today);
  
  const scheduleContext = todaySchedules.map(s => 
    `- [${s.priority.toUpperCase()}] ${s.title}: ${s.checklist.filter(c => c.isCompleted).length}/${s.checklist.length} tasks done`
  ).join('\n');

  const prompt = `
    Context: Today is ${today}. 
    User's Schedule for today (including priority):
    ${scheduleContext || "No tasks scheduled for today yet."}

    Instructions:
    Act as a productivity expert and strategist.
    1. Provide a concise, professional greeting that identifies the "High Priority" items as the primary focus.
    2. Suggest 2 specific "Strategic Advice" points based on the task mix (e.g., "Tackle the High Priority task first thing in the morning").

    Return the response in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: {
              type: Type.STRING,
              description: "A motivational greeting focusing on priorities.",
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Strategic actionable advice points.",
            },
          },
          required: ["message", "suggestions"],
        },
      },
    });

    const result = JSON.parse(response.text || '{"message": "Let\'s stay focused on your top priorities today.", "suggestions": ["Start with your most difficult task", "Break down large goals"]}');
    return result;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      message: "Ready to help you conquer the day! What's your top priority?",
      suggestions: ["Review your High priority tasks", "Focus on one item at a time"]
    };
  }
};
