# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

The main application is located in the `expense-tracker/` directory. Navigate there before running commands:
## Project Overview

This is an expense tracker analytics application built with Next.js 14, TypeScript, and Tailwind CSS. The main application code is located in the `expense-tracker/` subdirectory.

## Development Commands

Navigate to the `expense-tracker/` directory before running these commands:
### Core Commands
- `npm run dev` - Start development server with Turbopack (Next.js 15.4.2)
- `npm run build` - Build for production 
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality

### Development Workflow
1. Always run `npm run lint` after making changes to ensure code quality
2. Use `npm run build` to verify production builds work correctly
3. Development server runs on http://localhost:3000

## Architecture Overview

This is a Next.js 15 expense tracking application with advanced export capabilities, built with TypeScript and Tailwind CSS.

### Core Architecture Patterns

**Client-Side Storage**: The application uses localStorage for data persistence with a centralized storage module (`src/lib/storage.ts`) that provides CRUD operations for expenses. All data operations include error handling for storage failures.

**Type-Safe Data Layer**: TypeScript interfaces in `src/types/` define the data structure:
- `Expense` - Core expense record with id, amount, category, description, date, and timestamps
- `ExpenseCategory` - Union type for predefined categories (Food, Transportation, Entertainment, Shopping, Bills, Other)
- `CloudService` and `ExportTemplate` - Advanced export system types

**Component Architecture**: React components are organized by functionality:
- Form components (`expense-form.tsx`) handle CRUD operations
- Display components (`expense-list.tsx`, `summary-cards.tsx`) show data with filtering/sorting
- Export components (`export-modal.tsx`, `cloud-export-dashboard.tsx`) provide multiple export formats
- Layout components (`navigation.tsx`) provide consistent UI structure

### Export System Architecture

The application features a sophisticated multi-format export system:

**Local Exports** (`src/lib/utils.ts`):
- CSV export with proper escaping for spreadsheet compatibility
- JSON export with metadata and structured format
- PDF export using jsPDF with pagination and formatting
- All exports support filtered data and custom filenames

**Cloud Export Hub** (`src/components/cloud-export-dashboard.tsx`):
- Mock integration with cloud services (Gmail, Google Sheets, Dropbox, OneDrive, Slack)
- Export templates for different use cases (tax reports, monthly summaries, category analysis)
- Scheduled export functionality with frequency options
- QR code generation for sharing using the `qrcode` library
- Professional UI with tab-based navigation and status indicators

### Data Flow Patterns

1. **State Management**: Uses React hooks with localStorage persistence
2. **Data Filtering**: Utility functions handle complex filtering by date, category, and search terms
3. **Export Processing**: Async operations with progress indicators and error handling
4. **Form Validation**: Real-time validation with user-friendly error messages

### Key Implementation Details

- **Next.js App Router**: Uses the modern app directory structure with layout.tsx for consistent navigation
- **Tailwind CSS**: Custom design system with CSS variables for theming in globals.css
- **TypeScript**: Strict type checking throughout with comprehensive interfaces
- **Responsive Design**: Mobile-first approach with proper touch interfaces
- **Error Handling**: Comprehensive error boundaries and user feedback systems

### Dependencies Architecture

**Production Dependencies**:
- `next` (15.4.2) - React framework with App Router
- `react` (19.1.0) - UI library  
- `jspdf` (3.0.1) - PDF generation for reports
- `qrcode` (1.5.4) - QR code generation for sharing

**Development Stack**:
- `typescript` (5.x) - Type safety
- `tailwindcss` (4.x) - Styling framework
- `eslint` - Code quality and Next.js best practices

### File Organization Principles

- `src/app/` - Next.js 15 pages using App Router (add/, expenses/, root dashboard)
- `src/components/` - Reusable React components organized by feature
- `src/lib/` - Utility functions and business logic (storage operations, calculations, export functions)
- `src/types/` - TypeScript type definitions for type safety

### Code Style Conventions

- Use TypeScript interfaces for all data structures
- Follow Next.js 15 App Router patterns
- Implement proper error handling in all async operations
- Use Tailwind CSS utility classes with semantic component structure
- Maintain consistent naming: camelCase for variables/functions, PascalCase for components
- Include loading states and progress indicators for user experience
