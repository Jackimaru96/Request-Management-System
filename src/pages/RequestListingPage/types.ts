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

// Event Type enum - maps to TMS_Request_Event.eventType
export enum EventType {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  PAUSE = "PAUSE",
  RESUME = "RESUME",
}

// Event Status enum - maps to TMS_Request_Event.status
export enum EventStatus {
  LOCAL = "LOCAL",
  APPROVED = "APPROVED",
  PENDING_UPLOAD = "PENDING_UPLOAD",
  UPLOADED = "UPLOADED",
}

// Collection Request Status enum - maps to Col_Request.status
export enum CollectionStatus {
  PENDING_C = "PENDING-C",
  COLLECTING = "COLLECTING",
  COMPLETED = "COMPLETED",
  SUSPENDED = "SUSPENDED",
  ERROR = "ERROR",
  PAUSED = "PAUSED",
  ERROR_COUNT = "ERROR-COUNT",
  DELETING = "DELETING",
  DELETED = "DELETED",
}

// UI Change Status - derived from TMS_Request_Event
export enum ChangeStatus {
  ADDED = "added", // CREATE/UPDATE eventType with LOCAL status
  DELETED = "deleted", // DELETE eventType with LOCAL status
  UPLOADED = "uploaded", // UPLOADED status
  PENDING_UPLOAD = "pending_upload", // PENDING_UPLOAD status
}

// TMS_Request interface (S-Segment) - Base request information
export interface TMSRequest {
  // Required fields
  _id: string; // TMS_Request._id (randomly generated)
  url: string; // TMS_Request.url
  requestType: RequestType; // TMS_Request.requestType
  priority: Priority; // TMS_Request.priority (int: L, M, H, U)
  contentType: string; // TMS_Request.contentType (W parameter)
  createdTime: Date; // TMS_Request.createdTime
  userGroup: string; // TMS_Request.userGroup
  version: number; // TMS_Request.version

  // Optional fields
  backcrawlDepth?: number; // TMS_Request.backcrawlDepth (in days)
  backcrawlStartTime?: Date; // TMS_Request.backcrawlStartTime
  backcrawlEndTime?: Date; // TMS_Request.backcrawlEndTime
  country?: string; // TMS_Request.country (ISO3166 alpha-2)
  cutOffTime?: Date; // TMS_Request.cutOffTime (for LIVESTREAM)
  endCollectionTime?: Date; // TMS_Request.endCollectionTime (for RECURRING)
  isAlwaysRun?: boolean; // TMS_Request.isAlwaysRun
  isCollectPopularPostOnly?: boolean; // TMS_Request.isCollectPopularPostOnly
  platform?: string; // TMS_Request.platform (UI display, derived from URL)
  recurringFreq?: number; // TMS_Request.recurringFreq (in hours)
  startCollectionTime?: Date; // TMS_Request.startCollectionTime
  tags?: string[]; // TMS_Request.tags
  title?: string; // TMS_Request.title
  zone?: string; // TMS_Request.zone (internal UI field)
}

// TMS_Request_Event interface (S-Segment) - Event/Action for a request
export interface TMSRequestEvent {
  // Required fields
  _id: string; // TMS_Request_Event._id (randomly generated)
  requestId: string; // Link to TMS_Request._id
  eventType: EventType; // TMS_Request_Event.eventType
  status: EventStatus; // TMS_Request_Event.status
  payload: string; // Stringified JSON of desired actions/updates
  user: string; // User ID who created the event
  userGroup: string; // User group of the event creator
  createdTime: Date; // Time when event was created
  version: number; // Version number for the request

  // Optional fields
  approvedBy?: string; // User ID who approved (or "SYSTEM-AUTO")
  uploadedTime?: Date; // Time when event was uploaded to R segment
}

// Col_Request interface (R-Segment) - Collection request for W API
export interface CollectionRequest {
  // Required fields
  _id: string; // Col_Request._id (randomly generated)
  requestId: string; // Link to TMS_Request._id
  url: string; // Request URL
  requestType: RequestType; // Col_Request.requestType
  priority: Priority; // Col_Request.priority (int)
  estimatedColDuration: number; // Estimated duration in minutes
  status: CollectionStatus; // Col_Request.status
  createdTime: Date; // When request created in R segment
  version: number; // Version number

