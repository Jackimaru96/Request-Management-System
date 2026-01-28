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
// COLLECTION DATA (from R-Segment)
// ========================================

/**
 * Col_Request data from R-Segment
 * Represents the collection status and timing information
 * NOTE: colEndTime is an ISO timestamp string from the API
 */
export interface ColRequestData {
  status?: CollectionStatus;
  colEndTime?: string; // ISO timestamp
  estimatedColDurationMins?: number;
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
// NOTE: These are UI-derived types, NOT stored in the API response
export type DepthLastHours = {
  type: DepthType.LAST_HOURS;
  hours: 2; // Always 2 hours
};

export type DepthLastDays = {
  type: DepthType.LAST_DAYS;
  days: number; // Derived from backcrawlDepthHours (hours / 24)
};

export type DepthDateRange = {
  type: DepthType.DATE_RANGE;
  startDate: string; // ISO timestamp - derived from backcrawlStartTime
  endDate?: string; // ISO timestamp - derived from backcrawlEndTime
};

export type Depth = DepthLastHours | DepthLastDays | DepthDateRange;

/**
 * TMS_Request document - represents the current state of a task request in S-Segment
 * This is a single document per request that gets updated in place.
 * This is the PERSISTED domain model matching the ERD.
 * All date/time fields are ISO timestamp strings from the backend API.
 */
export interface TmsRequest {
  _id: string; // Unique UUID for the request
  archived: boolean; // Whether the request is archived (soft delete)
  backcrawlDepthHours?: number; // in hours (for "Last X days", stores days * 24)
  backcrawlEndTime?: string; // ISO timestamp
  backcrawlStartTime?: string; // ISO timestamp
  contentType: ContentType;
  country?: string;
  createdTime: string; // ISO timestamp
  cutOffTime?: string; // ISO timestamp - for LIVESTREAM
  endCollectionTime?: string; // ISO timestamp - for RECURRING
  isAlwaysRun?: boolean;
  isCollectPopularPostOnly?: boolean;
  platform?: Platform;
  priority: Priority;
  recurringFreqHours?: number; // in hours
  requestType: RequestType;
  startCollectionTime?: string; // ISO timestamp
  tags?: string[];
  title?: string;
  url: string;
  userGroup: string;
  version: number; // Increments with each event
  zone: string;
}

/**
 * TMS_Request_Event document - append-only log of all actions on a request in S-Segment
 * Multiple events can exist for the same requestId.
 * This is the PERSISTED domain model matching the ERD.
 * All date/time fields are ISO timestamp strings from the backend API.
 */
export interface TmsRequestEvent {
  _id: string; // Unique UUID for this event
  approvedBy?: string; // User who approved (or "SYSTEM-AUTO")
  createdTime: string; // ISO timestamp
  eventType: EventType; // CREATE, UPDATE, DELETE, PAUSE, RESUME
  payload: string; // Stringified JSON of request fields for XML export
  requestId: string; // Links to TmsRequest._id
  status: EventStatus; // LOCAL, APPROVED, PENDING_UPLOAD, UPLOADED, CONFLICT
  uploadedTime?: string; // ISO timestamp - When event was uploaded (only set when status is UPLOADED)
  user: string; // User who created this event
  userGroup: string;
  version: number; // Version of the request at time of this event
}

// ========================================
// TASK (API Response Shape)
// ========================================

/**
 * Task - API response object combining TMS_Request, latest TmsRequestEvent, and Col_Request data.
 * This represents the data returned from the backend API.
 * All date/time fields are ISO timestamp strings.
 *
 * IMPORTANT: This interface does NOT contain UI-derived fields (depth, changeStatus).
 * Use deriveDepthFromTask() and deriveChangeStatus() for UI display.
 */
export interface Task {
  // From TMS_Request
  id: string; // TMS_Request._id
  archived: boolean;
  url: string;
  requestType: RequestType;
  priority: Priority;
  contentType?: string;
  createdTime: string; // ISO timestamp
  userGroup: string;
  version: number;

  // Optional fields from TMS_Request (all dates are ISO timestamps)
  backcrawlDepthHours?: number; // in hours (for "Last X days", stores days * 24)
  backcrawlStartTime?: string; // ISO timestamp
  backcrawlEndTime?: string; // ISO timestamp
  country?: string;
  cutOffTime?: string; // ISO timestamp
  endCollectionTime?: string; // ISO timestamp
  isAlwaysRun?: boolean;
  isCollectPopularPostOnly?: boolean;
  platform?: Platform;
  recurringFreqHours?: number;
  startCollectionTime?: string; // ISO timestamp
  tags?: string[];
  title?: string;
  zone?: string;

  // From latest TmsRequestEvent (user/userGroup omitted, available at top level)
  latestEvent: Omit<TmsRequestEvent, "user" | "userGroup">;
  user: string; // From latest event

