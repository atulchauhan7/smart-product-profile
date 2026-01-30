# Smart Product Profile - Development Guide

This is a React + TypeScript + Vite project for building a Smart Product Profile application with text editing and AI assistance capabilities.

## Project Overview

The Smart Product Profile is a web application that combines:
- A rich text editor for product information management
- An AI assistant panel for intelligent suggestions and feedback
- Expandable/collapsible layout for flexible workspace organization

## Architecture

### Components
- **Header**: Main navigation and controls
- **TextEditor**: Rich text editing with formatting toolbar
- **AIAgent**: Interactive AI chat interface with confidence scoring

### Key Files
- `src/App.tsx` - Main application component with layout management
- `src/components/` - React components (Header, TextEditor, AIAgent)
- `src/styles/` - Modular CSS files for each component
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions and helpers

## Development Guidelines

### When Adding Features
1. Create components in `src/components/`
2. Add corresponding styles in `src/styles/`
3. Update types in `src/types/index.ts` if needed
4. Add utility functions to `src/utils/` for reusable logic

### Code Style
- Use functional components with React hooks
- Prefer TypeScript interfaces over types for object contracts
- Keep components small and focused on single responsibility
- Use meaningful variable and function names

### Testing & Building
- Run `npm run build` before submitting changes to verify no TypeScript errors
- Use `npm run dev` to test changes locally
- Check the browser console for any runtime errors

## Common Tasks

### Adding a New Component
1. Create file: `src/components/ComponentName.tsx`
2. Create styles: `src/styles/component-name.css`
3. Import and use in parent component
4. Add TypeScript interfaces to `src/types/index.ts`

### Modifying Layout
- Main layout logic is in `src/App.tsx`
- Grid layout defined in `src/styles/app.css`
- Expand/collapse state managed with `layoutMode` state variable

### Styling Guidelines
- Use consistent spacing: 8px, 12px, 16px, 24px
- Primary color: `#d32f2f` (red)
- Text: `#1a1a1a` (dark)
- Borders: `#e0e0e0` (light gray)
- Background panels: `#ffffff` or `#f8f9fa`

## Configuration

### Environment
- **Node.js**: 18.0.0+
- **Package Manager**: npm 9.0.0+
- **Build Tool**: Vite 5.4.21
- **React**: 18.3.1
- **TypeScript**: 5.2.2

### Important Paths
- Production build: `dist/`
- Source files: `src/`
- Type definitions: `src/types/index.ts`
- Utilities: `src/utils/`

## Performance Considerations

- Tree-shaking enabled for production builds
- CSS is scoped to components and minified
- Images and assets should be optimized before adding
- Lazy loading not currently configured but can be added

## Future Enhancements

Consider these improvements for future versions:
- Backend API integration for AI responses
- Local storage for draft auto-saving
- Export functionality (PDF, Word)
- Authentication system
- Dark mode support
- Real-time collaboration
