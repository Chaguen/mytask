import { RecurringPattern, RecurringType, Todo } from '@/types/todo';
import { addDays, addWeeks, addMonths, startOfDay, isWeekend, format, getDay } from 'date-fns';
import { ko } from 'date-fns/locale';

export function parseRecurringText(text: string): { cleanText: string; pattern: RecurringPattern | null } {
  const lowerText = text.toLowerCase();
  
  // Remove recurring pattern from text
  const patterns = [
    { regex: /\s*매일\s*$/i, type: 'daily' as RecurringType },
    { regex: /\s*평일\s*$/i, type: 'weekdays' as RecurringType },
    { regex: /\s*매주\s*(월|화|수|목|금|토|일)요일\s*$/i, type: 'weekly' as RecurringType },
    { regex: /\s*매월\s*(\d{1,2})일\s*$/i, type: 'monthly' as RecurringType },
    { regex: /\s*(\d+)일마다\s*$/i, type: 'custom' as RecurringType },
  ];

  for (const { regex, type } of patterns) {
    const match = lowerText.match(regex);
    if (match) {
      const cleanText = text.replace(regex, '').trim();
      
      if (type === 'daily') {
        return {
          cleanText,
          pattern: {
            type: 'daily',
            interval: 1,
            nextDueDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
          },
        };
      }
      
      if (type === 'weekdays') {
        return {
          cleanText,
          pattern: {
            type: 'weekdays',
            daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
            nextDueDate: getNextWeekday(),
          },
        };
      }
      
      if (type === 'weekly') {
        const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
        const dayMatch = match[1];
        const dayIndex = dayNames.indexOf(dayMatch);
        
        if (dayIndex !== -1) {
          return {
            cleanText,
            pattern: {
              type: 'weekly',
              daysOfWeek: [dayIndex],
              interval: 1,
              nextDueDate: getNextWeekday(dayIndex),
            },
          };
        }
      }
      
      if (type === 'monthly') {
        const day = parseInt(match[1]);
        return {
          cleanText,
          pattern: {
            type: 'monthly',
            dayOfMonth: day,
            interval: 1,
            nextDueDate: getNextMonthDay(day),
          },
        };
      }
      
      if (type === 'custom') {
        const interval = parseInt(match[1]);
        return {
          cleanText,
          pattern: {
            type: 'custom',
            interval,
            nextDueDate: format(addDays(new Date(), interval), 'yyyy-MM-dd'),
          },
        };
      }
    }
  }
  
  return { cleanText: text, pattern: null };
}

function getNextWeekday(targetDay?: number): string {
  let date = addDays(new Date(), 1);
  
  if (targetDay !== undefined) {
    // Find next occurrence of specific day
    while (getDay(date) !== targetDay) {
      date = addDays(date, 1);
    }
  } else {
    // Find next weekday (Mon-Fri)
    while (isWeekend(date)) {
      date = addDays(date, 1);
    }
  }
  
  return format(date, 'yyyy-MM-dd');
}

function getNextMonthDay(day: number): string {
  const today = new Date();
  let targetDate = new Date(today.getFullYear(), today.getMonth(), day);
  
  // If the day has passed this month, go to next month
  if (targetDate <= today) {
    targetDate = addMonths(targetDate, 1);
  }
  
  // Handle months with fewer days (e.g., Feb 30 -> Feb 28)
  const lastDay = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();
  if (day > lastDay) {
    targetDate.setDate(lastDay);
  }
  
  return format(targetDate, 'yyyy-MM-dd');
}

export function generateNextRecurrence(pattern: RecurringPattern, completedDate: Date = new Date()): string {
  const baseDate = startOfDay(completedDate);
  
  switch (pattern.type) {
    case 'daily':
      return format(addDays(baseDate, pattern.interval || 1), 'yyyy-MM-dd');
    
    case 'weekdays': {
      let nextDate = addDays(baseDate, 1);
      while (isWeekend(nextDate)) {
        nextDate = addDays(nextDate, 1);
      }
      return format(nextDate, 'yyyy-MM-dd');
    }
    
    case 'weekly': {
      const targetDays = pattern.daysOfWeek || [];
      let nextDate = addDays(baseDate, 1);
      let daysChecked = 0;
      
      while (daysChecked < 7) {
        if (targetDays.includes(getDay(nextDate))) {
          return format(nextDate, 'yyyy-MM-dd');
        }
        nextDate = addDays(nextDate, 1);
        daysChecked++;
      }
      
      // If no day found in next 7 days, add weeks
      return format(addWeeks(baseDate, pattern.interval || 1), 'yyyy-MM-dd');
    }
    
    case 'monthly': {
      const nextMonth = addMonths(baseDate, pattern.interval || 1);
      const targetDay = pattern.dayOfMonth || 1;
      const lastDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate();
      const actualDay = Math.min(targetDay, lastDay);
      
      return format(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), actualDay), 'yyyy-MM-dd');
    }
    
    case 'custom':
      return format(addDays(baseDate, pattern.interval || 1), 'yyyy-MM-dd');
    
    default:
      return format(addDays(baseDate, 1), 'yyyy-MM-dd');
  }
}

export function createRecurringInstance(originalTodo: Todo, nextDueDate: string): Todo {
  return {
    ...originalTodo,
    id: Date.now() + Math.random(),
    completed: false,
    completedAt: undefined,
    createdAt: new Date().toISOString(),
    dueDate: nextDueDate,
    parentRecurringId: originalTodo.parentRecurringId || originalTodo.id,
    subtasks: [], // Don't copy subtasks for recurring instances
    timeSpent: 0,
    isTimerRunning: false,
    timerStartedAt: undefined,
  };
}

export function shouldShowInTodayView(todo: Todo, viewMode: 'all' | 'today'): boolean {
  if (viewMode === 'all') return true;
  
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Show if no due date (inbox items)
  if (!todo.dueDate) return true;
  
  // Show if due today or overdue
  return todo.dueDate <= today;
}

export function getRecurringDisplayText(pattern: RecurringPattern): string {
  switch (pattern.type) {
    case 'daily':
      return '매일';
    case 'weekdays':
      return '평일';
    case 'weekly': {
      const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
      const days = pattern.daysOfWeek?.map(d => dayNames[d]).join(', ');
      return `매주 ${days}요일`;
    }
    case 'monthly':
      return `매월 ${pattern.dayOfMonth}일`;
    case 'custom':
      return `${pattern.interval}일마다`;
    default:
      return '';
  }
}