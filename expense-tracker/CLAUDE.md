# Expense Tracker AI - Development Guide

## Project Overview

This is a modern expense tracking web application built with Next.js 14, TypeScript, and Tailwind CSS. The application follows SOLID principles and implements defensive security practices for client-side financial data management.

## Architecture & SOLID Principles Implementation

### Single Responsibility Principle (SRP)
- **Storage Layer** (`lib/storage.ts`): Handles only localStorage operations
- **Utility Functions** (`lib/utils.ts`): Pure functions for calculations and formatting
- **Type Definitions** (`types/expense.ts`): Contains only interface definitions
- **Components**: Each component has a single, well-defined purpose

### Open/Closed Principle (OCP)
- **Export System**: Extensible export functionality (CSV, JSON, PDF) without modifying core logic
- **Component Architecture**: New components can be added without changing existing ones
- **Category System**: New expense categories can be added by extending the `ExpenseCategory` type

### Liskov Substitution Principle (LSP)
- **Interface Contracts**: All components expecting `Expense` objects work with any valid implementation
- **Storage Abstraction**: Storage operations can be replaced with different implementations (e.g., API calls)

### Interface Segregation Principle (ISP)
- **Focused Interfaces**: `ExpenseFormData`, `ExpenseFilters`, and `ExpenseSummary` are specific to their use cases
- **Component Props**: Each component receives only the props it needs

### Dependency Inversion Principle (DIP)
- **Storage Abstraction**: Components depend on the storage interface, not localStorage directly
- **Utility Functions**: High-level components depend on abstractions, not implementation details

## Development Workflow

### 1. Parallel Development Strategy

**When to Use Parallel Development:**
- Multiple features can be developed simultaneously without conflicts
- Independent components or utilities
- Different team members working on separate modules
- Performance optimizations that don't affect core functionality

**Parallel Development Process:**
1. **Feature Branch Creation** (can be done simultaneously)
   ```bash
   # Create feature branches in parallel
   git checkout -b feature/user-authentication
   git checkout -b feature/data-visualization  
   git checkout -b feature/mobile-optimization
   git checkout -b fix/performance-improvements
   ```

2. **Parallel Tool Usage** (maximize efficiency)
   ```bash
   # Run multiple operations simultaneously using multiple tool calls
   # Example: Analyze multiple files at once
   Read(file1.ts) + Read(file2.ts) + Read(file3.ts)
   
   # Run parallel tests and builds
   npm run test & npm run lint & npm run type-check
   ```

3. **Independent Development Paths**
   - **Frontend Components**: UI components that don't share state
   - **Backend Services**: API endpoints and data processing
   - **Utility Functions**: Pure functions without dependencies
   - **Testing Suites**: Unit tests for different modules

### 2. File Naming Conventions & Formulas

#### **Component Naming Formula**
```
[Feature][Type][Variant?].tsx

Examples:
- ExpenseForm.tsx (main form)
- ExpenseFormModal.tsx (modal variant)
- ExpenseListItem.tsx (list item component)
- UserAuthButton.tsx (authentication button)
- DashboardSummaryCard.tsx (dashboard summary)
```

#### **Test File Naming Formula**
```
[ComponentName].test.tsx
[UtilityName].test.ts

Examples:
- ExpenseForm.test.tsx
- utils.test.ts
- storage.test.ts
- api-client.test.ts
```

#### **Utility File Naming Formula**
```
[Domain][Purpose].ts

Examples:
- date-helpers.ts
- currency-formatters.ts
- validation-rules.ts
- api-endpoints.ts
- expense-calculations.ts
```

#### **Hook Naming Formula**
```
use[Feature][Action?].ts

Examples:
- useExpenses.ts
- useExpenseForm.ts
- useLocalStorage.ts
- useDebounce.ts
```

#### **Type Definition Naming Formula**
```
[Domain].types.ts

Examples:
- expense.types.ts
- user.types.ts
- api.types.ts
- ui.types.ts
```

#### **Feature Branch Naming Formula**
```
[type]/[feature-description]

Types:
- feature/: New functionality
- fix/: Bug fixes
- security/: Security improvements
- performance/: Performance optimizations
- test/: Testing improvements
- docs/: Documentation updates

Examples:
- feature/monthly-insights-dashboard
- fix/currency-formatting-precision
- security/input-sanitization
- performance/bundle-size-optimization
```

