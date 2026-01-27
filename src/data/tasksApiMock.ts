import {
  Task,
  EventType,
  EventStatus,
  CollectionStatus,
  RequestType,
  Priority,
  DepthType,
  deriveChangeStatus,
  ChangeStatus,
  TmsRequestEvent,
} from "../pages/RequestListingPage/types";
import { getAllTasks, updateTasks } from "./mockDb";
import { TmsApi, RevertResult } from "./tmsApi";

/**
 * Generate seed data for the mock database
 * Updated to match the mockup screenshots with:
 * - Zone field
 * - Correct statuses per Stage 1 workflow
 * - Mix of APPROVED (Changes tab), PENDING_UPLOAD (Exports tab), UPLOADED, CONFLICT
 */
export function seedTasks(): Task[] {
  return [
    // ====== CHANGES TAB: Tasks with APPROVED status (ready to export) ======
    // These show in Review Updates → Changes tab with + or - indicators

    // Task 1: CREATE with APPROVED status (+ indicator) - metrics-api.cloud/collection
    {
      id: "1",
      url: "metrics-api.cloud/collection",
      requestType: RequestType.RECURRING,
      priority: Priority.HIGH,
      contentType: "post",
      createdTime: new Date("2026-01-15T10:00:00"),
      userGroup: "analysts",
      version: 2,
      recurringFreqHours: 3,
      country: "Australia",
      zone: "W",
      depth: { type: DepthType.LAST_HOURS, hours: 2 },
      latestEvent: {
        _id: "evt-1-approved",
        requestId: "1",
        eventType: EventType.CREATE,
        status: EventStatus.APPROVED,
        payload: JSON.stringify({ action: "create" }),
        user: "user123",
        userGroup: "analysts",
        createdTime: new Date("2026-01-15T10:00:00"),
        uploadedTime: new Date("2026-01-15T10:00:00"),
        version: 2,
        approvedBy: "SYSTEM-AUTO",
      },
      user: "user123",
      collectionStatus: undefined,
      colEndTime: undefined,
      estimatedColDurationMins: undefined,
      changeStatus: ChangeStatus.ADDED,
    },

    // Task 2: UPDATE with APPROVED status (pencil/edit indicator) - climate-monitor.global/api/temp
    {
      id: "2",
      url: "climate-monitor.global/api/temp",
      requestType: RequestType.ADHOC,
      priority: Priority.HIGH,
      contentType: "post",
      createdTime: new Date("2026-01-14T09:15:00"),
      userGroup: "analysts",
      version: 3,
      country: "Germany",
      zone: "G",
      depth: { type: DepthType.LAST_DAYS, days: 2 },
      latestEvent: {
        _id: "evt-2-approved",
        requestId: "2",
        eventType: EventType.UPDATE,
        status: EventStatus.APPROVED,
        payload: JSON.stringify({ action: "update" }),
        user: "user123",
        userGroup: "analysts",
        createdTime: new Date("2026-01-14T09:15:00"),
        uploadedTime: new Date("2026-01-14T09:15:00"),
        version: 3,
        approvedBy: "SYSTEM-AUTO",
      },
      user: "user123",
      collectionStatus: CollectionStatus.COLLECTING,
      colEndTime: new Date("2026-01-14T09:15:00"),
      estimatedColDurationMins: undefined,
      changeStatus: ChangeStatus.ADDED,
    },

    // Task 3: DELETE with APPROVED status (- indicator) - weather-data.science/metrics
    {
      id: "3",
      url: "weather-data.science/metrics",
      requestType: RequestType.RECURRING,
      priority: Priority.MEDIUM,
      contentType: "post",
      createdTime: new Date("2026-01-14T08:45:00"),
      userGroup: "analysts",
      version: 3,
      recurringFreqHours: 2,
      country: "United Kingdom",
      zone: "-",
      depth: { type: DepthType.LAST_HOURS, hours: 2 },
      latestEvent: {
        _id: "evt-3-delete-approved",
        requestId: "3",
        eventType: EventType.DELETE,
        status: EventStatus.APPROVED,
        payload: JSON.stringify({ action: "delete" }),
        user: "user456",
        userGroup: "analysts",
        createdTime: new Date("2026-01-14T08:45:00"),
        uploadedTime: new Date("2026-01-14T08:45:00"),
        version: 3,
        approvedBy: "SYSTEM-AUTO",
      },
      user: "user456",
      collectionStatus: CollectionStatus.COMPLETED,
      colEndTime: new Date("2026-01-14T08:45:00"),
      estimatedColDurationMins: 45,
      changeStatus: ChangeStatus.DELETED,
    },

    // ====== EXPORTS TAB: Tasks with PENDING_UPLOAD status (awaiting upload) ======
    // These show in Review Updates → Exports tab

    // Task 4: PENDING_UPLOAD - global-climate.net/sensors
    {
      id: "4",
      url: "global-climate.net/sensors",
      requestType: RequestType.RECURRING,
      priority: Priority.URGENT,
      contentType: "post",
      createdTime: new Date("2026-01-14T10:45:00"),
      userGroup: "analysts",
      version: 3,
      recurringFreqHours: 1,
      country: "Singapore",
      zone: "R",
      depth: { type: DepthType.LAST_HOURS, hours: 2 },
      latestEvent: {
        _id: "evt-4-pending",
        requestId: "4",
        eventType: EventType.CREATE,
        status: EventStatus.PENDING_UPLOAD,
        payload: JSON.stringify({ action: "create" }),
        user: "user789",
        userGroup: "analysts",
        createdTime: new Date("2026-01-14T10:45:00"),
        uploadedTime: new Date("2026-01-14T10:45:00"),
        version: 3,
      },
      user: "user789",
      collectionStatus: undefined,
      colEndTime: undefined,
      estimatedColDurationMins: undefined,
      changeStatus: ChangeStatus.PENDING_UPLOAD,
    },

    // Task 5: PENDING_UPLOAD - environment-tracker.io/data
    {
      id: "5",
      url: "environment-tracker.io/data",
      requestType: RequestType.RECURRING,
      priority: Priority.HIGH,
      contentType: "post",
      createdTime: new Date("2026-01-14T07:20:00"),
      userGroup: "analysts",
      version: 3,
      recurringFreqHours: 4,
      country: "Japan",
      zone: "W",
      depth: { type: DepthType.LAST_DAYS, days: 3 },
      latestEvent: {
        _id: "evt-5-pending",
        requestId: "5",
        eventType: EventType.CREATE,
        status: EventStatus.PENDING_UPLOAD,
        payload: JSON.stringify({ action: "create" }),
        user: "user456",
        userGroup: "analysts",
        createdTime: new Date("2026-01-14T07:20:00"),
        uploadedTime: new Date("2026-01-14T07:20:00"),
        version: 3,
      },
      user: "user456",
      collectionStatus: undefined,
      colEndTime: undefined,
      estimatedColDurationMins: undefined,
      changeStatus: ChangeStatus.PENDING_UPLOAD,
    },

    // Task 6: PENDING_UPLOAD - eco-sensors.worldwide/api
    {
      id: "6",
      url: "eco-sensors.worldwide/api",
      requestType: RequestType.LIVESTREAM,
      priority: Priority.MEDIUM,
      contentType: "post",
      createdTime: new Date("2026-01-14T05:30:00"),
      userGroup: "analysts",
      version: 3,
      cutOffTime: new Date("2026-01-31T23:59:59"),
      country: "Canada",
      zone: "G",
      depth: {
        type: DepthType.DATE_RANGE,
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-01-31"),
      },
      latestEvent: {
        _id: "evt-6-pending",
        requestId: "6",
        eventType: EventType.CREATE,
        status: EventStatus.PENDING_UPLOAD,
        payload: JSON.stringify({ action: "create" }),
        user: "user123",
        userGroup: "analysts",
        createdTime: new Date("2026-01-14T05:30:00"),
        uploadedTime: new Date("2026-01-14T05:30:00"),
        version: 3,
      },
      user: "user123",
      collectionStatus: undefined,
      colEndTime: undefined,
      estimatedColDurationMins: undefined,
      changeStatus: ChangeStatus.PENDING_UPLOAD,
    },

    // ====== MAIN TABLE: Tasks with UPLOADED status (active in R-segment) ======

    // Task 7: UPLOADED with warning indicator - api.example.com/v1/climate-data
    {
      id: "7",
      url: "api.example.com/v1/climate-data",
      requestType: RequestType.RECURRING,
      priority: Priority.URGENT,
      contentType: "post",
      createdTime: new Date("2026-01-14T10:30:00"),
      userGroup: "analysts",
      version: 2,
      recurringFreqHours: 3,
      country: "United States",
      zone: "W",
      depth: { type: DepthType.LAST_HOURS, hours: 2 },
      latestEvent: {
        _id: "evt-7-uploaded",
        requestId: "7",
        eventType: EventType.CREATE,
        status: EventStatus.UPLOADED,
        payload: JSON.stringify({ action: "create" }),
        user: "user123",
        userGroup: "analysts",
        createdTime: new Date("2026-01-14T10:30:00"),
        uploadedTime: new Date("2026-01-14T10:30:00"),
        version: 2,
      },
      user: "user123",
      collectionStatus: CollectionStatus.COMPLETED,
      colEndTime: new Date("2026-01-14T10:30:00"),
      estimatedColDurationMins: 120,
      changeStatus: ChangeStatus.UPLOADED,
    },

    // Task 8: UPLOADED - temperature-monitor.io/latest
    {
      id: "8",
      url: "temperature-monitor.io/latest",
      requestType: RequestType.RECURRING,
      priority: Priority.HIGH,
      contentType: "post",
      createdTime: new Date("2026-01-14T10:00:00"),
      userGroup: "analysts",
      version: 2,
      recurringFreqHours: 2,
      country: "France",
      zone: "G",
      depth: { type: DepthType.LAST_HOURS, hours: 2 },
      latestEvent: {
        _id: "evt-8-uploaded",
        requestId: "8",
        eventType: EventType.CREATE,
        status: EventStatus.UPLOADED,
        payload: JSON.stringify({ action: "create" }),
        user: "user789",
        userGroup: "analysts",
        createdTime: new Date("2026-01-14T10:00:00"),
        uploadedTime: new Date("2026-01-14T10:00:00"),
        version: 2,
      },
      user: "user789",
      collectionStatus: CollectionStatus.COLLECTING,
      colEndTime: new Date("2026-01-14T10:00:00"),
      estimatedColDurationMins: undefined,
      changeStatus: ChangeStatus.UPLOADED,
    },

    // ====== CONFLICTS TAB: Task with CONFLICT status ======

    // Task 9: CONFLICT - data-hub.research.org/endpoints
    {
      id: "9",
      url: "data-hub.research.org/endpoints",
      requestType: RequestType.ADHOC,
      priority: Priority.MEDIUM,
      contentType: "post",
      createdTime: new Date("2026-01-14T04:15:00"),
      userGroup: "analysts",
      version: 3,
      country: "India",
      zone: "R",
      depth: { type: DepthType.LAST_DAYS, days: 2 },
      latestEvent: {
        _id: "evt-9-conflict",
        requestId: "9",
        eventType: EventType.UPDATE,
        status: EventStatus.CONFLICT,
        payload: JSON.stringify({ action: "update" }),
        user: "user456",
        userGroup: "analysts",
        createdTime: new Date("2026-01-14T04:15:00"),
        uploadedTime: new Date("2026-01-14T04:20:00"),
        version: 3,
      },
      user: "user456",
      collectionStatus: CollectionStatus.COMPLETED,
      colEndTime: new Date("2026-01-14T06:30:00"),
      estimatedColDurationMins: 120,
      changeStatus: ChangeStatus.CONFLICT,
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
 * Request body: { request: TmsRequestCreateInput }
 * Returns: {
 *   request: TmsRequest,
 *   events: TmsRequestEvent[]  // includes LOCAL then APPROVED create events
 * }
 *
 * Stage 1 Workflow (per S->R Segment Sync doc):
 * 1. Create TMS_Request document with version=1
 * 2. Create TMS_Request_Event E1: eventType=CREATE, status=LOCAL, version=1
 * 3. Auto-approve: Create TMS_Request_Event E2: eventType=CREATE, status=APPROVED, version=2
 * 4. Return Task with latestEvent = E2 (APPROVED)
 *
 * Per sync doc principle #9: "Whenever an event is approved, all the previous
 * events that are local will be updated to approved"
 */
export async function createTask(
  payload: Omit<
    Task,
    | "id"
    | "createdTime"
    | "user"
    | "userGroup"
    | "version"
    | "changeStatus"
    | "latestEvent"
    | "collectionStatus"
    | "colEndTime"
    | "estimatedColDuration"
  >,
): Promise<Task> {
  await simulateNetworkLatency();

  const currentTime = new Date();
  const currentUser = "current_user"; // TODO: Get from auth context
  const currentUserGroup = "default_group"; // TODO: Get from auth context

  idCounter = idCounter + 1;
  const taskId = `task-${idCounter}`;

  // Stage 1: In a real implementation, we would create LOCAL event first (E1)
  // then auto-approve to create APPROVED event (E2). For the mock, we only
  // store the final APPROVED event since we don't persist event history.

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
    createdTime: new Date(currentTime.getTime() + 1), // Slightly after local
    uploadedTime: new Date(currentTime.getTime() + 1),
    version: 2,
    approvedBy: "SYSTEM-AUTO", // Auto-approval for Stage 1
  };

  const newTask: Task = {
    ...payload,
    id: taskId,
    createdTime: currentTime,
    user: currentUser,
    userGroup: currentUserGroup,
    version: 2, // Version 2 after auto-approval
    // Latest event is the APPROVED event
    latestEvent: approvedEvent,
    // From Col_Request - no collection yet for new tasks
    collectionStatus: undefined,
    colEndTime: undefined,
    estimatedColDurationMins: undefined,
    // UI-derived: APPROVED + CREATE = ADDED
    changeStatus: deriveChangeStatus(approvedEvent),
  };

  // Add to MockDB
  updateTasks((tasks) => [newTask, ...tasks]);

  return newTask;
}

/**
 * Update an existing task (creates a new event)
 * To be released in Milestone 2 - not part of Stage 1
 */
export async function updateTask(
  id: string,
  patch: Partial<
    Omit<
      Task,
      | "id"
      | "createdTime"
      | "user"
      | "userGroup"
      | "version"
      | "changeStatus"
      | "latestEvent"
      | "collectionStatus"
      | "colEndTime"
      | "estimatedColDuration"
    >
  >,
): Promise<Task> {
  await simulateNetworkLatency();

  const tasks = getAllTasks();
  const taskIndex = tasks.findIndex((task: Task) => task.id === id);
  if (taskIndex === -1) {
    throw new Error(`Task with id ${id} not found`);
  }

  const currentTime = new Date();
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
    uploadedTime: currentTime,
    version: existingTask.version + 1,
  };

  const updatedTask: Task = {
    ...existingTask,
    ...patch,
    version: existingTask.version + 1,
    latestEvent: event,
    changeStatus: deriveChangeStatus(event),
  };

  // Update in MockDB
  updateTasks((allTasks) => allTasks.map((task) => (task.id === id ? updatedTask : task)));

  return updatedTask;
}

/**
 * Delete a task (creates a DELETE event)
 * Single task version - used internally
 */
export async function deleteTask(id: string): Promise<void> {
  await simulateNetworkLatency();

  const tasks = getAllTasks();
  const taskIndex = tasks.findIndex((task: Task) => task.id === id);
  if (taskIndex === -1) {
    throw new Error(`Task with id ${id} not found`);
  }

  const currentTime = new Date();
  const currentUser = "current_user"; // TODO: Get from auth context
  const currentUserGroup = "default_group"; // TODO: Get from auth context

  const existingTask = tasks[taskIndex];

  // Stage 1: In a real implementation, we would create LOCAL delete event first
  // then auto-approve. For the mock, we only store the final APPROVED event.

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
    createdTime: new Date(currentTime.getTime() + 1),
    uploadedTime: new Date(currentTime.getTime() + 1),
    version: existingTask.version + 2,
    approvedBy: "SYSTEM-AUTO",
  };

  // Update task with approved delete event
  const updatedTask: Task = {
    ...existingTask,
    version: existingTask.version + 2,
    latestEvent: approvedEvent,
    changeStatus: deriveChangeStatus(approvedEvent), // Will be ChangeStatus.DELETED
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
 * - Per sync doc principle #7.4: "As long as one of the previous event is
 *   pending_upload or uploaded, a new Delete event needs to be created"
 *
 * TODO: Update with real API
 * Endpoint: POST /api/tms/events/bulk-delete
 * Request body: { taskIds: string[] }
 * Response: void (204 No Content)
 *
 * Backend should:
 * 1. Extract user + userGroup from auth context
 * 2. For each requestId in taskIds:
 *    a. Validate: latest event status must be PENDING_UPLOAD or UPLOADED
 *    b. If latest event is already DELETE, skip (avoid duplicates)
 *    c. Create LOCAL DELETE event, then APPROVED DELETE event
 *    d. Increment version on TMS_Request document
 * 3. Return 204 No Content on success
 */
export async function deleteSelectedTasks(taskIds: string[]): Promise<void> {
  await simulateNetworkLatency();

  const currentTime = new Date();
  const currentUser = "current_user"; // TODO: Get from auth context
  const currentUserGroup = "default_group"; // TODO: Get from auth context

  updateTasks((allTasks) =>
    allTasks.map((task) => {
      // Only process tasks in the selected IDs
      if (!taskIds.includes(task.id)) {
        return task;
      }

      // Skip if already deleted (avoid duplicate DELETE events)
      if (task.latestEvent && task.latestEvent.eventType === EventType.DELETE) {
        return task;
      }

      // Stage 1 validation: Only allow deletion for PENDING_UPLOAD or UPLOADED tasks
      // Per user requirement: "Allow delete only and only applies to tasks that are PENDING_UPLOAD, or UPLOADED"
      const latestStatus = task.latestEvent?.status;
      if (latestStatus !== EventStatus.PENDING_UPLOAD && latestStatus !== EventStatus.UPLOADED) {
        // Skip tasks that don't meet eligibility criteria
        return task;
      }

      // Stage 1: In a real implementation, we would create LOCAL delete event first
      // then auto-approve. For the mock, we only store the final APPROVED event.

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
        createdTime: new Date(currentTime.getTime() + 1),
        uploadedTime: new Date(currentTime.getTime() + 1),
        version: task.version + 2,
        approvedBy: "SYSTEM-AUTO",
      };

      // Update task with approved delete event
      return {
        ...task,
        version: task.version + 2,
        latestEvent: approvedEvent,
        changeStatus: deriveChangeStatus(approvedEvent), // Will be ChangeStatus.DELETED
      };
    }),
  );
}

/**
 * Revert selected tasks (discard local/approved changes)
 *
 * Stage 1 Workflow:
 * - For newly created tasks with only LOCAL/APPROVED events: hard delete
 * - Per sync doc principle #10: "you may only revert a current event that is
 *   of status local or approved and it must not be a Create event"
 * - For Stage 1, since we only have CREATE, revert means removing the task entirely
 *
 * TODO: Update with real API
 * Endpoint: POST /api/tms/requests/revert
 * Request body: { requestIds: string[] }
 * Response: { revertedRequestIds: string[] }
 *
 * Backend should:
 * 1. For each requestId, check if all events are LOCAL or APPROVED
 * 2. If so, hard delete the request and all its events
 * 3. If task has PENDING_UPLOAD or UPLOADED events, cannot revert (return error)
 * 4. Return list of successfully reverted request IDs
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
      const latestStatus = task.latestEvent?.status;
      if (
        latestStatus === EventStatus.LOCAL ||
        latestStatus === EventStatus.APPROVED ||
        !task.latestEvent
      ) {
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
 * - Per sync doc principle #2: "When a request is downloaded as XML, it downloads
 *   all events linked to that request with status approved or pending_upload.
 *   All approved events will then be changed to pending_upload"
 *
 * TODO: Update with real API
 * Endpoint: POST /api/tms/events/mark-pending-upload
 * Request body: { taskIds: string[] }
 * Response: void (204 No Content)
 *
 * Backend should:
 * 1. For each requestId in taskIds:
 *    a. Find latest TMS_Request_Event for that requestId
 *    b. If event.status is APPROVED, create new event with status=PENDING_UPLOAD
 *    c. Also process LOCAL events (upgrade to PENDING_UPLOAD)
 *    d. Increment version on TMS_Request document
 * 2. Return 204 No Content on success
 */
export async function markTasksAsPendingUpload(taskIds: string[]): Promise<void> {
  await simulateNetworkLatency();

  const currentTime = new Date();

  updateTasks((allTasks) =>
    allTasks.map((task) => {
      if (!taskIds.includes(task.id)) {
        return task;
      }

      // Only update tasks that have LOCAL or APPROVED events
      if (
        !task.latestEvent ||
        (task.latestEvent.status !== EventStatus.LOCAL &&
          task.latestEvent.status !== EventStatus.APPROVED)
      ) {
        return task;
      }

      // Create new PENDING_UPLOAD event
      const newEventId = `evt-pending-${task.id}-${Date.now()}`;
      const newEvent: TmsRequestEvent = {
        ...task.latestEvent,
        _id: newEventId,
        status: EventStatus.PENDING_UPLOAD,
        version: task.version + 1,
        createdTime: currentTime,
        uploadedTime: currentTime,
      };

      // Update task with new event
      return {
        ...task,
        version: task.version + 1,
        latestEvent: newEvent,
        changeStatus: deriveChangeStatus(newEvent),
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
 *
 * Backend should:
 * 1. Find all TMS_Request_Event with status=PENDING_UPLOAD
 * 2. For each event:
 *    a. If eventType is DELETE:
 *       - Remove TMS_Request document (hard delete)
 *       - Remove all TMS_Request_Event documents for that requestId
 *       - Clean up any Col_Request data
 *    b. If eventType is CREATE/UPDATE:
 *       - Create new TMS_Request_Event with same eventType but status=UPLOADED
 *       - Set uploadedTime field to current timestamp
 *       - Increment version on TMS_Request document
 * 3. Return summary of affected requestIds and event count
 */
export async function markPendingUploadAsUploaded(): Promise<{
  updatedRequestIds: string[];
  createdEvents: number;
}> {
  await simulateNetworkLatency();

  const currentTime = new Date();
  const updatedRequestIds: string[] = [];
  let createdEvents = 0;

  updateTasks((allTasks) => {
    const processedTasks: Task[] = [];

    for (const task of allTasks) {
      // Only process tasks that have PENDING_UPLOAD events
      if (!task.latestEvent || task.latestEvent.status !== EventStatus.PENDING_UPLOAD) {
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
      const newEvent: TmsRequestEvent = {
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
        latestEvent: newEvent,
        changeStatus: deriveChangeStatus(newEvent),
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
