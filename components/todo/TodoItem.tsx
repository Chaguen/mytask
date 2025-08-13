"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, ChevronRight, Copy, Check, Star, Calendar, Timer, Pause, RefreshCw } from "lucide-react";
import { Todo, RecurringPattern, Difficulty } from "@/types/todo";
import { TodoPath } from "@/types/todo-tree";
import { getRecurringDisplayText } from "@/utils/recurring-utils";
import { EditableTodoText } from "./EditableTodoText";
import { useTodoStyles, useTodoKeyboardShortcuts } from "@/hooks/useTodoStyles";
import { formatCompletionTime, getFullDateTime } from "@/utils/date-helpers";
import { formatDueDate, getDueDateColor, getQuickDates, formatDateForInput } from "@/utils/date-utils";
import { formatDuration } from "@/utils/timer-utils";
import { getNextDifficulty } from "@/utils/difficulty-utils";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays, addWeeks, addMonths } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TodoItemProps {
  todo: Todo;
  level?: number;
  parentIds?: TodoPath;
  parentTodo?: Todo;
  isExpanded?: boolean;
  isInFocusMode?: boolean;
  projectPath?: string[];
  showProjectPath?: boolean;
  showFocusPath?: boolean;
  activeTimerId?: number;
  onToggle: (id: number, parentIds?: TodoPath) => void;
  onDelete: (id: number, parentIds?: TodoPath) => void;
  onCopy: (id: number, parentIds?: TodoPath) => void;
  onToggleFocus?: (id: number, parentIds?: TodoPath) => void;
  onExpand?: (id: number) => void;
  onAddSubtask?: () => void;
  onAddSibling?: (id: number, parentIds?: TodoPath) => void;
  onUpdateText: (id: number, text: string, parentIds?: TodoPath) => void;
  onSetEditing: (id: number, isEditing: boolean, parentIds?: TodoPath) => void;
  onUpdateDueDate?: (id: number, dueDate: string | undefined, parentIds?: TodoPath) => void;
  onUpdateRecurring?: (id: number, pattern: RecurringPattern | undefined, parentIds?: TodoPath) => void;
  onUpdateDifficulty?: (id: number, difficulty: Difficulty | undefined, parentIds?: TodoPath) => void;
  onToggleTimer?: (id: number, text: string, parentIds?: TodoPath) => void;
  todoTimeSpent?: number;
  renderSubtask?: (parentTodo: Todo, parentIds: TodoPath) => React.ReactNode;
}

