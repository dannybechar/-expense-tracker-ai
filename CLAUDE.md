# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an expense tracker analytics application built with Next.js 14, TypeScript, and Tailwind CSS. The main application code is located in the `expense-tracker/` subdirectory.

## Development Commands

Navigate to the `expense-tracker/` directory before running these commands:

```bash
cd expense-tracker
```

### Essential Commands
- `npm run dev` - Start development server with Turbopack (http://localhost:3000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Architecture

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Storage**: localStorage (client-side persistence)
- **PDF Generation**: jsPDF library
- **QR Codes**: qrcode library

### Key Directories
```
expense-tracker/src/
├── app/                    # Next.js App Router pages
│   ├── add/               # Add expense page
│   ├── expenses/          # Expenses list and management
│   ├── layout.tsx         # Root layout with navigation
│   └── page.tsx           # Dashboard homepage
├── components/            # React components
├── lib/                   # Utilities and storage layer
├── types/                 # TypeScript definitions
```

### Core Types
- `Expense`: Main data model with id, amount, category, description, date
- `ExpenseCategory`: Union type for predefined categories (Food, Transportation, etc.)
- `ExpenseFilters`: Filtering interface for expense lists
- `ExpenseSummary`: Analytics data structure

### Storage Architecture
The application uses a centralized storage layer (`src/lib/storage.ts`) that abstracts localStorage operations. All data persistence goes through this module with proper error handling and SSR compatibility checks.

### Component Architecture
- **Navigation**: Global header with routing
- **Summary Cards**: Dashboard metrics display
- **Category Breakdown**: Visual analytics with progress bars
- **Expense Form**: Add/edit expense functionality with validation
- **Expense List**: Table view with filtering, sorting, and export
- **Export Modal**: CSV and potential cloud export functionality

### Data Flow
1. User interactions → Components
2. Components → Storage layer (`storage.ts`)
3. Storage layer → localStorage
4. Data retrieval follows reverse path with error handling

## Development Notes

### Working Directory
Always work from the `expense-tracker/` subdirectory as that contains the actual Next.js application.

### Data Persistence
All expense data is stored in localStorage with the key `expense-tracker-data`. The storage module handles SSR compatibility and error cases gracefully.

### Categories
The application uses predefined expense categories: Food, Transportation, Entertainment, Shopping, Bills, Other. These are defined as TypeScript union types for type safety.