### 3. Requirements Analysis & Implementation Steps

Before implementing any feature:

1. **Analyze Requirements** (Can be done in parallel for multiple features)
   - Break down feature into atomic components
   - Identify data flow and state management needs
   - Consider security implications for financial data
   - Plan testing approach
   - **Parallel Analysis**: Use multiple tool calls to examine related files simultaneously

2. **Design Phase** (Independent design work can proceed in parallel)
   - Create/update TypeScript interfaces
   - Plan component hierarchy
   - Ensure SOLID principle compliance
   - Consider accessibility requirements

3. **Implementation Phase** (Coordinate parallel development)
   - Write pure functions first (utilities) - can be done independently
   - Implement storage layer if needed - coordinate with other developers
   - Create components with proper error boundaries - can be done in parallel
   - Add proper TypeScript types - share common types across parallel branches

### 2. Testing Strategy & Execution

#### Unit Testing Setup
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom

# Install additional testing utilities
npm install --save-dev @types/jest
```

#### Test Structure
```
src/
├── __tests__/              # Test files
│   ├── components/         # Component tests
│   ├── lib/               # Utility function tests
│   └── types/             # Type validation tests
├── components/
├── lib/
└── types/
```

#### Testing Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- expense-form.test.tsx
```

#### Critical Test Categories

1. **Utility Function Tests** (`lib/utils.test.ts`)
   - Currency formatting accuracy
   - Date formatting consistency  
   - Expense summary calculations
   - CSV/JSON export data integrity
   - Filter logic validation

2. **Storage Layer Tests** (`lib/storage.test.ts`)
   - CRUD operations
   - Error handling for localStorage failures
   - Data persistence validation
   - Edge cases (empty data, malformed data)

3. **Component Tests**
   - Form validation and submission
   - Data rendering accuracy
   - User interaction handling
   - Accessibility compliance
   - Error state handling

4. **Security Tests**
   - Input sanitization
   - XSS prevention in descriptions
   - Data validation at boundaries
   - localStorage security measures

#### Example Test Implementation
```typescript
// lib/__tests__/utils.test.ts
import { formatCurrency, calculateExpenseSummary } from '../utils';
import { Expense } from '@/types/expense';

describe('formatCurrency', () => {
  it('should format positive amounts correctly', () => {
    expect(formatCurrency(123.45)).toBe('$123.45');
  });

  it('should handle zero amounts', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should format large amounts with commas', () => {
    expect(formatCurrency(1234567.89)).toBe('$1,234,567.89');
  });
});

describe('calculateExpenseSummary', () => {
  const mockExpenses: Expense[] = [
    {
      id: '1',
      amount: 50.00,
      category: 'Food',
      description: 'Lunch',
      date: '2024-01-15',
      createdAt: '2024-01-15T12:00:00Z'
    }
  ];

  it('should calculate correct totals', () => {
    const summary = calculateExpenseSummary(mockExpenses);
    expect(summary.totalSpending).toBe(50.00);
    expect(summary.expenseCount).toBe(1);
  });
});
```

### 3. Code Quality & Linting

#### Pre-commit Validation
```bash
# Run linting
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix

# Type checking
npm run type-check

# Build verification
npm run build
```

#### Code Standards
- **TypeScript**: Strict mode enabled, no `any` types
- **ESLint**: Next.js recommended rules + custom security rules
- **Prettier**: Consistent code formatting
- **Import Organization**: Absolute imports using `@/` prefix

### 4. Git Workflow & Branch Management

#### Branch Strategy
```bash
# Feature development
git checkout -b feature/expense-insights
git checkout -b fix/calculation-bug
git checkout -b security/input-validation

# Integration branches
git checkout -b integration/analytics-dashboard
```

#### Pre-commit Checklist
1. ✅ All tests pass (`npm test`)
2. ✅ Linting passes (`npm run lint`)
3. ✅ TypeScript compiles (`npm run type-check`)
4. ✅ Build succeeds (`npm run build`)
5. ✅ Security review completed
6. ✅ Documentation updated