  // From Col_Request (most recent collection in R-Segment)
  collectionStatus: CollectionStatus | null;
  colEndTime: string | null; // ISO timestamp
  estimatedColDurationMins: number | null;
}

/**
 * CreateTaskFormInput - Input type from UI forms that may contain Date objects.
 * This is used internally by UI components before conversion to API format.
 * All date fields can be Date objects which will be converted to ISO strings.
 */
export type CreateTaskFormInput = {
  url: string;
  requestType: RequestType;
  priority: Priority;
  contentType?: string;

  // Optional fields - dates are Date objects from UI pickers
  backcrawlDepthHours?: number; // in hours (for "Last X days", UI converts days * 24)
  backcrawlStartTime?: Date;
  backcrawlEndTime?: Date;
  country?: string;
  cutOffTime?: Date;
  endCollectionTime?: Date;
  isAlwaysRun?: boolean;
  isCollectPopularPostOnly?: boolean;
  platform?: Platform;
  recurringFreqHours?: number;
  startCollectionTime?: Date;
  tags?: string[];
  title?: string;
  zone?: string;
};

/**
 * CreateTaskApiPayload - Payload sent to the createTask API.
 * All date fields are ISO timestamp strings.
 * This is what crosses the API boundary.
 */
export type CreateTaskApiPayload = {
  url: string;
  requestType: RequestType;
  priority: Priority;
  contentType?: string;

  // Optional fields - all dates are ISO strings
  backcrawlDepthHours?: number; // in hours (for "Last X days", stores days * 24)
  backcrawlStartTime?: string; // ISO timestamp
  backcrawlEndTime?: string; // ISO timestamp
  country?: string;
  cutOffTime?: string; // ISO timestamp
  endCollectionTime?: string; // ISO timestamp
  isAlwaysRun?: boolean;
  isCollectPopularPostOnly?: boolean;
  platform?: Platform;
  recurringFreqHours?: number;
  startCollectionTime?: string; // ISO timestamp
  tags?: string[];
  title?: string;
  zone?: string;
};

/**
 * Maps a CreateTaskFormInput (with Date objects) to CreateTaskApiPayload (with ISO strings).
 * This is the SINGLE place where Date → ISO conversion happens for task creation.
 *
 * @param input - Form input with Date objects
 * @returns API payload with ISO timestamp strings
 */
export function mapCreateTaskFormToApi(input: CreateTaskFormInput): CreateTaskApiPayload {
  return {
    url: input.url,
    requestType: input.requestType,
    priority: input.priority,
    contentType: input.contentType,

    // Convert Date objects to ISO strings
    backcrawlDepthHours: input.backcrawlDepthHours,
    backcrawlStartTime: input.backcrawlStartTime?.toISOString(),
    backcrawlEndTime: input.backcrawlEndTime?.toISOString(),
    country: input.country,
    cutOffTime: input.cutOffTime?.toISOString(),
    endCollectionTime: input.endCollectionTime?.toISOString(),
    isAlwaysRun: input.isAlwaysRun,
    isCollectPopularPostOnly: input.isCollectPopularPostOnly,
    platform: input.platform,
    recurringFreqHours: input.recurringFreqHours,
    startCollectionTime: input.startCollectionTime?.toISOString(),
    tags: input.tags,
    title: input.title,
    zone: input.zone,
  };
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
  a?: number; // backcrawlDepthHours (int, in hours)
  b?: number; // backcrawlEndTime (epoch milliseconds)
  c?: number; // backcrawlStartTime (epoch milliseconds)
  d?: number; // cutOffTime (epoch milliseconds)
  e?: string; // contentType (string)
  f?: number; // endCollectionTime (epoch milliseconds)
  g?: number; // isAlwaysRun (0 or 1)
  h?: number; // isCollectPopularPostOnly (0 or 1)
  j: number; // priority (enum value 0-3)
  k?: number; // recurringFreqHours (hours as int)
  m: string; // requestType (enum value as string: ADHOC/RECURRING/LIVESTREAM)
  n?: number; // startCollectionTime (epoch milliseconds)
  p: string; // url (string)
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Minimal event fields needed to derive change status
 * Works with both full TmsRequestEvent and the latestEvent in Task (which omits user/userGroup)
 */
interface EventForChangeStatus {
  eventType: EventType;
  status: EventStatus;
}

/**
 * Helper function to derive ChangeStatus from an event
 * This determines which visual indicator to show in the UI
 *
 * Stage 1 Workflow (per S->R Segment Sync doc):
 * - LOCAL and APPROVED statuses show as pending changes (+ for create, - for delete)
 * - PENDING_UPLOAD shows as awaiting upload (blue dot)
 * - UPLOADED shows as successfully uploaded
 * - CONFLICT shows as conflict (event arrived too late)
 *
 * @param event - Event object with eventType and status (can be full TmsRequestEvent or latestEvent from Task)
 */
export function deriveChangeStatus(event?: EventForChangeStatus | null): ChangeStatus | null {
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

/**
 * Input for deriving depth from backcrawl fields.
 * Works with both Task and TmsRequest since both have these optional fields.
 */
interface BackcrawlFields {
  backcrawlDepthHours?: number; // in hours (for "Last X days", stores days * 24)
  backcrawlStartTime?: string; // ISO timestamp
  backcrawlEndTime?: string; // ISO timestamp
}

/**
 * Helper function to derive Depth from backcrawl fields.
 * Determines the depth type based on which fields are set.
 * Works with Task objects that have ISO timestamp strings.
 *
 * @param fields - Object containing backcrawl fields (from Task or TmsRequest)
 * @returns Depth discriminated union for UI display
 */
export function deriveDepthFromTask(fields: BackcrawlFields): Depth {
  // If backcrawlStartTime is set, it's a date range
  if (fields.backcrawlStartTime) {
    return {
      type: DepthType.DATE_RANGE,
      startDate: fields.backcrawlStartTime, // Already ISO string
      endDate: fields.backcrawlEndTime, // Already ISO string
    };
  }

  // If backcrawlDepthHours is set, it's last N days (stored as hours, convert back to days)
  if (fields.backcrawlDepthHours !== undefined && fields.backcrawlDepthHours > 0) {
    return {
      type: DepthType.LAST_DAYS,
      days: Math.round(fields.backcrawlDepthHours / 24), // Convert hours back to days for display
    };
  }

  // Default to last 2 hours
  return {
    type: DepthType.LAST_HOURS,
    hours: 2,
  };
}

/**
 * @deprecated Use deriveDepthFromTask instead
 */
export const deriveDepthFromRequest = deriveDepthFromTask;

/**
 * Mapper function to create a Task API response object from domain models.
 * Combines TmsRequest, its events, and optional collection data into a unified API response.
 *
 * NOTE: This function is used by the mock API to create Task objects.
 * The real backend API would return this shape directly.
 *
 * @param request - The TMS_Request document
 * @param events - All TMS_Request_Event documents for this request (sorted by createdTime desc)
 * @param colData - Optional collection data from R-Segment
 * @returns Task object matching API response shape (no derived fields)
 */
export function toTaskFromDomainModels(
  request: TmsRequest,
  events: TmsRequestEvent[],
  colData?: ColRequestData
): Task {
  // Get the latest event (events should be sorted by createdTime desc)
  // Task requires latestEvent, so we need at least one event
  const latestEvent = events[0];
  if (!latestEvent) {
    throw new Error(`Task ${request._id} has no events`);
  }

  // Derive the user from the latest event
  const user = latestEvent.user;

  // Create latestEvent without user/userGroup (they're at top level)
  const latestEventForTask: Omit<TmsRequestEvent, "user" | "userGroup"> = {
    _id: latestEvent._id,
    approvedBy: latestEvent.approvedBy,
    createdTime: latestEvent.createdTime,
    eventType: latestEvent.eventType,
    payload: latestEvent.payload,
    requestId: latestEvent.requestId,
    status: latestEvent.status,
    uploadedTime: latestEvent.uploadedTime,
    version: latestEvent.version,
  };

  return {
    // Core identity
    id: request._id,
    archived: request.archived,
    url: request.url,
    requestType: request.requestType,
    priority: request.priority,
    contentType: request.contentType,
    createdTime: request.createdTime,
    userGroup: request.userGroup,
    version: request.version,

    // Optional fields from request (all ISO strings)
    backcrawlDepthHours: request.backcrawlDepthHours,
    backcrawlStartTime: request.backcrawlStartTime,
    backcrawlEndTime: request.backcrawlEndTime,
    country: request.country,
    cutOffTime: request.cutOffTime,
    endCollectionTime: request.endCollectionTime,
    isAlwaysRun: request.isAlwaysRun,
    isCollectPopularPostOnly: request.isCollectPopularPostOnly,
    platform: request.platform,
    recurringFreqHours: request.recurringFreqHours,
    startCollectionTime: request.startCollectionTime,
    tags: request.tags,
    title: request.title,
    zone: request.zone,

    // From latest event
    latestEvent: latestEventForTask,
    user,

    // From collection data (use null for missing values per API contract)
    collectionStatus: colData?.status ?? null,
    colEndTime: colData?.colEndTime ?? null,
    estimatedColDurationMins: colData?.estimatedColDurationMins ?? null,
  };
}

/**
 * @deprecated Use toTaskFromDomainModels instead
 */
export const toTaskViewModel = toTaskFromDomainModels;
