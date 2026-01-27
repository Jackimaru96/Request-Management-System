import {
  Task,
  EventType,
  EventStatus,
  CollectionStatus,
  RequestType,
  Priority,
  TmsRequestEvent,
  CreateTaskApiPayload,
} from "../pages/RequestListingPage/types";
import { getAllTasks, updateTasks } from "./mockDb";
import { TmsApi, RevertResult } from "./tmsApi";

/**
 * Helper to create a latestEvent object without user/userGroup (per Task interface)
 */
function createLatestEvent(
  event: TmsRequestEvent
): Omit<TmsRequestEvent, "user" | "userGroup"> {
  return {
    _id: event._id,
    approvedBy: event.approvedBy,
    createdTime: event.createdTime,
    eventType: event.eventType,
    payload: event.payload,
    requestId: event.requestId,
    status: event.status,
    uploadedTime: event.uploadedTime,
    version: event.version,
  };
}

/**
 * Generate seed data for the mock database
 * Updated to match the new Task interface:
 * - All dates are ISO timestamp strings
 * - No depth or changeStatus (these are derived in UI)
 * - latestEvent excludes user/userGroup
 * - collectionStatus, colEndTime, estimatedColDurationMins use null for missing values
 */
export function seedTasks(): Task[] {
  return [
    // ====== CHANGES TAB: Tasks with APPROVED status (ready to export) ======

    // Task 1: CREATE with APPROVED status (+ indicator) - metrics-api.cloud/collection
    {
      id: "1",
      archived: false,
      url: "metrics-api.cloud/collection",
      requestType: RequestType.RECURRING,
      priority: Priority.HIGH,
      contentType: "PAGE",
      createdTime: "2026-01-15T10:00:00.000+08:00",
      userGroup: "analysts",
      version: 2,
      recurringFreqHours: 3,
      country: "Australia",
      zone: "W",
      latestEvent: createLatestEvent({
        _id: "evt-1-approved",
        requestId: "1",
        eventType: EventType.CREATE,
        status: EventStatus.APPROVED,
        payload: JSON.stringify({ action: "create" }),
        user: "user123",
        userGroup: "analysts",
        createdTime: "2026-01-15T10:00:00.000+08:00",
        version: 2,
        approvedBy: "SYSTEM-AUTO",
      }),
      user: "user123",
      collectionStatus: null,
      colEndTime: null,
      estimatedColDurationMins: null,
    },

    // Task 2: UPDATE with APPROVED status - climate-monitor.global/api/temp
    {
      id: "2",
      archived: false,
      url: "climate-monitor.global/api/temp",
      requestType: RequestType.ADHOC,
      priority: Priority.HIGH,
      contentType: "PAGE",
      createdTime: "2026-01-14T09:15:00.000+08:00",
      userGroup: "analysts",
      version: 3,
      backcrawlDepthDays: 2,
      country: "Germany",
      zone: "G",
      latestEvent: createLatestEvent({
        _id: "evt-2-approved",
        requestId: "2",
        eventType: EventType.UPDATE,
        status: EventStatus.APPROVED,
        payload: JSON.stringify({ action: "update" }),
        user: "user123",
        userGroup: "analysts",
        createdTime: "2026-01-14T09:15:00.000+08:00",
        version: 3,
        approvedBy: "SYSTEM-AUTO",
      }),
      user: "user123",
      collectionStatus: CollectionStatus.COLLECTING,
      colEndTime: "2026-01-14T09:15:00.000+08:00",
      estimatedColDurationMins: null,
    },

    // Task 3: DELETE with APPROVED status (- indicator) - weather-data.science/metrics
    {
      id: "3",
      archived: false,
      url: "weather-data.science/metrics",
      requestType: RequestType.RECURRING,
      priority: Priority.MEDIUM,
      contentType: "PAGE",
      createdTime: "2026-01-14T08:45:00.000+08:00",
      userGroup: "analysts",
      version: 3,
      recurringFreqHours: 2,
      country: "United Kingdom",
      zone: "-",
      latestEvent: createLatestEvent({
        _id: "evt-3-delete-approved",
        requestId: "3",
        eventType: EventType.DELETE,
        status: EventStatus.APPROVED,
        payload: JSON.stringify({ action: "delete" }),
        user: "user456",
        userGroup: "analysts",
        createdTime: "2026-01-14T08:45:00.000+08:00",
        version: 3,
        approvedBy: "SYSTEM-AUTO",
      }),
      user: "user456",
      collectionStatus: CollectionStatus.COMPLETED,
      colEndTime: "2026-01-14T08:45:00.000+08:00",
      estimatedColDurationMins: 45,
    },

    // ====== EXPORTS TAB: Tasks with PENDING_UPLOAD status (awaiting upload) ======

    // Task 4: PENDING_UPLOAD - global-climate.net/sensors
    {
      id: "4",
      archived: false,
      url: "global-climate.net/sensors",
      requestType: RequestType.RECURRING,
      priority: Priority.URGENT,
      contentType: "PAGE",
      createdTime: "2026-01-14T10:45:00.000+08:00",
      userGroup: "analysts",
      version: 3,
      recurringFreqHours: 1,
      country: "Singapore",
      zone: "R",
      latestEvent: createLatestEvent({
        _id: "evt-4-pending",
        requestId: "4",
        eventType: EventType.CREATE,
        status: EventStatus.PENDING_UPLOAD,
        payload: JSON.stringify({ action: "create" }),
        user: "user789",
        userGroup: "analysts",
        createdTime: "2026-01-14T10:45:00.000+08:00",
        version: 3,
      }),
      user: "user789",
      collectionStatus: null,
      colEndTime: null,
      estimatedColDurationMins: null,
    },

    // Task 5: PENDING_UPLOAD - environment-tracker.io/data
    {
      id: "5",
      archived: false,
      url: "environment-tracker.io/data",
      requestType: RequestType.RECURRING,
      priority: Priority.HIGH,
      contentType: "PAGE",
      createdTime: "2026-01-14T07:20:00.000+08:00",
      userGroup: "analysts",
      version: 3,
      recurringFreqHours: 4,
      backcrawlDepthDays: 3,
      country: "Japan",
      zone: "W",
      latestEvent: createLatestEvent({
        _id: "evt-5-pending",
        requestId: "5",
        eventType: EventType.CREATE,
        status: EventStatus.PENDING_UPLOAD,
        payload: JSON.stringify({ action: "create" }),
        user: "user456",
        userGroup: "analysts",
        createdTime: "2026-01-14T07:20:00.000+08:00",
        version: 3,
      }),
      user: "user456",
      collectionStatus: null,
      colEndTime: null,
      estimatedColDurationMins: null,
    },

    // Task 6: PENDING_UPLOAD - eco-sensors.worldwide/api (with date range)
    {
      id: "6",
      archived: false,
      url: "eco-sensors.worldwide/api",
      requestType: RequestType.LIVESTREAM,
      priority: Priority.MEDIUM,
      contentType: "LIVESTREAM",
      createdTime: "2026-01-14T05:30:00.000+08:00",
      userGroup: "analysts",
      version: 3,
      cutOffTime: "2026-01-31T23:59:59.000+08:00",
      backcrawlStartTime: "2026-01-01T00:00:00.000+08:00",
      backcrawlEndTime: "2026-01-31T00:00:00.000+08:00",
      country: "Canada",
      zone: "G",
      latestEvent: createLatestEvent({
        _id: "evt-6-pending",
        requestId: "6",
        eventType: EventType.CREATE,
        status: EventStatus.PENDING_UPLOAD,
        payload: JSON.stringify({ action: "create" }),
        user: "user123",
        userGroup: "analysts",
        createdTime: "2026-01-14T05:30:00.000+08:00",
        version: 3,
      }),
      user: "user123",
      collectionStatus: null,
      colEndTime: null,
      estimatedColDurationMins: null,
    },

    // ====== MAIN TABLE: Tasks with UPLOADED status (active in R-segment) ======

    // Task 7: UPLOADED - api.example.com/v1/climate-data
    {
      id: "7",
      archived: false,
      url: "api.example.com/v1/climate-data",
      requestType: RequestType.RECURRING,
      priority: Priority.URGENT,
      contentType: "PAGE",
      createdTime: "2026-01-14T10:30:00.000+08:00",
      userGroup: "analysts",
      version: 2,
      recurringFreqHours: 3,
      country: "United States",
      zone: "W",
      latestEvent: createLatestEvent({
        _id: "evt-7-uploaded",
        requestId: "7",
        eventType: EventType.CREATE,
        status: EventStatus.UPLOADED,
        payload: JSON.stringify({ action: "create" }),
        user: "user123",
        userGroup: "analysts",
        createdTime: "2026-01-14T10:30:00.000+08:00",
        uploadedTime: "2026-01-14T10:30:00.000+08:00",
        version: 2,
      }),
      user: "user123",
      collectionStatus: CollectionStatus.COMPLETED,
      colEndTime: "2026-01-14T10:30:00.000+08:00",
      estimatedColDurationMins: 120,
    },

    // Task 8: UPLOADED - temperature-monitor.io/latest
    {
      id: "8",
      archived: false,
      url: "temperature-monitor.io/latest",
      requestType: RequestType.RECURRING,
      priority: Priority.HIGH,
      contentType: "PAGE",
      createdTime: "2026-01-14T10:00:00.000+08:00",
      userGroup: "analysts",
      version: 2,
      recurringFreqHours: 2,
      country: "France",
      zone: "G",
      latestEvent: createLatestEvent({
        _id: "evt-8-uploaded",
        requestId: "8",
        eventType: EventType.CREATE,
        status: EventStatus.UPLOADED,
        payload: JSON.stringify({ action: "create" }),
        user: "user789",
        userGroup: "analysts",
        createdTime: "2026-01-14T10:00:00.000+08:00",
        uploadedTime: "2026-01-14T10:00:00.000+08:00",
        version: 2,
      }),
      user: "user789",
      collectionStatus: CollectionStatus.COLLECTING,
      colEndTime: "2026-01-14T10:00:00.000+08:00",
      estimatedColDurationMins: null,
    },

    // ====== CONFLICTS TAB: Task with CONFLICT status ======

    // Task 9: CONFLICT - data-hub.research.org/endpoints
    {
      id: "9",
      archived: false,
      url: "data-hub.research.org/endpoints",
      requestType: RequestType.ADHOC,
      priority: Priority.MEDIUM,
      contentType: "PAGE",
      createdTime: "2026-01-14T04:15:00.000+08:00",
      userGroup: "analysts",
      version: 3,
      backcrawlDepthDays: 2,
      country: "India",
      zone: "R",
      latestEvent: createLatestEvent({
        _id: "evt-9-conflict",
        requestId: "9",
        eventType: EventType.UPDATE,
        status: EventStatus.CONFLICT,
        payload: JSON.stringify({ action: "update" }),
        user: "user456",
        userGroup: "analysts",
        createdTime: "2026-01-14T04:15:00.000+08:00",
        uploadedTime: "2026-01-14T04:20:00.000+08:00",
        version: 3,
      }),
      user: "user456",
      collectionStatus: CollectionStatus.COMPLETED,
      colEndTime: "2026-01-14T06:30:00.000+08:00",
      estimatedColDurationMins: 120,
    },
  ];
}

