import { DATE_FORMAT_OPTIONS, TIME_FORMAT_OPTIONS, DEFAULT_LOCALE } from '@/constants/todo';

export function formatDate(date: Date, locale: string = DEFAULT_LOCALE): string {
  return date.toLocaleDateString(locale, DATE_FORMAT_OPTIONS);
}

export function formatTime(date: Date, locale: string = DEFAULT_LOCALE): string {
  return date.toLocaleTimeString(locale, TIME_FORMAT_OPTIONS);
}

export function formatCompletionTime(completedAt: string): string {
  const completed = new Date(completedAt);
  const now = new Date();
  
  // Get dates without time for comparison
  const completedDate = new Date(completed.getFullYear(), completed.getMonth(), completed.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const diffTime = today.getTime() - completedDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Format time
  const hours = completed.getHours();
  const minutes = completed.getMinutes();
  const timeStr = `${hours === 0 ? '오전' : hours < 12 ? '오전' : '오후'} ${hours === 0 ? 12 : hours > 12 ? hours - 12 : hours}:${minutes.toString().padStart(2, '0')}`;
  
  // Today
  if (completedDate.getTime() === today.getTime()) {
    return `오늘 ${timeStr} 완료`;
  }
  
  // Yesterday
  if (completedDate.getTime() === yesterday.getTime()) {
    return '어제 완료';
  }
  
  // Within a week
  if (diffDays < 7) {
    return `${diffDays}일 전 완료`;
  }
  
  // More than a week ago
  const month = completed.getMonth() + 1;
  const date = completed.getDate();
  return `${month}/${date} 완료`;
}

export function getFullDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  const timeStr = `${hours === 0 ? '오전' : hours < 12 ? '오전' : '오후'} ${hours === 0 ? 12 : hours > 12 ? hours - 12 : hours}:${minutes.toString().padStart(2, '0')}`;
  
  return `${year}년 ${month}월 ${day}일 ${timeStr}`;
}