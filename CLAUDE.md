# Claude Code Assistant Guide

This document provides important context for Claude Code Assistant when working on this Todo List application.

## Project Overview

This is a Next.js-based Todo List application with the following key features:
- Multi-level todo management (up to 5 levels deep)
- Real-time clock display with Korean locale
- Local JSON file storage with backup support
- Modern UI with shadcn/ui components
- Full TypeScript support with strict typing
- Performance optimized with React.memo and debouncing

## Architecture Decisions

### Component Structure
- Components are organized into logical folders (`/components/todo/` for todo-related components)
- Each component has a single responsibility
- Props are clearly typed with TypeScript interfaces

### State Management
- Using custom hooks for business logic separation
- `useTodos` hook manages all todo-related state and operations
- Debounced saves to prevent excessive file writes (500ms delay)
- Memoized statistics calculation for performance
- Separate hooks for styling (`useTodoStyles`) and expansion state (`useExpandedState`)

### Data Persistence
- Todos are stored in `todos.json` at the project root
- Automatic backup creation before each save (`todos.json.backup`)
- Zod validation ensures data integrity
- Recursive data structure supports unlimited nesting (UI limited to 5 levels)
- API routes handle file operations with proper error handling

## Code Style Guidelines

1. **TypeScript**: Use strict typing, avoid `any` types
2. **Components**: Prefer functional components with hooks
3. **Naming**: Use descriptive names for functions and variables
4. **Comments**: Minimal comments, code should be self-documenting
5. **Formatting**: Follow project's ESLint and Prettier configuration

## Important Commands

```bash
# Development
npm run dev

# Linting and Type Checking
npm run lint
npm run typecheck   # If available

# Building
npm run build
```

## Key Files and Their Purposes

- `/app/api/todos/route.ts` - API endpoints for todo CRUD operations
- `/hooks/useTodos.ts` - Main state management and business logic
- `/hooks/useTodoStyles.ts` - Styling logic and keyboard shortcuts
- `/utils/todo-helpers.ts` - Todo CRUD operations with validation
- `/utils/todo-tree-utils.ts` - Generic tree traversal and manipulation utilities
- `/lib/schemas.ts` - Zod schemas for data validation
- `/types/todo-tree.ts` - TypeScript types for tree operations
- `/constants/todo.ts` - Application-wide constants

## Common Tasks

### Adding a New Feature
1. Update types in `/types/todo.ts` or `/types/todo-tree.ts`
2. Add utility functions to `/utils/todo-helpers.ts` or `/utils/todo-tree-utils.ts`
3. Update the `useTodos` hook with new logic
4. Modify components as needed (TodoItem, TodoList)
5. Update Zod schemas if data structure changes
6. Consider performance implications (add memoization if needed)
7. Test with deep nesting scenarios

### Example: Todo Copy Feature (v1.1.0)
1. Added `copyTodoWithSubtasks` and `copyTodoInList` to `/utils/todo-helpers.ts`
2. Added `copyTodo` handler to `useTodos` hook
3. Added `onCopy` prop to TodoItem component
4. Added Copy button with lucide-react icon
5. Updated TodoList and TodoTree to pass copyTodo prop
6. Maintained unique IDs with timestamp + random number

### Modifying UI Components
- Check `/components/ui/` for existing shadcn/ui components
- Follow existing patterns for consistency
- Use Tailwind CSS classes for styling

### Performance Considerations
- Components are memoized where appropriate
- Saves are debounced (500ms delay)
- Use `useCallback` for event handlers passed as props

## Testing Approach

While no tests are currently implemented, when adding tests:
- Unit test utility functions in `/utils/`
- Integration test API routes
- Component testing for critical UI logic

## Known Limitations

1. Single-user application (no authentication)
2. File-based storage (not suitable for multi-user scenarios)
3. No real-time sync across browser tabs
4. UI limited to 5 levels of nesting (though data structure supports more)
5. No drag-and-drop reordering
6. No undo/redo functionality

## Future Enhancement Ideas

- Add drag-and-drop reordering
- Implement categories or tags
- Add due dates and reminders
- Export/import functionality (CSV, JSON)
- Search and filter capabilities
- Undo/redo functionality
- Real-time sync across tabs
- Virtual scrolling for large lists
- ~~Todo templates~~ ✓ Partially implemented with copy feature (v1.1.0)
- Recurring todos

## Troubleshooting

### Common Issues

1. **"Failed to load todos"** - Check if `todos.json` exists and has valid JSON
2. **Changes not saving** - Verify write permissions for project directory
3. **Type errors** - Run type checking to identify issues
4. **Maximum depth reached** - UI limits nesting to 5 levels
5. **Performance issues** - Check for extremely deep nesting or large number of todos
6. **Backup file conflicts** - Delete `todos.json.backup` if corrupted

### Debug Tips

- Check browser console for client-side errors
- Check terminal for server-side errors
- Verify `todos.json` content is valid JSON
- Check Network tab for API call failures

## Development Workflow

1. Always read existing code before making changes
2. Follow established patterns and conventions
3. Test changes thoroughly in development
4. Consider edge cases (empty states, large datasets)
5. Maintain backward compatibility with existing data

Remember: This is a personal productivity tool designed for simplicity and reliability. Keep solutions pragmatic and user-focused.