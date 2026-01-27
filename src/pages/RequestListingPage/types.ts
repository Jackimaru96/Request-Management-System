// ========================================
// ENUMS
// ========================================

// Request Type enum - maps to TMS_Request.requestType
export enum RequestType {
  ADHOC = "ADHOC",
  RECURRING = "RECURRING",
  LIVESTREAM = "LIVESTREAM",
}

export enum Platform {
  FACEBOOK = "FACEBOOK",
  TWITTER = "TWITTER",
  INSTAGRAM = "INSTAGRAM",
  NEWS = "NEWS",
  OTHERS = "OTHERS",
  XIAOHONGSHU = "XIAOHONGSHU",
  WEIBO = "WEIBO",
  TIKTOK = "TIKTOK",
}

export enum ContentType {
  PAGE = "PAGE",
  PEOPLE = "PEOPLE",
  LIVESTREAM = "LIVESTREAM",
  FOLLOWING = "FOLLOWING",
  FOLLOWER = "FOLLOWER",
  SEARCH = "SEARCH",
  ABOUT = "ABOUT",
}

// Priority enum - maps to TMS_Request.priority (stored as int in DB)
export enum Priority {
  URGENT = 0,
  HIGH = 1,
  MEDIUM = 2,
  LOW = 3,
}

// Display labels for priority
export const PRIORITY_LABELS: Record<Priority, string> = {
  [Priority.URGENT]: "Urgent",
  [Priority.HIGH]: "High",
  [Priority.MEDIUM]: "Medium",
  [Priority.LOW]: "Low",
};

// Event Type enum - maps to TMS_Request_Event.eventType
export enum EventType {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  PAUSE = "PAUSE",
  RESUME = "RESUME",
}

// Event Status enum - maps to TMS_Request_Event.status (per ERD)
export enum EventStatus {
  LOCAL = "LOCAL", // Event created locally, not yet exported
  APPROVED = "APPROVED", // Event approved for export (per ERD)
  PENDING_UPLOAD = "PENDING_UPLOAD", // Event included in XML export, waiting for upload
  UPLOADED = "UPLOADED", // Event successfully uploaded to W
  CONFLICT = "CONFLICT", // There is a conflict when tasking is completed, but a DELETE event is created
}

// Collection Request Status enum - maps to Col_Request.status
export enum CollectionStatus {
  COLLECTING = "COLLECTING",
  COMPLETED = "COMPLETED",
  DELETING = "DELETING",
  DELETED = "DELETED",
  ERROR = "ERROR",
  ERROR_COUNT = "ERROR_COUNT",
  PAUSED = "PAUSED",
  PENDING_C = "PENDING_C",
  SUSPENDED = "SUSPENDED",
}

// UI Change Status - derived from TMS_Request_Event for visual indicators
export enum ChangeStatus {
  ADDED = "added", // CREATE/UPDATE eventType with LOCAL or APPROVED status
  DELETED = "deleted", // DELETE eventType with LOCAL or APPROVED status
  UPLOADED = "uploaded", // UPLOADED status (successfully uploaded to W)
  PENDING_UPLOAD = "pending_upload", // PENDING_UPLOAD status (waiting for upload)
  CONFLICT = "conflict", // CONFLICT status (event arrived too late)
}

// ========================================
// DEPTH TYPES (Discriminated Union)
// ========================================

// Depth Type enum for discriminated union
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

/**
 * TMS_Request document - represents the current state of a task request in S-Segment
 * This is a single document per request that gets updated in place
 */
export interface TmsRequest {
  backcrawlDepth?: number; // in days
  backcrawlEndTime?: Date;
  backcrawlStartTime?: Date;
  contentType: ContentType;
  cutOffTime?: Date; // for LIVESTREAM
  endCollectionTime?: Date; // for RECURRING
  isAlwaysRun?: boolean;
  isCollectPopularPostOnly?: boolean;
  startCollectionTime: Date;
  url: string;
  _id: string; // Unique UUID for the request
  archived: boolean;
  country?: string;
  createdTime: Date;
  platform?: Platform;
  priority: Priority;
  recurringFreq?: number; // in hours
  requestType: RequestType;
  tags?: string[];
  title?: string;
  userGroup: string;
  version: number; // Increments with each event
  zone: string;
}

/**
 * TMS_Request_Event document - append-only log of all actions on a request in S-Segment
 * Multiple events can exist for the same requestId
 */
