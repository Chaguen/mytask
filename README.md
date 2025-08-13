# Todo List Application

A modern, feature-rich todo list application built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Latest Updates (v2.0)

### New Features
- 📅 **Timebox View**: 24-hour timeline with 30-minute slots for time-blocking
- 🎯 **Focus Mode**: Star important tasks and filter to see only focused items
- 📆 **Calendar View**: Visualize todos with due dates in calendar format
- 🔄 **Recurring Tasks**: Set daily, weekly, or monthly recurring todos
- 📊 **Difficulty Levels**: Tag tasks as Easy/Normal/Hard with visual indicators
- ⏱️ **Timer System**: Built-in timer for tracking time spent on tasks
- 📈 **Timer Statistics**: View daily time tracking analytics
- 🎨 **Minimalist Header**: Redesigned compact toolbar with icon-only buttons
- 📱 **View Modes**: Switch between All/Today views instantly
- 🔔 **Smart Notifications**: Browser notifications for timer milestones

## Core Features

- ✅ Create, complete, and delete todos
- 📝 Multi-level subtasks (up to 5 levels deep)
- ⏰ Real-time clock display
- 💾 Local file-based storage (JSON)
- 🎨 Modern UI with shadcn/ui components
- 🌙 Dark mode support
- ⭐ Focus Tasks - Mark and filter important tasks
- 👁️ Show/Hide completed items toggle
- 📋 Copy todos with all subtasks
- 🛡️ Data validation with Zod
- 🔄 Auto-complete parent todos when all subtasks are done
- 📊 Todo statistics with real-time progress
- 🗑️ Bulk delete completed todos
- ⌨️ Keyboard shortcuts support
- 🚨 Error boundaries for robust error handling
- 💪 Performance optimized with React.memo and debouncing
- 🎉 Completion animations and celebrations
- 🔍 Drag & Drop reordering within same level
- 📐 Auto-cleanup of 3-day old completed tasks

## Tech Stack

- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Validation**: Zod
- **Icons**: Lucide React
- **Animation**: Framer Motion
- **Date Handling**: date-fns
- **Drag & Drop**: @dnd-kit

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd my-app
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
app/
├── api/
│   ├── todos/
│   │   └── route.ts      # Todo CRUD operations
│   └── timer/
│       └── route.ts      # Timer session management
├── page.tsx              # Main page with view routing
├── layout.tsx            # Root layout with providers
└── globals.css           # Global styles

components/
├── todo/
│   ├── TodoList.tsx      # Main list view
│   ├── TodoItem.tsx      # Individual todo with all controls
│   ├── TodoInput.tsx     # Input component
│   ├── TodoToolbar.tsx   # Minimalist header toolbar
│   ├── CalendarView.tsx  # Calendar visualization
│   ├── TimeboxView.tsx   # 24-hour timeline view
│   ├── SortableTodoItem.tsx # Drag-drop wrapper
│   └── EditableTodoText.tsx # Inline editing
├── timer/
│   ├── FloatingTimer.tsx # Active timer display
│   └── TimerSidebar.tsx  # Timer statistics panel
└── ui/                   # shadcn/ui components

contexts/
├── TodoContext.tsx       # Global todo state
└── TimerContext.tsx      # Timer state management

hooks/
├── useTodos.ts          # Main todo logic
├── useTodoAPI.ts        # API communication
├── useExpandedState.ts  # Expand/collapse state
├── useTodoStyles.ts     # Styling and shortcuts
└── useTimer.ts          # Timer functionality

utils/
├── todo-helpers.ts      # Todo CRUD operations
├── todo-tree-utils.ts   # Tree traversal utilities
├── date-helpers.ts      # Date formatting
├── date-utils.ts        # Due date handling
├── timer-utils.ts       # Timer formatting
├── recurring-utils.ts   # Recurring task logic
└── difficulty-utils.ts  # Difficulty helpers

