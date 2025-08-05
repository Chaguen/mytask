export const TODO_STORAGE_FILE = 'todos.json';
export const DEFAULT_LOCALE = 'ko-KR';

export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
};

export const TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
};

export const DEBOUNCE_DELAY = 500;

// Todo nesting constraints
export const MAX_NESTING_DEPTH = 5;
export const MAX_SUBTASKS_PER_TODO = 100;

// UI constants for nesting levels
export const NESTING_INDENT_CLASSES = [
  '',       // level 0
  'ml-8',   // level 1
  'ml-16',  // level 2
  'ml-24',  // level 3
  'ml-32',  // level 4+
] as const;

export const NESTING_TEXT_SIZES = {
  0: '',
  1: 'text-sm',
  2: 'text-sm',
  3: 'text-xs',
  4: 'text-xs',
} as const;