#### Commit Message Standards
```bash
# Format: type(scope): description
feat(insights): add monthly spending donut chart
fix(storage): handle localStorage quota exceeded error
security(forms): sanitize user input in expense descriptions
test(utils): add comprehensive currency formatting tests
docs(readme): update installation instructions
```

#### Branch Synchronization Check
```bash
# Check local vs remote status
git status
git log --oneline origin/$(git branch --show-current)..HEAD

# Sync with remote
git fetch origin
git rebase origin/main  # or merge if preferred

# Verify sync status
git status
git log --oneline -5
```

### 5. Security & Defensive Programming

#### Input Validation
- All user inputs sanitized before storage
- XSS prevention in expense descriptions
- Number validation for amounts
- Date validation for expense dates

#### Data Protection
- No sensitive data logged to console
- localStorage encryption for sensitive data
- Input sanitization at all entry points
- Proper error handling without data exposure

#### Security Testing
```typescript
// Example security test
describe('Input Sanitization', () => {
  it('should sanitize XSS attempts in descriptions', () => {
    const maliciousInput = '<script>alert("xss")</script>';
    const sanitized = sanitizeInput(maliciousInput);
    expect(sanitized).not.toContain('<script>');
  });
});
```

## Environment Setup

### Required Tools
- **Node.js**: 18+ LTS version
- **npm**: 9+ package manager
- **Git**: Latest version
- **VS Code**: Recommended IDE with TypeScript support

### Development Dependencies
```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@types/jest": "^29.5.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0"
  }
}
```

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENVIRONMENT=development
```

## Performance Considerations

### Bundle Optimization
- Dynamic imports for heavy libraries (jsPDF)
- Tree shaking for unused code
- Component-level code splitting

### Runtime Performance
- Memoization for expensive calculations
- Virtualization for large expense lists
- Debounced search inputs
- Optimized re-renders with React.memo

## Accessibility Standards

### WCAG Compliance
- Semantic HTML structure
- Keyboard navigation support
- Screen reader compatibility
- High contrast color scheme
- Focus management

### Testing Accessibility
```bash
# Install accessibility testing tools
npm install --save-dev @axe-core/react jest-axe
```

## Deployment & CI/CD

### Build Process
```bash
# Production build
npm run build

# Serve locally
npm start

# Static export (if needed)
npm run export
```

### Deployment Checklist
1. ✅ All tests pass in CI
2. ✅ Security audit clean (`npm audit`)
3. ✅ Performance benchmarks met
4. ✅ Accessibility tests pass
5. ✅ Cross-browser testing completed
6. ✅ Mobile responsiveness verified

## Monitoring & Maintenance

### Error Tracking
- Client-side error boundaries
- Performance monitoring
- User behavior analytics (privacy-compliant)

### Regular Maintenance
- Dependency updates (monthly)
- Security patches (as needed)
- Performance audits (quarterly)
- User feedback integration

## README Documentation Requirements

When updating the README for major builds, include:

### Version History
```markdown
## Changelog

### v2.1.0 - Monthly Insights Dashboard
- ✅ Added donut chart visualization
- ✅ Implemented budget streak tracking
- ✅ Enhanced category breakdown display
- 🔧 Improved responsive design
- 🧪 Added comprehensive test coverage