  // Optional fields
  backcrawlDepth?: number; // How far back to collect in days
  backcrawlStartTime?: Date; // Date to start backcrawl
  backcrawlEndTime?: Date; // Date when backcrawl stops
  collectionFee?: number; // Cost given by W
  colEndTime?: Date; // When request finished
  colRequestId?: string; // ID given by W
  colStartTime?: Date; // When request enters W collection
  contentType?: string; // W parameter contentType
  creditType?: string; // Credit type given by W
  cutOffTime?: Date; // Cut-off timing for LIVESTREAM
  endCollectionTime?: Date; // When RECURRING stops
  isAlwaysRun?: boolean; // If suspended, retry automatically
  isCollectPopularPostOnly?: boolean; // Collect top X posts only
  recurringFreq?: number; // Interval for RECURRING (hours)
  retryCount?: number; // Number of times task has failed
  startCollectionTime?: Date; // When supposed to enter W collection
}

// Main Task interface - Composite view combining TMS_Request, latest TMSRequestEvent, and Col_Request
export interface Task {
  // From TMS_Request
  id: string; // TMS_Request._id
  url: string; // TMS_Request.url
  requestType: RequestType; // TMS_Request.requestType
  priority: Priority; // TMS_Request.priority
  contentType: string; // TMS_Request.contentType
  createdTime: Date; // TMS_Request.createdTime
  userGroup: string; // TMS_Request.userGroup
  version: number; // TMS_Request.version

  // Optional fields from TMS_Request
  backcrawlDepth?: number;
  backcrawlStartTime?: Date;
  backcrawlEndTime?: Date;
  country?: string;
  cutOffTime?: Date;
  endCollectionTime?: Date;
  isAlwaysRun?: boolean;
  isCollectPopularPostOnly?: boolean;
  platform?: string;
  recurringFreq?: number;
  startCollectionTime?: Date;
  tags?: string[];
  title?: string;
  zone?: string;

  // From latest TMSRequestEvent
  latestEvent?: TMSRequestEvent; // Latest event for this request
  user: string; // From latest event

  // From Col_Request (most recent collection)
  collectionStatus?: CollectionStatus; // Col_Request.status
  colEndTime?: Date; // Col_Request.colEndTime (Last Collected)
  estimatedColDuration?: number; // Col_Request.estimatedColDuration

  // UI-only fields (derived)
  depth: Depth; // Derived from backcrawl fields
  changeStatus: ChangeStatus | null; // Derived from latestEvent.eventType and status
}

// Helper type for display purposes (what the grid shows)
export interface TaskDisplay {
  id: string;
  changeStatus: ChangeStatus | null;
  url: string;
  taskType: string; // Formatted string (e.g., "Adhoc", "Recurring", "Livestream")
  frequency: string; // Formatted string like "Every 3 hours" or "-"
  depth: string; // Formatted string like "Last 2 hours", "Last 5 days", or "2024-01-01 to 2024-01-31"
  priority: string; // Priority label (e.g., "Urgent", "High", etc.)
  country: string;
  status: string; // Collection status (from Col_Request, formatted in Camel Case)
  lastCollected: string; // Formatted date string (from Col_Request.colEndTime)
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
  "id" | "createdTime" | "userGroup" | "version" | "changeStatus" | "latestEvent" | "collectionStatus" | "colEndTime" | "estimatedColDuration"
>;

// Helper function to derive ChangeStatus from TMSRequestEvent
export function deriveChangeStatus(event?: TMSRequestEvent): ChangeStatus | null {
  if (!event) return null;

  // If event is uploaded, show uploaded status
  if (event.status === EventStatus.UPLOADED) {
    return ChangeStatus.UPLOADED;
  }

  // If event is pending upload, show pending upload status
  if (event.status === EventStatus.PENDING_UPLOAD) {
    return ChangeStatus.PENDING_UPLOAD;
  }

  // If event is local
  if (event.status === EventStatus.LOCAL) {
    // CREATE or UPDATE shows as added (+)
    if (event.eventType === EventType.CREATE || event.eventType === EventType.UPDATE) {
      return ChangeStatus.ADDED;
    }
    // DELETE shows as deleted (-)
    if (event.eventType === EventType.DELETE) {
      return ChangeStatus.DELETED;
    }
  }

  return null;
}
