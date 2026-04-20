# Technology Stack & Tools Used

This document outlines all the tools, libraries, frameworks, and technologies used to build the Blood Pressure Monitoring feature for the Patient Portal.

## Frontend Framework & Core Technologies

### React
- **Version**: 18.x (React Hooks)
- **Purpose**: Core UI framework for building component-based user interface
- **Key Features Used**:
  - Functional Components with Hooks (`useState`, `useEffect`)
  - Component composition and reusability
  - Props and state management

### JavaScript (ES6+)
- **Modern JavaScript Features Used**:
  - Arrow functions
  - Destructuring assignment
  - Template literals
  - Array methods (map, filter, reduce)
  - Async/await
  - Modules (import/export)

## UI Component Libraries

### Lucide React
- **Purpose**: Icon library for React components
- **Icons Used**:
  - `AlertTriangle` - Alert/warning indicators
  - `Heart` - Blood pressure/heart health
  - `Activity` - Activity/health metrics
  - `Phone` - Contact doctor functionality
  - `X` - Close/dismiss buttons
  - `Clock` - Timestamp display
  - `TrendingUp`, `TrendingDown` - Trend indicators
  - `Plus` - Add new readings

### Custom UI Components (shadcn/ui style)
- **Card Components**: `Card`, `CardContent`, `CardHeader`, `CardTitle`
- **Button Component**: `Button` with variants
- **Badge Component**: `Badge` for status indicators
- **Alert Component**: Custom alert/notification component

## Styling & CSS

### Tailwind CSS
- **Purpose**: Utility-first CSS framework
- **Features Used**:
  - Responsive design utilities (`sm:`, `md:`, `lg:`)
  - Color system (primary, secondary, destructive, muted)
  - Spacing utilities (padding, margin, gap)
  - Flexbox and Grid layouts
  - Dark mode support (`dark:`)
  - Animation utilities (`animate-fade-in`)
  - Border and shadow utilities

### CSS Classes & Utilities
- Custom gradient classes
- Hover effects (`hover-lift`, `hover-glow`)
- Focus states for accessibility
- Responsive breakpoints

## State Management

### React Hooks
- **useState**: Managing component state
  - BP readings array
  - Current systolic/diastolic values
  - Input values
  - Visibility states
- **useEffect**: Side effects and lifecycle
  - Loading saved readings from localStorage
  - Checking BP status on value changes
  - Initialization logic

### Local Storage API
- **Purpose**: Persisting BP readings data client-side
- **Methods Used**:
  - `localStorage.getItem()` - Retrieve saved data
  - `localStorage.setItem()` - Save data
  - `JSON.parse()` / `JSON.stringify()` - Data serialization

## Services & Business Logic

### Blood Pressure Monitoring Service (`bpMonitoringService.js`)
- **Purpose**: Core business logic for BP monitoring
- **Functions**:
  - `checkBPStatus()` - Evaluate BP readings against medical standards
  - `requiresImmediateAttention()` - Determine if doctor contact needed
  - `formatBPReading()` - Format BP display
  - `analyzeBPReadings()` - Analyze multiple readings for trends

### Medical Standards Implemented
- **Normal BP**: Systolic < 120, Diastolic < 80
- **Elevated**: Systolic 120-129, Diastolic < 80
- **High Stage 1**: Systolic 130-139 or Diastolic 80-89
- **High Stage 2**: Systolic ≥ 140 or Diastolic ≥ 90
- **Hypertensive Crisis**: Systolic > 180 or Diastolic > 120
- **Low (Hypotension)**: Systolic < 90 or Diastolic < 60

## Component Architecture

### Component Structure
```
components/
  ├── BPReminder.jsx          # Alert component for abnormal BP
  ├── PatientPortal.jsx        # Main dashboard component
  └── BPStatusCard.jsx         # Status display card (exported from BPReminder)

services/
  └── bpMonitoringService.js   # BP monitoring logic
```