export interface TmsRequestEvent {
  _id: string; // Unique UUID for this event
  approvedBy?: string; // User who approved (or "SYSTEM-AUTO")
  createdTime: Date;
  eventType: EventType; // CREATE, UPDATE, DELETE, PAUSE, RESUME
  payload: string; // Stringified JSON of request fields for XML export
  requestId: string; // Links to TmsRequest._id
  status: EventStatus; // LOCAL, APPROVED, PENDING_UPLOAD, UPLOADED
  uploadedTime: Date; // When event was uploaded
  user: string; // User who created this event
  userGroup: string;
  version: number; // Version of the request at time of this event
}

// ========================================
// COMPOSITE TASK INTERFACE
// ========================================

/**
 * Main Task interface - Composite view combining TMS_Request, latest TmsRequestEvent, and Col_Request
 * This is what the UI works with - combines data from all three sources
 */
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

  // From latest TmsRequestEvent
  latestEvent?: TmsRequestEvent; // Latest event for this request
  user: string; // From latest event

  // From Col_Request (most recent collection in R-Segment)
  collectionStatus?: CollectionStatus;
  colEndTime?: Date; // Last Collected timestamp
  estimatedColDuration?: number;

  // UI-only fields (derived)
  depth: Depth; // Derived from backcrawl fields
  changeStatus: ChangeStatus | null; // Derived from latestEvent.eventType and status
}

// ========================================
// DISPLAY TYPES
// ========================================

/**
 * TaskDisplay - formatted data for the data grid
 * Maps Task fields to display-friendly strings
 */
export interface TaskDisplay {
  id: string;
  changeStatus: ChangeStatus | null;
  url: string;
  taskType: string; // Formatted string (e.g., "Adhoc", "Recurring", "Livestream")
  frequency: string; // Formatted string like "Every 3 hours" or "-"
  depth: string; // Formatted string like "Last 2 hours", "Last 5 days", or "2024-01-01 to 2024-01-31"
  priority: string; // Priority label (e.g., "Urgent", "High", etc.)
  country: string;
  zone: string; // Zone field (e.g., "W", "G", "R", "-")
  status: string; // Collection status (from Col_Request, formatted in Camel Case)
  lastCollected: string; // Formatted date string (from Col_Request.colEndTime)
}

// ========================================
// XML EXPORT TYPES
// ========================================

/**
 * Payload structure for XML export (ERD-compliant)
 *
 * IMPORTANT: This interface represents the SERIALIZED payload structure per ERD.
 * - Datetime fields (b,c,d,f,l) are serialized as epoch milliseconds (number)
 * - Boolean fields (g,h) are serialized as 0 or 1 (number)
 * - Enum fields (i,k) use numeric values for priority, string for requestType
 *
 * Use xmlSerializers.ts helpers for conversion from Task to XmlPayload.
 */
export interface XmlPayload {
  a?: number; // backcrawlDepth (int)
  b?: number; // backcrawlEndTime (epoch milliseconds)
  c?: number; // backcrawlStartTime (epoch milliseconds)
  d?: number; // cutOffTime (epoch milliseconds)
  e?: string; // contentType (string)
  f?: number; // endCollectionTime (epoch milliseconds)
  g?: number; // isAlwaysRun (0 or 1)
  h?: number; // isCollectPopularPostOnly (0 or 1)
  j: number; // priority (enum value 0-3)
  k?: number; // recurringFreq (hours as int)
  m: string; // requestType (enum value as string: ADHOC/RECURRING/LIVESTREAM)
  n?: number; // startCollectionTime (epoch milliseconds)
  p: string; // url (string)
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Helper function to derive ChangeStatus from TmsRequestEvent
 * This determines which visual indicator to show in the UI
 *
 * Stage 1 Workflow (per S->R Segment Sync doc):
 * - LOCAL and APPROVED statuses show as pending changes (+ for create, - for delete)
 * - PENDING_UPLOAD shows as awaiting upload (blue dot)
 * - UPLOADED shows as successfully uploaded
 * - CONFLICT shows as conflict (event arrived too late)
 */
export function deriveChangeStatus(event?: TmsRequestEvent): ChangeStatus | null {
  if (!event) {
    return null;
  }

  // If event has CONFLICT status, show conflict indicator
  if (event.status === EventStatus.CONFLICT) {
    return ChangeStatus.CONFLICT;
  }

  // If event is uploaded, show uploaded status
  if (event.status === EventStatus.UPLOADED) {
    return ChangeStatus.UPLOADED;
  }

  // If event is pending upload, show pending upload status
  if (event.status === EventStatus.PENDING_UPLOAD) {
    return ChangeStatus.PENDING_UPLOAD;
  }

  // If event is local or approved (not yet exported to XML)
  // Per sync doc: "local → approved → pending_upload → uploaded"
  if (event.status === EventStatus.LOCAL || event.status === EventStatus.APPROVED) {
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
