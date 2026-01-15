# Request Listing Page

This page displays a task management system (TMS) interface using the NdsDataGrid component from @nautilus/nds-react.

## Features

- **Data Grid**: Displays tasks in a sortable, selectable table format
- **Task Management**: View tasks with URL, task type, frequency, depth, priority, country, status, and last collected timestamp
- **Row Selection**: Checkbox selection for multiple rows
- **Action Buttons**:
  - Add Tasks: Opens dialog to add new tasks
  - History: View historical changes
  - Review Changes: Review pending changes (with badge count)
- **Row Menu**: Kebab menu on each row with Edit, Delete, and Duplicate actions
- **Priority Badges**: Color-coded priority indicators (Urgent, High, Medium, Low)
- **Dark Theme**: Styled for dark mode interface

## Components

### Main Component
- `index.tsx` - Main RequestListingPage component

### Types
- `types.ts` - TypeScript interfaces for Task and FilterOption

## Usage

```tsx
import RequestListingPage from "./pages/RequestListingPage";

function App() {
  return <RequestListingPage />;
}
```

## Data Structure

```typescript
interface Task {
  id: string;
  url: string;
  taskType: "Recurring" | "One-time" | "Livestream";
  frequency: string;
  depth: string;
  priority: "Urgent" | "High" | "Medium" | "Low";
  country: string;
  status: "Collected" | "Collecting" | "Uploaded" | "";
  lastCollected: string;
}
```

## Customization

### Priority Colors
You can customize the priority badge colors in the `renderCell` function for the priority column:
- Urgent: Red (#d32f2f)
- High: Orange (#ed6c02)
- Medium: Blue (#0288d1)
- Low: Green (#2e7d32)

### Grid Styling
The grid uses MUI DataGrid with custom dark theme styles. Modify the `sx` prop on the NdsDataGrid component to adjust colors, borders, and hover states.

## Future Enhancements

- Connect to real API endpoints
- Add filtering and search functionality
- Implement add/edit/delete modals
- Add pagination controls
- Export functionality
- Real-time status updates
