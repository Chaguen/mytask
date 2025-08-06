import { differenceInDays, format, isToday, isTomorrow, isThisWeek, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { ko } from 'date-fns/locale';

export function formatDueDate(dueDate: string): string {
  const date = new Date(dueDate);
  const now = new Date();
  const daysDiff = differenceInDays(date, now);
  
  if (isToday(date)) {
    return '오늘';
  }
  
  if (isTomorrow(date)) {
    return '내일';
  }
  
  if (daysDiff === -1) {
    return '어제';
  }
  
  if (daysDiff < -1) {
    return `${Math.abs(daysDiff)}일 지남`;
  }
  
  if (daysDiff <= 7 && daysDiff > 0) {
    return format(date, 'EEEE', { locale: ko }); // 월요일, 화요일 등
  }
  
  if (date.getFullYear() === now.getFullYear()) {
    return format(date, 'M월 d일', { locale: ko });
  }
  
  return format(date, 'yyyy년 M월 d일', { locale: ko });
}

export function getDueDateColor(dueDate: string, completed: boolean): string {
  if (completed) {
    return 'text-muted-foreground';
  }
  
  const date = new Date(dueDate);
  const now = new Date();
  const daysDiff = differenceInDays(date, now);
  
  if (daysDiff < 0) {
    return 'text-red-500'; // Overdue
  }
  
  if (daysDiff === 0) {
    return 'text-orange-500'; // Due today
  }
  
  if (daysDiff === 1) {
    return 'text-yellow-500'; // Due tomorrow
  }
  
  return 'text-muted-foreground'; // Future
}

export function getQuickDates() {
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const thisWeekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Week starts on Monday
  const nextWeekEnd = endOfWeek(addDays(today, 7), { weekStartsOn: 1 });
  
  return {
    today: format(today, 'yyyy-MM-dd'),
    tomorrow: format(tomorrow, 'yyyy-MM-dd'),
    thisWeek: format(thisWeekEnd, 'yyyy-MM-dd'),
    nextWeek: format(nextWeekEnd, 'yyyy-MM-dd'),
  };
}

export function formatDateForInput(date: Date | string): string {
  if (typeof date === 'string') {
    return date.split('T')[0]; // Extract date part from ISO string
  }
  return format(date, 'yyyy-MM-dd');
}

export function isOverdue(dueDate: string): boolean {
  return differenceInDays(new Date(dueDate), new Date()) < 0;
}