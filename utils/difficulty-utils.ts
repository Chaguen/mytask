import { Difficulty } from '@/types/todo';

export function getDifficultyColor(difficulty?: Difficulty): string {
  switch (difficulty) {
    case 'easy':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'normal':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'hard':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return '';
  }
}

export function getDifficultyBadgeColor(difficulty?: Difficulty): string {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-500 text-white';
    case 'normal':
      return 'bg-yellow-500 text-white';
    case 'hard':
      return 'bg-red-500 text-white';
    default:
      return '';
  }
}

export function getDifficultyLabel(difficulty?: Difficulty): string {
  switch (difficulty) {
    case 'easy':
      return '쉬움';
    case 'normal':
      return '보통';
    case 'hard':
      return '어려움';
    default:
      return '';
  }
}

export function getDifficultyEmoji(difficulty?: Difficulty): string {
  switch (difficulty) {
    case 'easy':
      return '🟢';
    case 'normal':
      return '🟡';
    case 'hard':
      return '🔴';
    default:
      return '';
  }
}

export function getNextDifficulty(current?: Difficulty): Difficulty | undefined {
  switch (current) {
    case undefined:
      return 'easy';
    case 'easy':
      return 'normal';
    case 'normal':
      return 'hard';
    case 'hard':
      return undefined;
  }
}

export function shouldSuggestSubtasks(difficulty?: Difficulty, subtaskCount: number = 0): boolean {
  if (!difficulty) return false;
  
  if (difficulty === 'hard' && subtaskCount < 3) {
    return true;
  }
  
  if (difficulty === 'normal' && subtaskCount < 1) {
    return true;
  }
  
  return false;
}

export function getSubtaskSuggestion(difficulty?: Difficulty, subtaskCount: number = 0): string | null {
  if (!difficulty) return null;
  
  if (difficulty === 'hard') {
    if (subtaskCount === 0) {
      return '💡 어려운 작업입니다! 3개 이상의 작은 단계로 나눠보세요.';
    } else if (subtaskCount < 3) {
      return '💡 조금 더 세분화하면 시작하기 쉬워집니다.';
    }
  }
  
  if (difficulty === 'normal' && subtaskCount === 0) {
    return '💡 1-2개의 하위 작업으로 나누면 더 쉽게 완료할 수 있어요.';
  }
  
  if (difficulty === 'easy' && subtaskCount > 3) {
    return '💡 하위 작업이 많네요. 난이도를 보통으로 조정해보세요.';
  }
  
  return null;
}