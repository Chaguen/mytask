# Architecture Documentation

## Overview

This Todo List application follows a modern React/Next.js architecture with clear separation of concerns and a focus on maintainability and performance.

## Core Architecture Principles

### 1. **Separation of Concerns**
- **Components**: Pure UI components focused on presentation
- **Hooks**: Business logic and state management
- **Utils**: Pure functions for data manipulation
- **Types**: Centralized type definitions

### 2. **Tree Data Structure**
The application uses a recursive tree structure for todos:
```typescript
interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
  subtasks?: Todo[];
}
```

### 3. **Path-Based Navigation**
Uses `TodoPath` (number[]) to navigate the tree structure:
- `[1]` - Top-level todo with id 1
- `[1, 2]` - Subtask with id 2 under todo 1
- `[1, 2, 3]` - Subtask with id 3 under subtask 2

## Component Architecture

### Component Hierarchy
```
<TodoList>
  <ErrorBoundary>
    <TodoListContent>
      <TodoInput />
      <TodoItem>
        <TodoItem> (recursive for subtasks)
          <TodoInput /> (for subtask input)
        </TodoItem>
      </TodoItem>
    </TodoListContent>
  </ErrorBoundary>
</TodoList>
```

### Key Components

#### TodoList
- Main container component
- Manages the todo list display
- Shows statistics and bulk operations
- Wrapped in ErrorBoundary for robustness

#### TodoItem
- Recursive component for displaying todos
- Memoized with custom comparison for performance
- Handles expand/collapse state
- Manages subtask rendering

#### TodoInput
- Reusable input component
- Configurable size and variant
- Handles Enter key submission

## State Management Architecture

### Custom Hooks

#### useTodos
Central state management hook that:
- Manages todo CRUD operations
- Handles API communication
- Implements debounced saves
- Calculates statistics
- Manages input states

#### useExpandedState
Manages which todos are expanded/collapsed:
- Maintains Set of expanded todo IDs
- Provides toggle/expand/collapse functions
- Isolated from main todo state

#### useTodoStyles
Handles styling logic:
- Calculates CSS classes based on state
- Manages keyboard shortcuts
- Centralizes styling logic

#### useTodoAPI
Abstracts API communication:
- Handles loading/error states
- Provides save/load functions
- Error handling and recovery

## Data Flow

### Read Flow
1. Component mounts → `useTodos` hook initializes
2. `loadTodos()` called → API request to `/api/todos`
3. API reads from `todos.json`
4. Data validated with Zod schemas
5. State updated → Components re-render

### Write Flow
1. User action (add/toggle/delete)
2. State updated optimistically
3. Debounced save triggered (500ms)
4. API validates and saves to `todos.json`
5. Backup created before write

### Tree Operations Flow
1. Path constructed from user action
2. `todo-tree-utils` traverses to target node
3. Operation performed (update/delete/add)
4. Parent completion status updated if needed
5. New tree returned immutably

## Performance Optimizations

### React.memo
- TodoItem uses custom comparison
- Prevents re-renders when props haven't changed
- Compares todo properties and subtasks

### useMemo
- Statistics calculation memoized
- Style calculations memoized
- Prevents unnecessary recalculations

### Debouncing
- Saves debounced by 500ms
- Prevents excessive file writes
- Groups rapid changes

### Tree Traversal
- Early exit when max depth reached
- Efficient path-based navigation
- Immutable updates preserve references

## Error Handling

### ErrorBoundary
- Catches component errors
- Shows user-friendly error message
- Allows recovery without app crash

### API Error Handling
- Try-catch blocks in all API operations
- Fallback to empty array on read errors
- Backup files for recovery

### Validation
- Zod schemas validate all data
- Path validation before operations
- Maximum depth enforcement

## Type Safety

### Strict Typing
- No `any` types in production code
- All functions fully typed
- Type guards for runtime checks

### Type Organization
- Base types in `/types/todo.ts`
- Tree-specific types in `/types/todo-tree.ts`
- Clear type hierarchies

## File System Architecture

### API Layer (`/app/api/todos/route.ts`)
- RESTful endpoints (GET/POST)
- File system operations
- Data validation
- Backup management

### Business Logic (`/utils/`)
- `todo-helpers.ts`: CRUD operations
- `todo-tree-utils.ts`: Tree traversal
- `date-helpers.ts`: Formatting

### Constants (`/constants/todo.ts`)
- Centralized configuration
- Magic numbers eliminated
- Easy to modify limits

## Security Considerations

### Input Validation
- All user input sanitized
- Zod schemas enforce structure
- Path validation prevents exploits

### File System
- Limited to project directory
- No user-controlled paths
- Backup files for recovery

## Scalability Considerations

### Current Limitations
- File-based storage (single user)
- No pagination (all todos loaded)
- Limited to local storage

### Future Scalability
- Database adapter pattern ready
- Component structure supports virtualization
- API layer can be extended

## Testing Strategy

### Unit Testing (Recommended)
- Utils functions are pure and testable
- Hooks can be tested with react-hooks-testing-library
- Components with React Testing Library

### Integration Testing
- API routes testable independently
- Full user flows with Cypress/Playwright

### Performance Testing
- Measure with large datasets
- Profile re-renders
- Monitor memory usage

## Deployment Considerations

### Environment
- No environment variables required
- Works with any Node.js host
- Static export possible

### Data Persistence
- Ensure write permissions for todos.json
- Consider backup strategies
- Monitor disk usage

This architecture provides a solid foundation for a maintainable, performant, and extensible todo application.