types/
├── todo.ts              # Todo interfaces
├── todo-tree.ts         # Tree types
└── timer.ts             # Timer types
```

## Features in Detail

### 📅 Timebox View (NEW)
- 24-hour timeline divided into 30-minute slots
- Drag and drop todos into time blocks
- Visual current time indicator
- Auto-scroll to current time on load
- Compact design showing multiple tasks per slot

### 🔄 Recurring Tasks (NEW)
- Natural language input: "운동 매일", "회의 매주 월요일"
- Supported patterns:
  - Daily (매일)
  - Weekdays (평일)
  - Weekly on specific days (매주 X요일)
  - Monthly on specific date (매월 X일)
- Auto-generates next instance on completion

### 📊 Difficulty System (NEW)
- Three levels: Easy (쉬움), Normal (보통), Hard (어려움)
- Color-coded badges: Green, Yellow, Red
- Quick toggle with E/N/H/? button
- Applies to all todos including subtasks

### ⏱️ Timer Features (NEW)
- Start/stop timer for any task
- Floating timer window with minimize option
- Daily session tracking
- Time statistics sidebar
- Total time spent per task
- 25-minute milestone notifications

### 🎯 Focus Mode
- Star important tasks for priority
- Filter to show only focused tasks
- Automatic priority numbering (1-5)
- Visual indicators throughout the app
- Smart reordering on completion

### 📱 View Modes
- **All View**: See all todos
- **Today View**: Only today's tasks and recurring items
- Quick toggle in toolbar
- Persistent selection across sessions

### Todo Management
- Add new todos with Enter key
- Edit inline by clicking on text
- Toggle completion with checkbox
- Delete with trash icon
- Copy entire todo trees
- Due date picker with quick dates
- Auto-parent completion logic

### Multi-Level Subtasks
- Up to 5 levels of nesting
- Visual indentation for hierarchy
- Progress tracking (e.g., "2/5 완료")
- Expand/collapse at any level
- Drag to reorder within same level

### Keyboard Shortcuts
- `Enter` - Add new todo/save edit
- `Shift + Enter` - Add sibling todo
- `Tab` - Add subtask
- `Escape` - Cancel editing
- `Delete` - Delete todo
- Double-click - Edit todo text

### Data Persistence
- Local JSON file storage (`todos.json`, `timer-sessions.json`)
- Automatic backups before saves
- Debounced saves for performance
- Data validation with Zod
- Auto-cleanup of old completed tasks

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run typecheck # Run TypeScript checks
```

## Configuration

Key files:
- `constants/todo.ts` - Application constants
- `CLAUDE.md` - AI assistant context
- `tailwind.config.ts` - Tailwind configuration
- `components.json` - shadcn/ui settings

## Data Format

### Todo Structure
```json
{
  "id": 1234567890,
  "text": "Main todo",
  "completed": false,
  "createdAt": "2025-01-24T12:00:00.000Z",
  "completedAt": null,
  "dueDate": "2025-01-25",
  "focusPriority": 1,
  "difficulty": "normal",
  "recurringPattern": {
    "type": "daily",
    "interval": 1,
    "nextDueDate": "2025-01-26"
  },
  "subtasks": []
}
```

### Timer Session Structure
```json
{
  "id": "session-123",
  "todoId": 1234567890,
  "todoText": "Task name",
  "startTime": "2025-01-24T10:00:00.000Z",
  "endTime": "2025-01-24T10:25:00.000Z",
  "duration": 1500000,
  "date": "2025-01-24"
}
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Requires JavaScript enabled
- Local storage access required

## Performance

- Memoized components prevent unnecessary re-renders
- Debounced saves (500ms) reduce file I/O
- Virtual scrolling for large todo lists
- Optimistic UI updates for instant feedback
- Lazy loading of heavy components

## Known Limitations

- Single-user local application
- No cloud sync or multi-device support
- Maximum 5 levels of nesting
- File-based storage (not suitable for thousands of todos)
- No mobile app (web-only)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Animations by [Framer Motion](https://www.framer.com/motion/)