// ID counter for generating new task IDs
let idCounter = 11;

// Simulate network latency
function simulateNetworkLatency(): Promise<void> {
  const delay = Math.floor(Math.random() * 400) + 200; // 200-600ms
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * List all tasks
 *
 * TODO: Update with real API
 * Endpoint: GET /api/tms/requests
 * Query params: None (could add pagination/filtering later)
 * Response: Task[]
 *
 * Response should be a composite view joining:
 * - TMS_Request (base request data)
 * - TMS_Request_Event (latest event per requestId)
 * - Col_Request (collection status from R-segment)
 *
 * Backend should:
 * 1. Query TMS_Request collection
 * 2. For each request, find latest TMS_Request_Event by requestId + max(createdTime)
 * 3. For each request, find latest Col_Request by requestId (if exists)
 * 4. Merge data into Task objects
 * 5. Derive changeStatus from latestEvent.eventType + status
 * 6. Derive depth from backcrawl fields
 */
export async function listTasks(): Promise<Task[]> {
  await simulateNetworkLatency();
  // Get tasks from MockDB (dates already revived)
  return getAllTasks();
}

/**
 * Create a new task with auto-approval (Stage 1 workflow)
 *
 * TODO: Update with real API
 * Endpoint: POST /api/tms/requests
 * Request body: CreateTaskApiPayload (all dates as ISO strings)
 * Expected backend payload shape:
 * {
 *   url: string,
 *   requestType: "ADHOC" | "RECURRING" | "LIVESTREAM",
 *   priority: 0 | 1 | 2 | 3,
 *   contentType?: string,
 *   backcrawlDepthDays?: number,
 *   backcrawlStartTime?: string (ISO),
 *   backcrawlEndTime?: string (ISO),
 *   country?: string,
 *   cutOffTime?: string (ISO),
 *   endCollectionTime?: string (ISO),
 *   isAlwaysRun?: boolean,
 *   isCollectPopularPostOnly?: boolean,
 *   platform?: string,
 *   recurringFreqHours?: number,
 *   startCollectionTime?: string (ISO),
 *   tags?: string[],
 *   title?: string,
 *   zone?: string
 * }
 * Returns: Task (with all dates as ISO strings)
 *
 * Stage 1 Workflow (per S->R Segment Sync doc):
 * 1. Create TMS_Request document with version=1
 * 2. Create TMS_Request_Event E1: eventType=CREATE, status=LOCAL, version=1
 * 3. Auto-approve: Create TMS_Request_Event E2: eventType=CREATE, status=APPROVED, version=2
 * 4. Return Task with latestEvent = E2 (APPROVED)
 */
export async function createTask(payload: CreateTaskApiPayload): Promise<Task> {
  await simulateNetworkLatency();

  const currentTime = new Date().toISOString();
  const currentUser = "current_user"; // TODO: Get from auth context
  const currentUserGroup = "default_group"; // TODO: Get from auth context

  idCounter = idCounter + 1;
  const taskId = `task-${idCounter}`;

  // Stage 1: Auto-approve - create APPROVED event (E2)
  const approvedEventId = `evt-${taskId}-approved`;
  const approvedEvent: TmsRequestEvent = {
    _id: approvedEventId,
    requestId: taskId,
    eventType: EventType.CREATE,
    status: EventStatus.APPROVED,
    payload: JSON.stringify({ action: "create", data: payload }),
    user: currentUser,
    userGroup: currentUserGroup,
    createdTime: currentTime,
    version: 2,
    approvedBy: "SYSTEM-AUTO",
  };

  const newTask: Task = {
    // From payload (all dates already ISO strings from mapper)
    url: payload.url,
    requestType: payload.requestType,
    priority: payload.priority,
    contentType: payload.contentType,
    backcrawlDepthDays: payload.backcrawlDepthDays,
    backcrawlStartTime: payload.backcrawlStartTime,
    backcrawlEndTime: payload.backcrawlEndTime,
    country: payload.country,
    cutOffTime: payload.cutOffTime,
    endCollectionTime: payload.endCollectionTime,
    isAlwaysRun: payload.isAlwaysRun,
    isCollectPopularPostOnly: payload.isCollectPopularPostOnly,
    platform: payload.platform,
    recurringFreqHours: payload.recurringFreqHours,
    startCollectionTime: payload.startCollectionTime,
    tags: payload.tags,
    title: payload.title,
    zone: payload.zone,

    // Generated by API
    id: taskId,
    createdTime: currentTime,
    user: currentUser,
    userGroup: currentUserGroup,
    version: 2,
    archived: false,

    // Latest event (without user/userGroup per Task interface)
    latestEvent: createLatestEvent(approvedEvent),

    // From Col_Request - no collection yet for new tasks
    collectionStatus: null,
    colEndTime: null,
    estimatedColDurationMins: null,
  };

  // Add to MockDB
  updateTasks((tasks) => [newTask, ...tasks]);

  return newTask;
}

/**
 * Update an existing task (creates a new event)
 * To be released in Milestone 2 - not part of Stage 1
 *
 * TODO: Update with real API
 * Endpoint: PATCH /api/tms/requests/:id
 * Request body: Partial<CreateTaskApiPayload>
 * Returns: Task
 */
export async function updateTask(
  id: string,
  patch: Partial<CreateTaskApiPayload>
): Promise<Task> {
  await simulateNetworkLatency();

  const tasks = getAllTasks();
  const taskIndex = tasks.findIndex((task: Task) => task.id === id);
  if (taskIndex === -1) {
    throw new Error(`Task with id ${id} not found`);
  }

  const currentTime = new Date().toISOString();
  const currentUser = "current_user"; // TODO: Get from auth context
  const currentUserGroup = "default_group"; // TODO: Get from auth context
  const eventId = `evt-update-${id}-${Date.now()}`;

  const existingTask = tasks[taskIndex];

  // Create update event
  const event: TmsRequestEvent = {
    _id: eventId,
    requestId: id,
    eventType: EventType.UPDATE,
    status: EventStatus.LOCAL,
    payload: JSON.stringify({ action: "update", data: patch }),
    user: currentUser,
    userGroup: currentUserGroup,
    createdTime: currentTime,
    version: existingTask.version + 1,
  };

  const updatedTask: Task = {
    ...existingTask,
    ...patch,
    version: existingTask.version + 1,
    latestEvent: createLatestEvent(event),
  };

  // Update in MockDB
  updateTasks((allTasks) => allTasks.map((task) => (task.id === id ? updatedTask : task)));

  return updatedTask;
}

/**
 * Delete a task (creates a DELETE event)
 * Single task version - used internally
 *
 * TODO: Update with real API
 * Endpoint: DELETE /api/tms/requests/:id
 * Returns: void
 */
export async function deleteTask(id: string): Promise<void> {
  await simulateNetworkLatency();

  const tasks = getAllTasks();
  const taskIndex = tasks.findIndex((task: Task) => task.id === id);
  if (taskIndex === -1) {
    throw new Error(`Task with id ${id} not found`);
  }

  const currentTime = new Date().toISOString();
  const currentUser = "current_user"; // TODO: Get from auth context
  const currentUserGroup = "default_group"; // TODO: Get from auth context

  const existingTask = tasks[taskIndex];

  // Stage 1: Auto-approve - create APPROVED delete event
  const approvedEventId = `evt-delete-${id}-approved-${Date.now()}`;
  const approvedEvent: TmsRequestEvent = {
    _id: approvedEventId,
    requestId: id,
    eventType: EventType.DELETE,
    status: EventStatus.APPROVED,
    payload: JSON.stringify({ action: "delete" }),
    user: currentUser,
    userGroup: currentUserGroup,
    createdTime: currentTime,
    version: existingTask.version + 2,
    approvedBy: "SYSTEM-AUTO",
  };

  // Update task with approved delete event
  const updatedTask: Task = {
    ...existingTask,
    version: existingTask.version + 2,
    latestEvent: createLatestEvent(approvedEvent),
  };

  // Update in MockDB
  updateTasks((allTasks) => allTasks.map((task) => (task.id === id ? updatedTask : task)));
}

/**
 * Delete multiple tasks (creates DELETE events for each)
 *
 * Stage 1 Workflow (per S->R Segment Sync doc):
 * - Only processes tasks with PENDING_UPLOAD or UPLOADED status
 * - Creates DELETE event with LOCAL status, then auto-approves to APPROVED
 * - Skips tasks that already have DELETE events
 *
 * TODO: Update with real API
 * Endpoint: POST /api/tms/events/bulk-delete
 * Request body: { taskIds: string[] }
 * Response: void (204 No Content)
 */
export async function deleteSelectedTasks(taskIds: string[]): Promise<void> {
  await simulateNetworkLatency();

  const currentTime = new Date().toISOString();
  const currentUser = "current_user"; // TODO: Get from auth context
  const currentUserGroup = "default_group"; // TODO: Get from auth context

  updateTasks((allTasks) =>
    allTasks.map((task) => {
      // Only process tasks in the selected IDs
      if (!taskIds.includes(task.id)) {
        return task;
      }

      // Skip if already deleted (avoid duplicate DELETE events)
      if (task.latestEvent.eventType === EventType.DELETE) {
        return task;
      }

      // Stage 1 validation: Only allow deletion for PENDING_UPLOAD or UPLOADED tasks
      const latestStatus = task.latestEvent.status;
      if (latestStatus !== EventStatus.PENDING_UPLOAD && latestStatus !== EventStatus.UPLOADED) {
        return task;
      }

      // Stage 1: Auto-approve - create APPROVED delete event
      const approvedEventId = `evt-delete-${task.id}-approved-${Date.now()}`;
      const approvedEvent: TmsRequestEvent = {
        _id: approvedEventId,
        requestId: task.id,
        eventType: EventType.DELETE,
        status: EventStatus.APPROVED,
        payload: JSON.stringify({ action: "delete" }),
        user: currentUser,
        userGroup: currentUserGroup,
        createdTime: currentTime,
        version: task.version + 2,
        approvedBy: "SYSTEM-AUTO",
      };

      // Update task with approved delete event
      return {
        ...task,
        version: task.version + 2,
        latestEvent: createLatestEvent(approvedEvent),
      };
    }),
  );
}

/**
 * Revert selected tasks (discard local/approved changes)
 *
 * Stage 1 Workflow:
 * - For newly created tasks with only LOCAL/APPROVED events: hard delete
 * - For Stage 1, since we only have CREATE, revert means removing the task entirely
 *
 * TODO: Update with real API
 * Endpoint: POST /api/tms/requests/revert
 * Request body: { requestIds: string[] }
 * Response: { revertedRequestIds: string[] }
 */
export async function revertSelectedTasks(taskIds: string[]): Promise<RevertResult> {
  await simulateNetworkLatency();

  const revertedRequestIds: string[] = [];

  updateTasks((allTasks) => {
    return allTasks.filter((task) => {
      // Keep tasks not in the selection
      if (!taskIds.includes(task.id)) {
        return true;
      }

      // Check if task can be reverted
      // Per sync doc: can only revert if status is LOCAL or APPROVED
      const latestStatus = task.latestEvent.status;
      if (latestStatus === EventStatus.LOCAL || latestStatus === EventStatus.APPROVED) {
        // Task is eligible for revert - remove it (hard delete)
        revertedRequestIds.push(task.id);
        return false; // Remove from list
      }

      // Task has PENDING_UPLOAD or UPLOADED status - cannot revert
      return true; // Keep in list
    });
  });

  return { revertedRequestIds };
}

/**
 * Hard delete tasks (remove from database entirely)
 *
 * Used for:
 * - Revert operations when task has only LOCAL/APPROVED events
 * - Per sync doc principle #7.2: "If all the previous events are local, hard delete without approval"
 *
 * TODO: Update with real API
 * Endpoint: DELETE /api/tms/requests
 * Request body: { requestIds: string[] }
 * Response: { deleted: true }
 */
export async function hardDeleteTasks(taskIds: string[]): Promise<void> {
  await simulateNetworkLatency();

  updateTasks((allTasks) => allTasks.filter((task) => !taskIds.includes(task.id)));
}

/**
 * Mark tasks with APPROVED events as PENDING_UPLOAD
 * This happens after XML export/commit
 *
 * Stage 1 Workflow:
 * - Only processes tasks with APPROVED status (per sync doc)
 * - Creates new event with same eventType but status=PENDING_UPLOAD
 *
 * TODO: Update with real API
 * Endpoint: POST /api/tms/events/mark-pending-upload
 * Request body: { taskIds: string[] }
 * Response: void (204 No Content)
 */
export async function markTasksAsPendingUpload(taskIds: string[]): Promise<void> {
  await simulateNetworkLatency();

  const currentTime = new Date().toISOString();

  updateTasks((allTasks) =>
    allTasks.map((task) => {
      if (!taskIds.includes(task.id)) {
        return task;
      }

      // Only update tasks that have LOCAL or APPROVED events
      if (
        task.latestEvent.status !== EventStatus.LOCAL &&
        task.latestEvent.status !== EventStatus.APPROVED
      ) {
        return task;
      }

      // Create new PENDING_UPLOAD event (latestEvent already excludes user/userGroup)
      const newEventId = `evt-pending-${task.id}-${Date.now()}`;
      const newLatestEvent: Omit<TmsRequestEvent, "user" | "userGroup"> = {
        ...task.latestEvent,
        _id: newEventId,
        status: EventStatus.PENDING_UPLOAD,
        version: task.version + 1,
        createdTime: currentTime,
      };

      // Update task with new event
      return {
        ...task,
        version: task.version + 1,
        latestEvent: newLatestEvent,
      };
    }),
  );
}

/**
 * Mark tasks with PENDING_UPLOAD events as UPLOADED
 * This simulates successful R-segment upload feedback
 * DevTools utility for testing
 *
 * Special handling:
 * - Tasks with DELETE eventType are removed from database
 * - Tasks with CREATE/UPDATE eventType are marked as UPLOADED
 *
 * TODO: Update with real API (DevTools only)
 * Endpoint: POST /api/devtools/simulate-upload
 * Request body: None
 * Response: { updatedRequestIds: string[], createdEvents: number }
 */
export async function markPendingUploadAsUploaded(): Promise<{
  updatedRequestIds: string[];
  createdEvents: number;
}> {
  await simulateNetworkLatency();

  const currentTime = new Date().toISOString();
  const updatedRequestIds: string[] = [];
  let createdEvents = 0;

  updateTasks((allTasks) => {
    const processedTasks: Task[] = [];

    for (const task of allTasks) {
      // Only process tasks that have PENDING_UPLOAD events
      if (task.latestEvent.status !== EventStatus.PENDING_UPLOAD) {
        processedTasks.push(task);
        continue;
      }

      // If the event is DELETE, remove the task from the database
      if (task.latestEvent.eventType === EventType.DELETE) {
        updatedRequestIds.push(task.id);
        createdEvents++;
        // Skip adding this task (effectively deletes it)
        continue;
      }

      // For CREATE/UPDATE events, create new UPLOADED event
      const newEventId = `evt-uploaded-${task.id}-${Date.now()}`;
      const newLatestEvent: Omit<TmsRequestEvent, "user" | "userGroup"> = {
        ...task.latestEvent,
        _id: newEventId,
        status: EventStatus.UPLOADED,
        version: task.version + 1,
        createdTime: currentTime,
        uploadedTime: currentTime,
      };

      // Track this update
      updatedRequestIds.push(task.id);
      createdEvents++;

      // Update task with new event
      processedTasks.push({
        ...task,
        version: task.version + 1,
        latestEvent: newLatestEvent,
      });
    }

    return processedTasks;
  });

  return { updatedRequestIds, createdEvents };
}

/**
 * Export selected tasks to XML payload
 * Simulates backend API call that returns task data for selected IDs
 * This is used for ad-hoc "Download Selected XML" feature
 *
 * TODO: Update with real API
 * Endpoint: POST /api/tms/export/selected
 * Request body: { taskIds: string[] }
 * Response: { tasks: Task[] }
 *
 * Backend should:
 * 1. Query TMS_Request documents by _id in taskIds array
 * 2. For each request, find latest TMS_Request_Event
 * 3. For each request, find latest Col_Request (if exists)
 * 4. Merge data into Task objects (same structure as listTasks)
 * 5. Return array of Task objects
 *
 * IMPORTANT: This is READ-ONLY - do NOT modify event statuses
 * This endpoint is for ad-hoc XML export without affecting workflow state
 */
export async function exportTasksToXmlPayload(taskIds: string[]): Promise<{ tasks: Task[] }> {
  // Simulate network latency (200-800ms)
  const delay = Math.floor(Math.random() * 600) + 200;
  await new Promise((resolve) => setTimeout(resolve, delay));

  // Get all tasks from database
  const allTasks = getAllTasks();

  // Filter tasks by the provided IDs
  const selectedTasks = allTasks.filter((task) => taskIds.includes(task.id));

  // Return in expected JSON structure
  return { tasks: selectedTasks };
}

// Export as TmsApi interface implementation
export const mockApi: TmsApi = {
  listTasks,
  createTask,
  markTasksAsPendingUpload,
  exportTasksToXmlPayload,
  deleteSelectedTasks,
  revertSelectedTasks,
  hardDeleteTasks,
  markPendingUploadAsUploaded,
};
