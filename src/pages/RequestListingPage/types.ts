// Request Type enum - maps to TMS_Request.requestType
export enum RequestType {
  ADHOC = "ADHOC",
  RECURRING = "RECURRING",
  LIVESTREAM = "LIVESTREAM",
}

// Request Status enum - maps to TMS_Request.status
export enum RequestStatus {
  CREATED = "CREATED",
  APPROVED = "APPROVED",
  DOWNLOADED = "DOWNLOADED",
}

// Priority enum - maps to TMS_Request.priority (stored as int in DB)
export enum Priority {
  URGENT = 1,
  HIGH = 2,
  MEDIUM = 3,
  LOW = 4,
}

// Display labels for priority
export const PRIORITY_LABELS: Record<Priority, string> = {
  [Priority.URGENT]: "Urgent",
  [Priority.HIGH]: "High",
  [Priority.MEDIUM]: "Medium",
  [Priority.LOW]: "Low",
};

// Depth Type enum
export enum DepthType {
  LAST_HOURS = "lastHours",
  LAST_DAYS = "lastDays",
  DATE_RANGE = "dateRange",
}

// Depth types - represents backcrawl configuration
export type DepthLastHours = {
  type: DepthType.LAST_HOURS;
  hours: 2; // Always 2 hours
};

export type DepthLastDays = {
  type: DepthType.LAST_DAYS;
  days: number; // Maps to backcrawlDepth
};

export type DepthDateRange = {
  type: DepthType.DATE_RANGE;
  startDate: Date; // Maps to backcrawlStartTime
  endDate?: Date; // Maps to backcrawlEndTime
};

export type Depth = DepthLastHours | DepthLastDays | DepthDateRange;

// Change status for UI tracking (not in database)
export enum ChangeStatus {
  ADDED = "added",
  DELETED = "deleted",
  UPLOADED = "uploaded",
  PENDING_UPLOAD = "pending_upload",
}

// Main Task interface - maps to TMS_Request (S-Segment)
export interface Task {
  // Required fields
  id: string; // TMS_Request.id
  url: string; // TMS_Request.url
  requestType: RequestType; // TMS_Request.requestType
  priority: Priority; // TMS_Request.priority (int)
  contentType: string; // TMS_Request.contentType (W parameter)
  mediaPlatform: string; // TMS_Request.mediaPlatform (W parameter)
  mediaType: string; // TMS_Request.mediaType (W parameter)
  estimatedColDuration: number; // TMS_Request.estimatedColDuration (in minutes)
  status: RequestStatus; // TMS_Request.status
  createdTime: Date; // TMS_Request.createdTime
  user: string; // TMS_Request.user (User ID)
  userGroup: string; // TMS_Request.userGroup

  // Optional fields
  approvedBy?: string; // TMS_Request.approvedBy
  backcrawlDepth?: number; // TMS_Request.backcrawlDepth (in days)
  backcrawlStartTime?: Date; // TMS_Request.backcrawlStartTime
  backcrawlEndTime?: Date; // TMS_Request.backcrawlEndTime
  country?: string; // TMS_Request.country (ISO3166 alpha-2)
  cutOffTime?: Date; // TMS_Request.cutOffTime (for LIVESTREAM)
  endCollectionTime?: Date; // TMS_Request.endCollectionTime (for RECURRING)
  isAlwaysRun?: boolean; // TMS_Request.isAlwaysRun
  isCollectPopularPostOnly?: boolean; // TMS_Request.isCollectPopularPostOnly
  isCollectPostOnly?: boolean; // TMS_Request.isCollectPostOnly
  recurringFreq?: number; // TMS_Request.recurringFreq (in hours)
  startCollectionTime?: Date; // TMS_Request.startCollectionTime
  tags?: string[]; // TMS_Request.tags
  title?: string; // TMS_Request.title

  // UI-only fields (not in database)
  depth: Depth; // Derived from backcrawl fields
  changeStatus: ChangeStatus | null; // UI tracking for pending changes
}

// Helper type for display purposes (what the grid shows)
export interface TaskDisplay {
  id: string;
  changeStatus: ChangeStatus | null;
  url: string;
  taskType: RequestType;
  frequency: string; // Formatted string like "Every 3 hours" or "-"
  depth: string; // Formatted string like "Last 2 hours", "Last 5 days", or "2024-01-01 to 2024-01-31"
  priority: string; // Priority label (e.g., "Urgent", "High", etc.)
  country: string;
  status: string;
  lastCollected: string; // Formatted date string
}

// Type for Task Event
export interface TaskEvent {
  approvedBy: string;
  createdTime: Date;
  eventType: "CREATE" | "UPDATE" | "DELETE" | "PAUSE" | "RESUME";
  _id: string;
  payload: string;
  requestId: string;
  uploadedTime: Date;
  user: string;
  userGroup: string;
  status: "LOCAL" | "APPROVED" | "PENDING_UPLOAD" | "UPLOADED";
  version: number;
}

// Type for Task Request
export interface TaskRequest {
  backcrawlDepth: number;
  backcrawlEndDate?: Date;
  backcrawlStartDate: Date;
  contentType: string;
  country: string;
  endCollectionTime?: Date;
  _id: string;
  isAlwaysRun: boolean;
  isCollectPopularPostsOnly: boolean;
  platform: string;
  priority: number;
  recurringFreq: number;
  requestType: RequestType;
  createdTime: Date;
  startCollectionTime: Date;
  tags?: string[];
  title?: string;
  url: string;
  version: number;
  zone: string;
}

// Filter option type
export enum FilterOption {
  ALL = "All",
  ADHOC = RequestType.ADHOC,
  RECURRING = RequestType.RECURRING,
  LIVESTREAM = RequestType.LIVESTREAM,
}

// Helper type for creating new tasks (omit database-managed fields)
export type TaskCreate = Omit<
  Task,
  "id" | "status" | "createdTime" | "user" | "userGroup" | "changeStatus" | "approvedBy"
>;
