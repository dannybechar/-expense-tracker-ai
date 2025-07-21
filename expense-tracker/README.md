# Expense Tracker

A modern, intuitive expense tracking web application built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

### Core Functionality
- ✅ **Add Expenses**: Add expenses with date, amount, category, and description
- ✅ **View Expenses**: Clean, organized list of all expenses
- ✅ **Edit & Delete**: Modify or remove existing expenses
- ✅ **Search & Filter**: Filter expenses by category, date range, and search terms
- ✅ **Data Persistence**: All data saved to localStorage

### Categories
- Food 🍽️
- Transportation 🚗
- Entertainment 🎬
- Shopping 🛍️
- Bills 📄
- Other 📦

### Dashboard & Analytics
- ✅ **Summary Cards**: Total spending, monthly spending, average expense, expense count
- ✅ **Category Breakdown**: Visual breakdown with percentages and progress bars
- ✅ **Recent Expenses**: Quick view of your latest 5 expenses
- ✅ **Top Category**: Identifies your highest spending category

### Additional Features
- ✅ **CSV Export**: Export your expense data to CSV format
- ✅ **Responsive Design**: Works perfectly on desktop and mobile
- ✅ **Form Validation**: Comprehensive validation for all inputs
- ✅ **Sorting**: Sort expenses by date, amount, or category
- ✅ **Professional UI**: Clean, modern design with dark mode support

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Navigate to the project directory**
   ```bash
   cd expense-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm start
```

## How to Use

### 1. Dashboard
- View your financial overview on the main dashboard
- See summary cards with key metrics
- Browse recent expenses and category breakdown
- Click "Add Expense" to quickly add a new expense

### 2. Adding Expenses
- Navigate to "Add Expense" or click the "+" button
- Fill out the form with:
  - Amount (required, must be positive)
  - Category (dropdown selection)
  - Description (required, minimum 3 characters)
  - Date (defaults to today)
- Click "Add Expense" to save

### 3. Managing Expenses
- Go to "Expenses" to see all your expenses
- Use filters to find specific expenses:
  - Search by description or category
  - Filter by category
  - Filter by date range
- Sort by clicking column headers (Date, Amount, Category)
- Edit or delete expenses using the action buttons

### 4. Exporting Data
- On the Expenses page, click "Export CSV"
- Downloads a CSV file with all filtered expenses
- Perfect for importing into spreadsheet applications

## Technical Details

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with custom design system
- **Storage**: localStorage for data persistence
- **Icons**: Unicode emojis for cross-platform compatibility

### Project Structure
```
src/
├── app/                    # Next.js 14 App Router pages
│   ├── add/               # Add expense page
│   ├── expenses/          # Expenses list page
│   ├── globals.css        # Global styles and CSS variables
│   ├── layout.tsx         # Root layout with navigation
│   └── page.tsx           # Dashboard homepage
├── components/            # Reusable React components
│   ├── category-breakdown.tsx  # Category visualization
│   ├── expense-form.tsx       # Form for adding/editing expenses
│   ├── expense-list.tsx       # Expense table with filters
│   ├── navigation.tsx         # Header navigation
│   ├── recent-expenses.tsx    # Recent expenses widget
│   └── summary-cards.tsx      # Dashboard summary cards
├── lib/                   # Utility functions
│   ├── storage.ts         # localStorage operations
│   └── utils.ts           # Helper functions and calculations
└── types/                 # TypeScript type definitions
    └── expense.ts         # Expense-related types
```

### Features in Detail

#### Form Validation
- Real-time validation with helpful error messages
- Amount must be positive number
- Description minimum length requirement
- Date validation

#### Data Persistence
- All data stored in localStorage
- Automatic loading on page refresh
- Error handling for storage issues

#### Responsive Design
- Mobile-first approach
- Tablet and desktop optimizations
- Touch-friendly interface

#### Accessibility
- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly
- High contrast design

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Storage Notes

This application uses localStorage for data persistence. This means:
- Data is stored locally in your browser
- Data persists between sessions
- Data is not shared between different browsers/devices
- Clearing browser data will remove all expenses

For production use, consider integrating with a backend database service.

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Customization
The application uses CSS custom properties for theming. Modify the variables in `globals.css` to customize colors and appearance.

## License

This project is open source and available under the MIT License.
