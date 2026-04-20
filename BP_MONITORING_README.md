# Blood Pressure Monitoring Feature

## Overview

This feature adds comprehensive blood pressure (BP) monitoring to the patient portal with automatic alerts when readings are abnormal (high or low), prompting patients to contact their doctor immediately.

## Features

✅ **Automatic BP Status Detection** - Checks if readings are normal, elevated, high, low, or critical  
✅ **Real-time Alerts** - Prominent alerts when BP requires immediate medical attention  
✅ **Reading History** - Track and view recent BP readings  
✅ **BP Analysis** - Average readings and trend analysis  
✅ **Doctor Contact Integration** - Quick access to contact doctor  
✅ **Accessibility** - ARIA labels, keyboard navigation, screen reader support  
✅ **Responsive Design** - Works on desktop, tablet, and mobile devices  

## Files Created

### 1. `services/bpMonitoringService.js`
Core business logic for BP monitoring:
- `checkBPStatus(systolic, diastolic)` - Evaluates BP against medical standards
- `requiresImmediateAttention(systolic, diastolic)` - Checks if doctor contact needed
- `formatBPReading(systolic, diastolic)` - Formats BP display (e.g., "120/80 mmHg")
- `analyzeBPReadings(readings)` - Analyzes multiple readings for trends

### 2. `components/BPReminder.jsx`
Alert component that displays when BP is abnormal:
- `BPReminder` - Main alert component with doctor contact button
- `BPStatusCard` - Status card showing current BP reading

### 3. `components/PatientPortal.jsx`
Complete patient portal dashboard with:
- BP reading input form
- Reading history display
- BP analysis summary
- Integration with reminder alerts

## Medical Standards

The system uses the following BP ranges:

| Status | Systolic | Diastolic | Action Required |
|--------|----------|-----------|-----------------|
| **Normal** | < 120 | < 80 | None |
| **Elevated** | 120-129 | < 80 | Monitor |
| **High Stage 1** | 130-139 | 80-89 | Monitor |
| **High Stage 2** | ≥ 140 | ≥ 90 | **Contact Doctor** |
| **Hypertensive Crisis** | > 180 | > 120 | **Contact Doctor Immediately** |
| **Low (Hypotension)** | < 90 | < 60 | **Contact Doctor** |

## Quick Start

### 1. Import the Patient Portal Component

```jsx
import PatientPortal from "@/components/PatientPortal";

// In your routing or main app
<Route path="/portal" element={<PatientPortal />} />
```

### 2. Use BP Reminder in Existing Components

```jsx
import BPReminder from "@/components/BPReminder";

function MyComponent() {
  const [systolic, setSystolic] = useState(145);
  const [diastolic, setDiastolic] = useState(95);
  
  return (
    <div>
      <BPReminder 
        systolic={systolic}
        diastolic={diastolic}
        doctorContact="Dr. Smith - (555) 123-4567"
      />
      {/* Your other content */}
    </div>
  );
}
```

### 3. Use BP Monitoring Service Directly

```jsx
import { checkBPStatus, formatBPReading } from "@/services/bpMonitoringService";

const bpStatus = checkBPStatus(145, 95);
// Returns: { isAbnormal: true, status: 'high', severity: 'high', message: '...', requiresImmediateAttention: true }

if (bpStatus.requiresImmediateAttention) {
  // Show alert to contact doctor
}
```

## Example Usage

### Basic BP Check

```javascript
import { checkBPStatus } from "@/services/bpMonitoringService";

// Check a BP reading
const status = checkBPStatus(145, 95);

if (status.requiresImmediateAttention) {
  console.log(status.message); // "High Blood Pressure: Please contact your doctor immediately"
  // Show alert to user
}
```

### Analyze Multiple Readings

```javascript
import { analyzeBPReadings } from "@/services/bpMonitoringService";

const readings = [
  { systolic: 120, diastolic: 80, timestamp: '2025-01-15T08:00:00Z' },
  { systolic: 145, diastolic: 95, timestamp: '2025-01-15T14:00:00Z' },
  { systolic: 130, diastolic: 85, timestamp: '2025-01-15T20:00:00Z' },
];

const analysis = analyzeBPReadings(readings);
console.log(analysis);
// {
//   averageSystolic: 132,
//   averageDiastolic: 87,
//   totalReadings: 3,
//   abnormalCount: 1,
//   requiresAttention: true,
//   status: { ... },
//   recommendation: 'Contact your doctor immediately'
// }
```

## Integration with Existing App

### Add to Navigation

Add a link to the patient portal in your navigation:

```jsx
<Link to="/portal">Patient Portal</Link>
```

### Add to Dashboard

If you have an existing dashboard, you can embed the BP reminder:

```jsx
import BPReminder, { BPStatusCard } from "@/components/BPReminder";

function Dashboard() {
  const [latestBP, setLatestBP] = useState({ systolic: 145, diastolic: 95 });
  
  return (
    <div>
      <BPReminder 
        systolic={latestBP.systolic}
        diastolic={latestBP.diastolic}
        doctorContact="Your Doctor's Contact Info"
      />
      <BPStatusCard 
        systolic={latestBP.systolic}
        diastolic={latestBP.diastolic}
      />
    </div>
  );
}
```

## Customization

### Custom Alert Messages

You can customize the alert by modifying `bpMonitoringService.js`:

```javascript
// In checkBPStatus function
if (systolic > 180 || diastolic > 120) {
  return {
    isAbnormal: true,
    status: 'crisis',
    severity: 'critical',
    message: 'Your custom message here',
    requiresImmediateAttention: true,
  };
}
```

### Styling

The components use Tailwind CSS. You can customize colors, spacing, and other styles by modifying the className props.

## Data Persistence

Currently, BP readings are stored in `localStorage`. For production, you should:

1. Replace localStorage with API calls
2. Store readings in a database
3. Sync with backend server

Example API integration:

```javascript
// Replace localStorage calls with API
const saveReadings = async (readings) => {
  await fetch('/api/bp-readings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(readings),
  });
};

const loadReadings = async () => {
  const response = await fetch('/api/bp-readings');
  return await response.json();
};
```

## Accessibility Features

- ✅ ARIA labels for screen readers
- ✅ Keyboard navigation support
- ✅ Focus management
- ✅ High contrast colors for alerts
- ✅ Semantic HTML structure
- ✅ Alert announcements (`aria-live="assertive"`)

## Testing

### Manual Testing Checklist

- [ ] Test with normal BP values (e.g., 120/80)
- [ ] Test with high BP (e.g., 145/95)
- [ ] Test with low BP (e.g., 85/55)
- [ ] Test with critical BP (e.g., 185/125)
- [ ] Test alert dismissal
- [ ] Test reading history
- [ ] Test responsive design on mobile
- [ ] Test keyboard navigation
- [ ] Test with screen reader

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

- React 18.x
- lucide-react (for icons)
- Tailwind CSS (for styling)
- Custom UI components (Card, Button, Badge)

## Future Enhancements

- [ ] Backend API integration
- [ ] Real-time notifications
- [ ] Email/SMS alerts
- [ ] BP trend charts/graphs
- [ ] Medication reminders
- [ ] Doctor appointment scheduling
- [ ] Multi-user support
- [ ] Export BP data as PDF

## Support & Documentation

For more information about the tools used, see `TECH_STACK.md`.

For questions or issues, please refer to the main project documentation or contact the development team.

