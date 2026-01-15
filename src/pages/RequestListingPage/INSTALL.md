# Installation Instructions for Add Task Dialogs

## Required Dependencies

The Add Task dialogs require the following packages to be installed:

```bash
npm install @mui/x-date-pickers date-fns
```

## Packages Breakdown:

1. **@mui/x-date-pickers** - MUI Date/Time picker components
2. **date-fns** - Date utility library used by the date pickers

## Alternative Country Library (Optional)

For a comprehensive list of ISO countries, you can optionally install:

```bash
npm install country-list
```

Then update `AddTaskDialog.tsx` to use it:

```typescript
import { getData } from 'country-list';

const COUNTRIES = getData().map(c => c.name).sort();
```

## Current Implementation

The current implementation includes a hardcoded list of 25 common countries. This is sufficient for most use cases and avoids an additional dependency.

If you need the full ISO country list (195+ countries), use the `country-list` package as shown above.
