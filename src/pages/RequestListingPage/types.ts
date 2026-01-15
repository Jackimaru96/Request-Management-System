// Task Type enum
export type RequestType = "Recurring" | "Ad-Hoc" | "Livestream";

// Priority enum
export type Priority = "Urgent" | "High" | "Medium" | "Low";

// Depth types
export type DepthLastHours = {
  type: "lastHours";
  hours: 2; // Always 2 hours
};

export type DepthLastDays = {
  type: "lastDays";
  days: number;
};

export type DepthDateRange = {
  type: "dateRange";
  startDate: Date;
  endDate?: Date; // Optional - can have just start date
};

export type Depth = DepthLastHours | DepthLastDays | DepthDateRange;

// Change status for tasks
export type ChangeStatus = "added" | "deleted" | "confirmed" | null;

// Main Task interface
export interface Task {
  id: string;
  url: string;
  requestType: RequestType;
  frequency: number; // in hours
  depth: Depth;
  priority: Priority;
  country: string; // ISO country name
  status: "Collected" | "Collecting" | "Uploaded" | "";
  lastCollected: Date | null;
  changeStatus: ChangeStatus; // Track if task is added, deleted, or confirmed
}

// Helper type for display purposes (what the grid shows)
export interface TaskDisplay {
  id: string;
  changeStatus: ChangeStatus;
  url: string;
  taskType: RequestType;
  frequency: string; // Formatted string like "Every 3 hours" or "-"
  depth: string; // Formatted string like "Last 2 hours", "Last 5 days", or "2024-01-01 to 2024-01-31"
  priority: Priority;
  country: string;
  status: string;
  lastCollected: string; // Formatted date string
}

// Filter option type
export type FilterOption = "All" | RequestType;