### v2.0.0 - Data Export Enhancement
- ✅ Multiple export formats (CSV, JSON, PDF)
- ✅ Cloud integration capabilities
- 🔒 Enhanced security measures
- 📊 Performance optimizations
```

### Technical Changes
- Architecture improvements
- New dependencies added
- Breaking changes (if any)
- Migration instructions
- Performance impact

### User-Facing Changes
- New features and capabilities
- UI/UX improvements
- Accessibility enhancements
- Bug fixes

## Weekly Reporting Requirements

### Weekly Development Report Template

**Report Period**: [Start Date] - [End Date]
**Developer**: [Name]
**Project**: Expense Tracker AI

#### 📊 **Development Metrics**
- **Commits Made**: [Number]
- **Lines of Code Added**: [Number]
- **Lines of Code Removed**: [Number]
- **Files Modified**: [Number]
- **Test Coverage Change**: [Previous]% → [Current]%
- **Build Success Rate**: [Percentage]

#### 🎯 **Features Completed**
- ✅ **[Feature Name]**: [Brief description and impact]
- ✅ **[Feature Name]**: [Brief description and impact]
- 🔄 **[Feature Name]**: [In Progress - completion percentage]

#### 🐛 **Bugs Fixed**
- **[Bug Description]**: [Solution implemented]
- **[Bug Description]**: [Solution implemented]

#### 🧪 **Testing Activities**
- **Unit Tests Added**: [Number]
- **Integration Tests Added**: [Number]
- **Test Coverage Improvement**: [Details]
- **Performance Tests**: [Results]

#### 🔧 **Technical Debt & Refactoring**
- **Code Refactored**: [Description]
- **Dependencies Updated**: [List]
- **Performance Improvements**: [Details]
- **Security Enhancements**: [Details]

#### 📝 **Documentation Updates**
- **README Updates**: [Changes made]
- **Code Documentation**: [Functions/components documented]
- **API Documentation**: [Updates]

#### 🚧 **Blockers & Challenges**
- **Current Blockers**: [Description and proposed solutions]
- **Technical Challenges**: [How they were resolved]
- **Dependencies Waiting**: [External dependencies needed]

#### 📅 **Next Week's Goals**
- **Priority 1**: [Specific goal with timeline]
- **Priority 2**: [Specific goal with timeline]
- **Priority 3**: [Specific goal with timeline]

#### 🎯 **Code Quality Metrics**
- **ESLint Warnings**: [Current count vs previous]
- **TypeScript Errors**: [Current count vs previous]
- **Build Time**: [Current vs previous]
- **Bundle Size**: [Current vs previous]

#### 📈 **Weekly Automation Report**
```bash
# Generate weekly report
npm run weekly-report

# Commands to collect metrics
git log --since="1 week ago" --stat
git shortlog --since="1 week ago" --numbered --summary
npm run test -- --coverage
npm run build -- --analyze
```

### **When Weekly Reports Are Required**
1. **Regular Sprint Reviews**: Every Friday EOD
2. **Project Milestones**: Before major releases
3. **Stakeholder Updates**: Monthly comprehensive reports
4. **Performance Reviews**: Quarterly detailed analysis
5. **Client Requests**: Ad-hoc reporting as needed
6. **Team Retrospectives**: Before sprint planning

### **Automated Report Generation**
```bash
# Add to package.json scripts
"weekly-report": "node scripts/generate-weekly-report.js"
"metrics-collection": "node scripts/collect-metrics.js"
"git-stats": "git log --since='1 week ago' --pretty=tformat: --numstat | awk '{add+=$1; subs+=$2; loc+=$1-$2} END {printf \"Added: %s, Removed: %s, Total: %s\\n\", add, subs, loc}'"
```

## Commands Reference

### Development (Parallel Execution Support)
```bash
# Sequential execution
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript validation
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode

# Parallel execution for efficiency
npm run lint & npm run type-check & npm test  # Run quality checks in parallel
```

### Git Operations (Parallel Development)
```bash
# Branch management
git branch -vv                    # Check branch tracking
git status                       # Check working directory
git log --oneline -5             # Recent commits

# Parallel branch operations
git fetch origin & git status    # Fetch and check status simultaneously

# Synchronization
git fetch origin                 # Fetch remote changes
git push -u origin feature-name  # Push and set tracking
git pull --rebase origin main    # Sync with main branch

# Parallel development workflow
git checkout -b feature/parallel-1 & git checkout -b feature/parallel-2
```

### Quality Assurance (Optimized for Parallel Execution)
```bash
# Full quality check before commit (parallel where possible)
npm run lint && npm run type-check && npm test && npm run build

# Weekly report generation
npm run weekly-report
npm run git-stats
```

---

## Notes for Claude AI Assistant

When working on this project:

1. **Always run tests** before committing any changes
2. **Follow SOLID principles** when adding new features
3. **Implement security measures** for all user inputs
4. **Update documentation** with any architectural changes
5. **Check branch synchronization** before and after commits
6. **Validate TypeScript** compilation without errors
7. **Test accessibility** features for new components
8. **Review performance impact** of new features

This guide ensures consistent, secure, and maintainable development practices for the Expense Tracker AI project.