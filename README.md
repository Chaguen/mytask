# Todo List Application

A modern, feature-rich todo list application built with Next.js, TypeScript, and Tailwind CSS.

## Features

- ✅ Create, complete, and delete todos
- 📝 Multi-level subtasks (up to 5 levels deep)
- ⏰ Real-time clock display
- 💾 Local file-based storage (JSON)
- 🎨 Modern UI with shadcn/ui components
- 🌙 Dark mode support
- ⚡ GTD Next Actions - Automatically identifies actionable tasks
- 👁️ Show/Hide completed items toggle
- 📋 Copy todos with all subtasks
- 🛡️ Data validation with Zod
- 🔄 Auto-complete parent todos when all subtasks are done
- 📊 Todo statistics with next actions count
- 🗑️ Bulk delete completed todos
- ⌨️ Keyboard shortcuts support
- 🚨 Error boundaries for robust error handling
- 💪 Performance optimized with React.memo and debouncing

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Validation**: Zod
- **Icons**: Lucide React

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
│   └── todos/
│       └── route.ts      # API endpoints for todo operations
├── page.tsx              # Main page component
├── layout.tsx            # Root layout
└── globals.css           # Global styles

components/
├── todo/
│   ├── TodoList.tsx      # Main todo list container with stats
│   ├── TodoItem.tsx      # Memoized todo item component
│   └── TodoInput.tsx     # Reusable input component
├── CurrentTime.tsx       # Clock display component
├── ErrorBoundary.tsx     # Error handling component
└── ui/                   # shadcn/ui components

hooks/
├── useTodos.ts          # Main todo state management
├── useTodoAPI.ts        # API communication hook
├── useExpandedState.ts  # Expand/collapse state management
└── useTodoStyles.ts     # Styling and keyboard shortcuts

lib/
├── api-client.ts        # API client class
└── schemas.ts           # Zod validation schemas

utils/
├── todo-helpers.ts      # Todo CRUD operations
├── todo-tree-utils.ts   # Tree traversal utilities
└── date-helpers.ts      # Date formatting utilities

constants/
└── todo.ts              # Application constants

types/
├── todo.ts              # Base todo types
└── todo-tree.ts         # Tree-specific types
```

## Features in Detail

### Todo Management
- Add new todos with Enter key or button click
- Toggle completion status with checkbox
- Delete todos with trash icon
- Automatic parent todo completion when all subtasks are done
- Bulk delete all completed todos
- Real-time statistics display

### Multi-Level Subtasks
- Add subtasks to any todo item (up to 5 levels deep)
- Each subtask can have its own subtasks
- Expand/collapse subtask views at any level
- Progress tracking (e.g., "2/5 완료")
- Smart completion logic:
  - Completing a parent completes all children
  - Parent auto-completes when all children are done

### Keyboard Shortcuts
- `Enter` - Add new todo/subtask
- `Ctrl/Cmd + Enter` - Add subtask (when todo is focused)
- `Space` - Toggle expand/collapse (when not in input)
- `Delete` - Delete todo (when not in input)

### Data Persistence
- Todos are saved to `todos.json` in the project root
- Automatic backup creation before saves
- Data validation with Zod schemas
- Debounced saves (500ms) for performance
- Error recovery with backup files

### GTD Next Actions (⚡)
- Automatically identifies the next actionable task in each project
- Visual indicators:
  - ⚡ Yellow icon = This is a next action
  - Small ⚡ = This project contains next actions
- "Next Actions Only" filter mode
- Shows project path in filtered view
- Follows GTD methodology principles

### Additional Features
- **Copy Todos**: Duplicate any todo with all its subtasks
- **Show/Hide Completed**: Toggle visibility of completed items
- **Smart Filtering**: Combine filters for focused work sessions

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Configuration

Key configuration files:
- `constants/todo.ts` - Application constants
- `tailwind.config.ts` - Tailwind CSS configuration
- `components.json` - shadcn/ui configuration

## Data Format

Todos are stored in JSON format with recursive structure:
```json
[
  {
    "id": 1234567890,
    "text": "Main todo",
    "completed": false,
    "createdAt": "2025-01-24T12:00:00.000Z",
    "subtasks": [
      {
        "id": 1234567891,
        "text": "Subtask level 1",
        "completed": false,
        "createdAt": "2025-01-24T12:01:00.000Z",
        "subtasks": [
          {
            "id": 1234567892,
            "text": "Subtask level 2",
            "completed": true,
            "createdAt": "2025-01-24T12:02:00.000Z",
            "subtasks": []
          }
        ]
      }
    ]
  }
]
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.