function TodoItemComponent({
  todo,
  level = 0,
  parentIds = [],
  isExpanded = false,
  isInFocusMode = false,
  projectPath,
  showProjectPath = false,
  showFocusPath = false,
  activeTimerId,
  onToggle,
  onDelete,
  onCopy,
  onToggleFocus,
  onExpand,
  onAddSubtask,
  onAddSibling,
  onUpdateText,
  onSetEditing,
  onUpdateDueDate,
  onUpdateRecurring,
  onUpdateDifficulty,
  onToggleTimer,
  todoTimeSpent = 0,
  renderSubtask,
}: TodoItemProps) {
  // All hooks must be called unconditionally at the top
  const [showCelebration, setShowCelebration] = useState(false);
  const [isChecked, setIsChecked] = useState(todo.completed);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(todo.dueDate || '');
  const [recurringPickerOpen, setRecurringPickerOpen] = useState(false);
  
  // Computed values after hooks
  const hasSubtasks = todo.subtasks && todo.subtasks.length > 0;
  const completedSubtasks = todo.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = todo.subtasks?.length || 0;

  const styles = useTodoStyles({
    level,
    isCompleted: todo.completed,
    hasSubtasks: !!hasSubtasks,
    isExpanded,
  });

  const { handleKeyDown } = useTodoKeyboardShortcuts({
    onAddTodo: onAddSubtask,
    onToggleExpand: onExpand ? () => onExpand(todo.id) : undefined,
    onDelete: () => onDelete(todo.id, parentIds),
  });

  const handleExpandClick = () => {
    if (onExpand) {
      onExpand(todo.id);
    }
  };

  const handleAddClick = () => {
    if (onAddSubtask) {
      onAddSubtask();
    }
  };

  useEffect(() => {
    setIsChecked(todo.completed);
  }, [todo.completed]);

  const handleCheckboxChange = () => {
    const newCheckedState = !isChecked;
    setIsChecked(newCheckedState);
    
    if (newCheckedState && !hasSubtasks) {
      // Show celebration for tasks without subtasks
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 1500);
    }
    
    onToggle(todo.id, parentIds);
  };

  // Determine focus mode styling
  const getFocusModeStyle = () => {
    if (!isInFocusMode) return '';
    if (todo.focusPriority !== undefined) {
      // Directly selected for focus (darker background)
      return 'bg-yellow-50 dark:bg-yellow-950/30 border-l-4 border-yellow-400';
    }
    // Auto-included subtask (lighter background)
    return 'bg-yellow-50/50 dark:bg-yellow-950/15';
  };

  return (
    <motion.div 
      className={`${styles.container.className} ${getFocusModeStyle()}`} 
      onKeyDown={handleKeyDown}
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
    >
      {showProjectPath && projectPath && projectPath.length > 1 && (
        <div className="text-[10px] text-muted-foreground/70 ml-8 -mt-1 mb-0.5">
          {projectPath.slice(0, -1).join(' › ')}
        </div>
      )}
      <motion.div 
        className={styles.todoItem.className}
        animate={{
          scale: showCelebration ? [1, 1.05, 1] : 1,
          backgroundColor: showCelebration ? ["transparent", "rgba(34, 197, 94, 0.1)", "transparent"] : "transparent"
        }}
        transition={{ duration: 0.5 }}
      >
        {styles.showExpandButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExpandClick}
            className="h-6 w-6"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            <ChevronRight className={`h-4 w-4 ${styles.expandIcon.className}`} />
          </Button>
        )}
        {styles.showPlaceholder && <div className="w-6" />}
        
        <Checkbox
          checked={isChecked}
          onCheckedChange={handleCheckboxChange}
          aria-label={`Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`}
          className="transition-colors duration-200"
        />
        
        {todo.focusPriority && (
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold ml-2">
            {todo.focusPriority}
          </span>
        )}
        
        
        <motion.div 
          className={styles.text.className}
          animate={{
            opacity: isChecked ? 0.5 : 1,
            x: isChecked ? 5 : 0
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <EditableTodoText
                text={todo.text}
                isEditing={todo.isEditing || false}
                isCompleted={isChecked}
                onTextChange={(newText) => onUpdateText(todo.id, newText, parentIds)}
                onEditStart={() => onSetEditing(todo.id, true, parentIds)}
                onEditEnd={() => onSetEditing(todo.id, false, parentIds)}
                onAddSibling={onAddSibling ? () => onAddSibling(todo.id, parentIds) : undefined}
              />
            </div>
            {todo.difficulty && !todo.completed && (
              <div className="flex items-center gap-1 ml-6 mt-0.5">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap ${
                  todo.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                  todo.difficulty === 'normal' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {todo.difficulty === 'easy' ? '쉬움' :
                   todo.difficulty === 'normal' ? '보통' :
                   '어려움'}
                </span>
              </div>
            )}
            {todo.completed && todo.completedAt && (
              <div className="flex items-center gap-1 ml-6 mt-1">
                <Check className="h-3 w-3 text-muted-foreground" />
                <span 
                  className="text-xs text-muted-foreground"
                  title={getFullDateTime(todo.completedAt)}
                >
                  {formatCompletionTime(todo.completedAt)}
                </span>
              </div>
            )}
          </div>
          {hasSubtasks && (
            <span className="text-xs text-muted-foreground ml-2">
              ({completedSubtasks}/{totalSubtasks} 완료)
            </span>
          )}
        </motion.div>
        
        {todo.dueDate && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${getDueDateColor(todo.dueDate, todo.completed)}`}>
            {formatDueDate(todo.dueDate)}
          </span>
        )}
        
        {todo.isRecurring && todo.recurringPattern && (
          <span 
            className="flex items-center gap-1 text-xs text-blue-600"
            title={getRecurringDisplayText(todo.recurringPattern)}
          >
            <RefreshCw className="h-3 w-3" />
            {getRecurringDisplayText(todo.recurringPattern)}
          </span>
        )}
        
        {todoTimeSpent > 0 && (
          <span className="text-xs text-muted-foreground">
            {formatDuration(todoTimeSpent)}
          </span>
        )}
        
        {onToggleTimer && !todo.completed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleTimer(todo.id, todo.text, parentIds)}
            className={`h-8 w-8 ${activeTimerId === todo.id ? 'text-red-500' : ''}`}
            aria-label={activeTimerId === todo.id ? 'Stop timer' : 'Start timer'}
          >
            {activeTimerId === todo.id ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Timer className="h-4 w-4" />
            )}
          </Button>
        )}
        
        {!todo.completed && onUpdateDifficulty && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const nextDiff = getNextDifficulty(todo.difficulty);
              onUpdateDifficulty(todo.id, nextDiff, parentIds);
            }}
            className="h-8 w-8"
            aria-label="Set difficulty"
            title="난이도 설정 (클릭하여 변경)"
          >
            <span className={`text-sm font-bold ${
              todo.difficulty === 'easy' ? 'text-green-600' :
              todo.difficulty === 'normal' ? 'text-yellow-600' :
              todo.difficulty === 'hard' ? 'text-red-600' :
              'text-gray-400'
            }`}>
              {todo.difficulty === 'easy' ? 'E' :
               todo.difficulty === 'normal' ? 'N' :
               todo.difficulty === 'hard' ? 'H' :
               '?'}
            </span>
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleAddClick}
          className="h-8 w-8"
          aria-label="Add subtask"
        >
          <Plus className="h-4 w-4" />
        </Button>
        
        {onUpdateDueDate && (
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${todo.dueDate ? 'text-primary' : ''}`}
                aria-label="Set due date"
              >
                <Calendar className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="end">
              <div className="space-y-2">
                <div className="text-sm font-medium">마감일 설정</div>
                <div className="flex flex-col gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const dates = getQuickDates();
                      onUpdateDueDate(todo.id, dates.today, parentIds);
                      setDatePickerOpen(false);
                    }}
                    className="justify-start"
                  >
                    오늘
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const dates = getQuickDates();
                      onUpdateDueDate(todo.id, dates.tomorrow, parentIds);
                      setDatePickerOpen(false);
                    }}
                    className="justify-start"
                  >
                    내일
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const dates = getQuickDates();
                      onUpdateDueDate(todo.id, dates.thisWeek, parentIds);
                      setDatePickerOpen(false);
                    }}
                    className="justify-start"
                  >
                    이번 주말
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const dates = getQuickDates();
                      onUpdateDueDate(todo.id, dates.nextWeek, parentIds);
                      setDatePickerOpen(false);
                    }}
                    className="justify-start"
                  >
                    다음 주말
                  </Button>
                </div>
                <div className="flex gap-1">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      if (e.target.value) {
                        onUpdateDueDate(todo.id, e.target.value, parentIds);
                        setDatePickerOpen(false);
                      }
                    }}
                    className="flex-1 px-2 py-1 text-sm border rounded"
                  />
                  {todo.dueDate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onUpdateDueDate(todo.id, undefined, parentIds);
                        setSelectedDate('');
                        setDatePickerOpen(false);
                      }}
                      className="px-2"
                    >
                      삭제
                    </Button>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
        
        {onUpdateRecurring && (
          <Popover open={recurringPickerOpen} onOpenChange={setRecurringPickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${todo.isRecurring ? 'text-blue-600' : ''}`}
                aria-label="Set recurring"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="end">
              <div className="space-y-2">
                <div className="text-sm font-medium">반복 설정</div>
                <div className="flex flex-col gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const pattern: RecurringPattern = {
                        type: 'daily',
                        interval: 1,
                        nextDueDate: todo.dueDate || format(addDays(new Date(), 1), 'yyyy-MM-dd'),
                      };
                      onUpdateRecurring(todo.id, pattern, parentIds);
                      setRecurringPickerOpen(false);
                    }}
                    className="justify-start"
                  >
                    매일
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const pattern: RecurringPattern = {
                        type: 'weekdays',
                        daysOfWeek: [1, 2, 3, 4, 5],
                        nextDueDate: todo.dueDate || format(addDays(new Date(), 1), 'yyyy-MM-dd'),
                      };
                      onUpdateRecurring(todo.id, pattern, parentIds);
                      setRecurringPickerOpen(false);
                    }}
                    className="justify-start"
                  >
                    평일 (월-금)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date();
                      const dayOfWeek = today.getDay();
                      const pattern: RecurringPattern = {
                        type: 'weekly',
                        daysOfWeek: [dayOfWeek],
                        interval: 1,
                        nextDueDate: todo.dueDate || format(addWeeks(today, 1), 'yyyy-MM-dd'),
                      };
                      onUpdateRecurring(todo.id, pattern, parentIds);
                      setRecurringPickerOpen(false);
                    }}
                    className="justify-start"
                  >
                    매주 {['일', '월', '화', '수', '목', '금', '토'][new Date().getDay()]}요일
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date();
                      const pattern: RecurringPattern = {
                        type: 'monthly',
                        dayOfMonth: today.getDate(),
                        interval: 1,
                        nextDueDate: todo.dueDate || format(addMonths(today, 1), 'yyyy-MM-dd'),
                      };
                      onUpdateRecurring(todo.id, pattern, parentIds);
                      setRecurringPickerOpen(false);
                    }}
                    className="justify-start"
                  >
                    매월 {new Date().getDate()}일
                  </Button>
                  {todo.isRecurring && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onUpdateRecurring(todo.id, undefined, parentIds);
                        setRecurringPickerOpen(false);
                      }}
                      className="text-red-600 justify-start"
                    >
                      반복 해제
                    </Button>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
        
        {onToggleFocus && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleFocus(todo.id, parentIds)}
            className={`h-8 w-8 ${todo.focusPriority ? 'text-yellow-500' : ''}`}
            aria-label={todo.focusPriority ? `Remove from focus (priority ${todo.focusPriority})` : 'Add to focus tasks'}
          >
            <Star className={`h-4 w-4 ${todo.focusPriority ? 'fill-yellow-500' : ''}`} />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onCopy(todo.id, parentIds)}
          className="h-8 w-8"
          aria-label={`Copy "${todo.text}"`}
        >
          <Copy className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(todo.id, parentIds)}
          className="h-8 w-8"
          aria-label={`Delete "${todo.text}"`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </motion.div>
      
      
      <AnimatePresence>
        {isExpanded && renderSubtask && todo.subtasks && todo.subtasks.length > 0 && (
          <motion.div 
            className="ml-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderSubtask(todo, [...parentIds, todo.id])}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Memoized component with custom comparison
export const TodoItem = React.memo(TodoItemComponent);