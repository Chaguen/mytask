# Changelog

All notable changes to this project will be documented in this file.

## [1.3.0] - 2025-08-05

### Added
- **Focus Tasks Feature (집중할 작업)**: Manual priority management system
  - Select up to 5 tasks as focus priorities across any hierarchy level
  - Star button (⭐) to toggle focus status
  - Numbered badges (1-5) show priority order
  - "집중할 작업" filter mode to show only focus tasks
  - Automatic priority reordering when tasks are completed
  - Path display for nested tasks in focus mode
  - Yellow star indicator for active focus tasks
  - localStorage persistence for filter state

- **Completion Time Tracking**: Records and displays when todos are completed
  - Shows completion time below todo text when checked
  - User-friendly relative time format:
    - "오늘 오후 3:45 완료" for today
    - "어제 완료" for yesterday
    - "3일 전 완료" for recent days
    - "12/25 완료" for older dates
  - Hover tooltip shows exact date and time
  - Small check icon accompanies the completion time
  - Automatically tracks completion time for all subtasks
  - Parent todos show completion time when all subtasks are done

- **Drag & Drop Reordering**: Intuitive task reordering
  - Drag handle appears on hover (grip icon)
  - Visual feedback during drag (opacity change)
  - Reorder tasks within the same level only
  - Maintains hierarchical structure
  - Smooth animations and transitions
  - Keyboard accessible with sortable keyboard shortcuts

### Technical Implementation
- Added `completedAt` field to Todo interface
- Updated Zod schema with optional completedAt field
- Enhanced `toggleTodoCompletion` to record timestamps
- New date formatting utilities:
  - `formatCompletionTime`: Relative time formatting
  - `getFullDateTime`: Full date/time for tooltips
- Updated `updateParentCompletion` to handle completion times
- Integrated @dnd-kit for drag and drop:
  - `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
  - Created `SortableTodoItem` wrapper component
  - Added `reorderTodos` utility function
  - Enhanced `TodoList` with DndContext

### UI/UX Improvements
- Subtle gray text for completion times
- Minimal space usage with compact design
- Consistent with existing visual hierarchy
- No impact on uncompleted todos
- Drag handle with grab cursor on hover
- Smooth drag animations

## [1.2.0] - 2025-01-02

### Added
- **GTD Next Actions Feature**: Core GTD methodology implementation
  - Automatic identification of next actionable tasks
  - Visual indicators with ⚡ lightning icons
  - "Next Actions Only" filter mode
  - Project path display in filtered view
  - Next actions count in statistics
  - Smart calculation of next actions at all nesting levels
  - localStorage persistence for filter state

- **Show/Hide Completed Items**: Toggle visibility of completed tasks
  - Eye/EyeOff icons for intuitive toggling
  - Preserves state across sessions
  - Shows count of hidden items
  - Helpful empty state messages

### Technical Implementation
- New utility functions:
  - `getAllNextActions`: Finds all next actions in the tree
  - `isNextAction`: Checks if a todo is a next action
  - `getProjectPath`: Gets the full path to a todo
- Enhanced `useTodos` hook with filter states
- Improved visual hierarchy with conditional styling
- Performance optimized with memoized calculations

### UI/UX Improvements
- Yellow highlighting for next actions
- Contextual project paths in filtered views
- Smart empty states with actionable messages
- Improved button layout in header

## [1.1.0] - 2025-01-02

### Added
- **Todo Copy Feature**: New copy button for each todo item
  - Copies the todo and all its subtasks recursively
  - All copied items are set to unchecked state
  - Copied todo is inserted immediately after the original
  - Works at all nesting levels
  - Copy button placed between Add and Delete buttons
  - Uses lucide-react Copy icon for consistency

### Changed
- Updated TodoItem component to include copy functionality
- Enhanced useTodos hook with copyTodo handler
- Added copyTodoWithSubtasks and copyTodoInList utility functions

### Technical Details
- New functions in `/utils/todo-helpers.ts`:
  - `copyTodoWithSubtasks`: Recursively copies a todo and its subtasks
  - `copyTodoInList`: Handles insertion logic for copied todos
- Updated components:
  - TodoItem: Added Copy button with onClick handler
  - TodoList: Passes copyTodo prop to TodoItem
  - TodoTree: Supports copyTodo prop propagation
- Maintains unique IDs using timestamp + random number

## [1.0.0] - 2025-01-24

### Added
- Initial release of Todo List application
- Multi-level subtask support (up to 5 levels deep)
- Real-time clock display with Korean locale
- Local JSON file storage with automatic backups
- Modern UI with shadcn/ui components
- Dark mode support via next-themes
- Keyboard shortcuts for common actions
- Todo statistics display (completed/total)
- Bulk delete for completed todos
- Error boundary for robust error handling
- Debounced saves for performance (500ms delay)
- Data validation with Zod schemas
- Memoized components for optimal performance
- Auto-complete parent todos when all subtasks complete
- Expand/collapse functionality for subtasks
- Progress tracking for todos with subtasks

### Technical Features
- Full TypeScript support with strict typing
- Tree data structure with path-based navigation
- Generic tree traversal utilities
- Custom hooks for separation of concerns
- React.memo with custom comparison functions
- Accessible UI with ARIA labels
- Responsive design with Tailwind CSS

### Architecture
- Next.js 14+ with App Router
- Client-side state management with custom hooks
- File-based persistence with JSON storage
- RESTful API routes for data operations
- Component-based architecture
- Utility functions for data manipulation

### Dependencies
- Next.js (latest)
- React 19
- TypeScript 5
- Tailwind CSS 3.4
- shadcn/ui components
- Zod for validation
- Lucide React for icons
- next-themes for dark mode

### Known Limitations
- Single-user application (no authentication)
- File-based storage (not suitable for multi-user)
- No real-time sync across browser tabs
- No drag-and-drop reordering

### Development Notes
- Removed all Supabase dependencies
- Cleaned up authentication-related code
- Simplified project structure
- Added comprehensive documentation
- Implemented robust error handling
- Optimized for performance