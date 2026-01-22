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
} from "../pages/RequestListingPage/types";
import { getAllTasks, updateTasks } from "./mockDb";
import { TmsApi } from "./tmsApi";

/**
 * Generate seed data for the mock database
 * This is called by mockDb.ts when initializing localStorage
 */
export function seedTasks(): Task[] {
  return [
    // Tasks with LOCAL status (ADDED - show green +)
    {
      id: "1",
      url: "api.example.com/v1/climate-data",
      requestType: RequestType.RECURRING,
      priority: Priority.URGENT,
      contentType: "post",
      createdTime: new Date("2026-01-15T10:00:00"),
      userGroup: "analysts",
      version: 1,
      recurringFreq: 3,
      country: "United States",
      depth: { type: DepthType.LAST_HOURS, hours: 2 },
      latestEvent: {
        _id: "evt-1",
        requestId: "1",
        eventType: EventType.CREATE,
        status: EventStatus.LOCAL,
        payload: JSON.stringify({ action: "create" }),
        user: "user123",
        userGroup: "analysts",
        createdTime: new Date("2026-01-15T10:00:00"),
        version: 1,
      },
      user: "user123",
      collectionStatus: undefined,
      colEndTime: undefined,
      estimatedColDuration: undefined,
      changeStatus: ChangeStatus.ADDED,
    },
    {
      id: "2",
      url: "metrics-api.cloud/collection",
      requestType: RequestType.RECURRING,
      priority: Priority.HIGH,
      contentType: "post",
      createdTime: new Date("2026-01-15T10:00:00"),
      userGroup: "analysts",
      version: 2,
      recurringFreq: 3,
      country: "Australia",
      depth: { type: DepthType.LAST_HOURS, hours: 2 },
      latestEvent: {
        _id: "evt-2",
        requestId: "2",
        eventType: EventType.UPDATE,
        status: EventStatus.LOCAL,
        payload: JSON.stringify({ action: "update" }),
        user: "user123",
        userGroup: "analysts",
        createdTime: new Date("2026-01-15T10:00:00"),
        version: 2,
      },
      user: "user123",
      collectionStatus: undefined,
      colEndTime: undefined,
      estimatedColDuration: undefined,
      changeStatus: ChangeStatus.ADDED,
    },
    // Task with LOCAL DELETE status (DELETED - show red -)
    {
      id: "3",
      url: "weather-data.science/metrics",
      requestType: RequestType.RECURRING,
      priority: Priority.MEDIUM,
      contentType: "post",
      createdTime: new Date("2026-01-14T08:45:00"),
      userGroup: "analysts",
      version: 2,
      recurringFreq: 2,
      country: "United Kingdom",
      depth: { type: DepthType.LAST_HOURS, hours: 2 },
      latestEvent: {
        _id: "evt-3",
        requestId: "3",
        eventType: EventType.DELETE,
        status: EventStatus.LOCAL,
        payload: JSON.stringify({ action: "delete" }),
        user: "user456",
        userGroup: "analysts",
        createdTime: new Date("2026-01-14T08:45:00"),
        version: 2,
      },
      user: "user456",
      collectionStatus: CollectionStatus.COMPLETED,
      colEndTime: new Date("2026-01-14T09:30:00"),
      estimatedColDuration: 45,
      changeStatus: ChangeStatus.DELETED,
    },
    // Tasks with PENDING_UPLOAD status (blue dot, no collection status)
    {
      id: "4",
      url: "global-climate.net/sensors",
      requestType: RequestType.RECURRING,
      priority: Priority.URGENT,
      contentType: "post",
      createdTime: new Date("2026-01-14T10:45:00"),
      userGroup: "analysts",
      version: 1,
      recurringFreq: 1,
      country: "Singapore",
      depth: { type: DepthType.LAST_HOURS, hours: 2 },
      latestEvent: {
        _id: "evt-4",
        requestId: "4",
        eventType: EventType.CREATE,
        status: EventStatus.PENDING_UPLOAD,
        payload: JSON.stringify({ action: "create" }),
        user: "user789",
        userGroup: "analysts",
        createdTime: new Date("2026-01-14T10:45:00"),
        version: 1,
      },
      user: "user789",
      collectionStatus: undefined,
      colEndTime: undefined,
      estimatedColDuration: undefined,
      changeStatus: ChangeStatus.PENDING_UPLOAD,
    },
    {
      id: "5",
      url: "climate-monitor.global/api/temp",
      requestType: RequestType.ADHOC,
      priority: Priority.HIGH,
      contentType: "post",
      createdTime: new Date("2026-01-14T09:15:00"),
      userGroup: "analysts",
      version: 1,
      country: "Germany",
      depth: { type: DepthType.LAST_DAYS, days: 2 },
      latestEvent: {
        _id: "evt-5",
        requestId: "5",
        eventType: EventType.CREATE,
        status: EventStatus.PENDING_UPLOAD,
        payload: JSON.stringify({ action: "create" }),
        user: "user123",
        userGroup: "analysts",
        createdTime: new Date("2026-01-14T09:15:00"),
        version: 1,
      },
      user: "user123",
      collectionStatus: undefined,
      colEndTime: undefined,
      estimatedColDuration: undefined,
      changeStatus: ChangeStatus.PENDING_UPLOAD,
    },
    {
      id: "6",
      url: "environment-tracker.io/data",
      requestType: RequestType.RECURRING,
      priority: Priority.HIGH,
      contentType: "post",
      createdTime: new Date("2026-01-14T07:20:00"),
      userGroup: "analysts",
      version: 1,
      recurringFreq: 4,
      country: "Japan",
      depth: { type: DepthType.LAST_DAYS, days: 3 },
      latestEvent: {
        _id: "evt-6",
        requestId: "6",
        eventType: EventType.CREATE,
        status: EventStatus.PENDING_UPLOAD,
        payload: JSON.stringify({ action: "create" }),
        user: "user456",
        userGroup: "analysts",
        createdTime: new Date("2026-01-14T07:20:00"),
        version: 1,
      },
      user: "user456",
      collectionStatus: undefined,
      colEndTime: undefined,
      estimatedColDuration: undefined,
      changeStatus: ChangeStatus.PENDING_UPLOAD,
    },
    {
      id: "7",
      url: "temperature-monitor.io/latest",
      requestType: RequestType.RECURRING,
      priority: Priority.HIGH,
      contentType: "post",
      createdTime: new Date("2026-01-14T10:00:00"),
      userGroup: "analysts",
      version: 1,
      recurringFreq: 2,
      country: "France",
      depth: { type: DepthType.LAST_HOURS, hours: 2 },
      latestEvent: {
        _id: "evt-7",
        requestId: "7",
        eventType: EventType.CREATE,
        status: EventStatus.PENDING_UPLOAD,
        payload: JSON.stringify({ action: "create" }),
        user: "user789",
        userGroup: "analysts",
        createdTime: new Date("2026-01-14T10:00:00"),
        version: 1,
      },
      user: "user789",
      collectionStatus: undefined,
      colEndTime: undefined,
      estimatedColDuration: undefined,
      changeStatus: ChangeStatus.PENDING_UPLOAD,
    },
    {
      id: "8",
      url: "eco-sensors.worldwide/api",
      requestType: RequestType.LIVESTREAM,
      priority: Priority.MEDIUM,
      contentType: "post",
      createdTime: new Date("2026-01-14T05:30:00"),
      userGroup: "analysts",
      version: 1,
      cutOffTime: new Date("2026-01-31T23:59:59"),
      country: "Canada",
      depth: {
        type: DepthType.DATE_RANGE,
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-01-31"),
      },
      latestEvent: {
        _id: "evt-8",
        requestId: "8",
        eventType: EventType.CREATE,
        status: EventStatus.PENDING_UPLOAD,
        payload: JSON.stringify({ action: "create" }),
        user: "user123",
        userGroup: "analysts",
        createdTime: new Date("2026-01-14T05:30:00"),
        version: 1,
      },
      user: "user123",
      collectionStatus: undefined,
      colEndTime: undefined,
      estimatedColDuration: undefined,
      changeStatus: ChangeStatus.PENDING_UPLOAD,
    },
    // Task with UPLOADED status (has collection status)
    {
      id: "9",
      url: "data-hub.research.org/endpoints",
      requestType: RequestType.ADHOC,
      priority: Priority.MEDIUM,
      contentType: "post",
      createdTime: new Date("2026-01-14T04:15:00"),
      userGroup: "analysts",
      version: 1,
      country: "India",
      depth: { type: DepthType.LAST_DAYS, days: 2 },
      latestEvent: {
        _id: "evt-9",
        requestId: "9",
        eventType: EventType.CREATE,
        status: EventStatus.UPLOADED,
        payload: JSON.stringify({ action: "create" }),
        user: "user456",
        userGroup: "analysts",
        createdTime: new Date("2026-01-14T04:15:00"),
        version: 1,
        uploadedTime: new Date("2026-01-14T04:20:00"),
      },
      user: "user456",
      collectionStatus: CollectionStatus.COMPLETED,
      colEndTime: new Date("2026-01-14T06:30:00"),
      estimatedColDuration: 120,
      changeStatus: ChangeStatus.UPLOADED,
    },
    // Task with no event (UPLOADED in past, now stable)
    {
      id: "10",
      url: "atmospheric-data.org/readings",
      requestType: RequestType.RECURRING,
      priority: Priority.LOW,
      contentType: "post",
      createdTime: new Date("2026-01-14T06:00:00"),
      userGroup: "analysts",
      version: 1,
      recurringFreq: 8,
      country: "Brazil",
      depth: { type: DepthType.LAST_DAYS, days: 4 },
      latestEvent: undefined,
      user: "user789",
      collectionStatus: CollectionStatus.COMPLETED,
      colEndTime: new Date("2026-01-14T12:00:00"),
      estimatedColDuration: 360,
      changeStatus: null,
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
 * TODO: Replace with real API call
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
 * Create a new task
 *
 * TODO: Replace with real API call
 * Endpoint: POST /api/tms/requests
 * Request body: Omit<Task, "id" | "createdTime" | "user" | "userGroup" | "version" | "changeStatus" | "latestEvent" | "collectionStatus" | "colEndTime" | "estimatedColDuration">
 * Response: Task (newly created with all generated fields)
 *
 * Backend should:
 * 1. Generate new UUID for requestId
 * 2. Extract user + userGroup from auth context (JWT/session)
 * 3. Create TMS_Request document with version=1
 * 4. Create TMS_Request_Event with eventType=CREATE, status=LOCAL, version=1
 * 5. Return composite Task object (no Col_Request data yet for new tasks)
 * 6. Derive changeStatus as ADDED (CREATE + LOCAL)
 * 7. Derive depth from backcrawl fields in payload
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
  const eventId = `evt-${taskId}`;

  // Create the event for this new task
  const event = {
    _id: eventId,
    requestId: taskId,
    eventType: EventType.CREATE,
    status: EventStatus.LOCAL,
    payload: JSON.stringify({ action: "create", data: payload }),
    user: currentUser,
    userGroup: currentUserGroup,
    createdTime: currentTime,
    version: 1,
  };

  const newTask: Task = {
    ...payload,
    id: taskId,
    createdTime: currentTime,
    user: currentUser,
    userGroup: currentUserGroup,
    version: 1,
    // From latest TMSRequestEvent
    latestEvent: event,
    // From Col_Request - no collection yet for new tasks
    collectionStatus: undefined,
    colEndTime: undefined,
    estimatedColDuration: undefined,
    // UI-derived from the event
    changeStatus: deriveChangeStatus(event), // Will be ChangeStatus.ADDED
  };

  // Add to MockDB
  updateTasks((tasks) => [newTask, ...tasks]);

  return newTask;
}

/**
 * Update an existing task (creates a new event)
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
  const event = {
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
    latestEvent: event,
    changeStatus: deriveChangeStatus(event),
  };

  // Update in MockDB
  updateTasks((allTasks) => allTasks.map((task) => (task.id === id ? updatedTask : task)));

  return updatedTask;
}

/**
 * Delete a task (creates a DELETE event)
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
  const eventId = `evt-delete-${id}-${Date.now()}`;

  const existingTask = tasks[taskIndex];

  // Create delete event
  const event = {
    _id: eventId,
    requestId: id,
    eventType: EventType.DELETE,
    status: EventStatus.LOCAL,
    payload: JSON.stringify({ action: "delete" }),
    user: currentUser,
    userGroup: currentUserGroup,
    createdTime: currentTime,
    version: existingTask.version + 1,
  };

  // Update task with delete event (mark as deleted, don't remove from store)
  const updatedTask: Task = {
    ...existingTask,
    version: existingTask.version + 1,
    latestEvent: event,
    changeStatus: deriveChangeStatus(event), // Will be ChangeStatus.DELETED
  };

  // Update in MockDB
  updateTasks((allTasks) => allTasks.map((task) => (task.id === id ? updatedTask : task)));
}

/**
 * Delete multiple tasks (creates DELETE events for each)
 * Skips tasks that already have DELETE events to avoid duplicates
 *
 * TODO: Replace with real API call
 * Endpoint: POST /api/tms/events/bulk-delete
 * Request body: { taskIds: string[] }
 * Response: void (204 No Content)
 *
 * Backend should:
 * 1. Extract user + userGroup from auth context
 * 2. For each requestId in taskIds:
 *    a. Find latest TMS_Request_Event for that requestId
 *    b. If latest event is already DELETE, skip (avoid duplicates)
 *    c. Otherwise, create new TMS_Request_Event with eventType=DELETE, status=LOCAL
 *    d. Increment version on TMS_Request document
 * 3. Return 204 No Content on success
 * 4. Client will refetch tasks to get updated state
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

      // Create delete event
      const eventId = `evt-delete-${task.id}-${Date.now()}`;
      const event = {
        _id: eventId,
        requestId: task.id,
        eventType: EventType.DELETE,
        status: EventStatus.LOCAL,
        payload: JSON.stringify({ action: "delete" }),
        user: currentUser,
        userGroup: currentUserGroup,
        createdTime: currentTime,
        version: task.version + 1,
      };

      // Update task with delete event
      return {
        ...task,
        version: task.version + 1,
        latestEvent: event,
        changeStatus: deriveChangeStatus(event), // Will be ChangeStatus.DELETED
      };
    }),
  );
}

/**
 * Mark tasks with LOCAL events as PENDING_UPLOAD
 * This happens after XML export
 *
 * TODO: Replace with real API call
 * Endpoint: POST /api/tms/events/mark-pending-upload
 * Request body: { taskIds: string[] }
 * Response: void (204 No Content)
 *
 * Backend should:
 * 1. For each requestId in taskIds:
 *    a. Find latest TMS_Request_Event for that requestId
 *    b. If event.status is LOCAL, create new event with same eventType but status=PENDING_UPLOAD
 *    c. Increment version on TMS_Request document
 *    d. New event should copy eventType (CREATE/UPDATE/DELETE) from previous event
 * 2. This marks events as "exported to XML and ready for B-segment upload"
 * 3. Return 204 No Content on success
 * 4. Client will refetch tasks to get updated state
 */
export async function markTasksAsPendingUpload(taskIds: string[]): Promise<void> {
  await simulateNetworkLatency();

  const currentTime = new Date();

  updateTasks((allTasks) =>
    allTasks.map((task) => {
      if (!taskIds.includes(task.id)) {
        return task;
      }

      // Only update tasks that have LOCAL events
      if (!task.latestEvent || task.latestEvent.status !== EventStatus.LOCAL) {
        return task;
      }

      // Create new PENDING_UPLOAD event
      const newEventId = `evt-upload-${task.id}-${Date.now()}`;
      const newEvent = {
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
        latestEvent: newEvent,
        changeStatus: deriveChangeStatus(newEvent),
      };
    }),
  );
}

/**
 * Mark tasks with PENDING_UPLOAD events as UPLOADED
 * This simulates successful B-segment upload
 * DevTools utility for testing
 *
 * Special handling:
 * - Tasks with DELETE eventType are removed from database
 * - Tasks with CREATE/UPDATE eventType are marked as UPLOADED
 *
 * TODO: Replace with real API call (DevTools only)
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
 * 4. This simulates B-segment successfully processing the XML upload
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
      const newEvent = {
        ...task.latestEvent,
        _id: newEventId,
        status: EventStatus.UPLOADED,
        version: task.version + 1,
        createdTime: currentTime,
        uploadedTime: currentTime, // Add uploadedTime field
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
 * TODO: Replace with real API call
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
  markPendingUploadAsUploaded,
};