### Component Features

#### BPReminder Component
- Real-time BP status checking
- Alert display for abnormal readings
- Doctor contact integration
- Dismissible alerts
- Accessible ARIA labels

#### PatientPortal Component
- BP reading input form
- Reading history display
- BP analysis and trends
- Integration with reminder alerts
- Local storage persistence

## Development Tools

### Code Editor
- **VS Code / Cursor** - Modern code editor
- Features: Syntax highlighting, IntelliSense, Git integration

### Package Management
- **npm / yarn / pnpm** - JavaScript package manager
- **Node.js** - JavaScript runtime environment

### Version Control
- **Git** - Source code version control
- **GitHub / GitLab** - Repository hosting

## Build Tools & Bundlers

### Vite
- **Purpose**: Modern build tool and development server
- **Features**:
  - Fast HMR (Hot Module Replacement)
  - ES modules support
  - Environment variable support (`import.meta.env`)

### Module Bundling
- ES6 modules (`import`/`export`)
- Dynamic imports for code splitting
- Lazy loading support

## Accessibility (a11y)

### ARIA Attributes
- `role="alert"` - Alert announcements
- `aria-live="assertive"` - Screen reader announcements
- `aria-label` - Descriptive labels for buttons
- `aria-hidden="true"` - Decorative elements

### Keyboard Navigation
- Focus management
- Tab navigation
- Enter/Space key interactions

### Semantic HTML
- Proper heading hierarchy
- Form labels and inputs
- Button elements for actions

## Browser APIs

### Web APIs Used
- **localStorage API** - Client-side data persistence
- **Date API** - Timestamp handling and formatting
- **Fetch API** (for future API integrations)

## Code Quality & Best Practices

### Code Organization
- Modular architecture
- Separation of concerns (UI vs. logic)
- Reusable components
- Service layer pattern

### Error Handling
- Input validation
- Try-catch blocks
- Graceful fallbacks
- User-friendly error messages

### Performance
- Component memoization (where applicable)
- Efficient array operations
- Conditional rendering
- Lazy loading for heavy components

## Testing & Quality Assurance

### Manual Testing
- Cross-browser testing
- Responsive design testing
- Accessibility testing
- User flow validation

## Documentation

### Code Documentation
- JSDoc comments for functions
- Inline comments for complex logic
- README files for services
- Component prop documentation

## Future Enhancements (Tools Needed)

### Backend Integration
- **REST API** or **GraphQL** - Server communication
- **Express.js** / **FastAPI** - Backend framework
- **Database** (PostgreSQL/MongoDB) - Data persistence

### Authentication
- **JWT** - Token-based authentication
- **OAuth 2.0** - Social login integration

### Real-time Features
- **WebSocket** - Real-time updates
- **Server-Sent Events (SSE)** - Live notifications

### Deployment
- **Vercel** / **Netlify** - Frontend hosting
- **Docker** - Containerization
- **CI/CD** - Automated deployment

## Environment Setup

### Required Environment Variables
```env
VITE_OPENAI_API_KEY=your-api-key-here  # For ChatGPT integration (if used)
```

### Development Dependencies
- React development tools
- Hot reloading
- Source maps for debugging

## Design Principles

### User Experience (UX)
- Clear visual hierarchy
- Immediate feedback on actions
- Prominent alerts for critical information
- Intuitive navigation

### User Interface (UI)
- Modern, clean design
- Responsive layout
- Consistent color scheme
- Accessible contrast ratios

### Medical Standards
- Evidence-based BP ranges
- Clear medical disclaimers
- Emphasis on doctor consultation
- Safety-first approach

---

## Summary

This BP monitoring feature was built using:
- **React** for the UI framework
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Local Storage** for data persistence
- **Modern JavaScript** for business logic
- **Accessibility standards** for inclusive design

The codebase follows modern React best practices, component-based architecture, and emphasizes user safety through immediate alerts for abnormal blood pressure readings.

