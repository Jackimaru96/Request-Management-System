/**
 * TMS API Interface
 *
 * This file defines the contract for all TMS API operations.
 * Implementations: tmsApi.mock.ts (localStorage), tmsApi.http.ts (real backend)
 *
 * Stage 1 Workflow (per S->R Segment Sync doc):
 * - Create: LOCAL → APPROVED (auto-approve creates 2 events)
 * - Export/Commit: APPROVED → PENDING_UPLOAD
 * - Upload feedback: PENDING_UPLOAD → UPLOADED
 * - Delete: Creates DELETE event, hard delete only if all events are LOCAL/APPROVED
 */

import { Task } from "../pages/RequestListingPage/types";

/**
 * Result type for devtools upload simulation
 */
export interface DevToolsUploadResult {
  updatedRequestIds: string[];
  createdEvents: number;
}

/**
 * Result type for revert operation
 *
 * TODO: Update with real API
 * POST /api/tms/requests/revert
 * Body: { requestIds: string[] }
 * Returns: { revertedRequestIds: string[] }
 * Backend behavior: revert each request to last stable state before local changes
 */
export interface RevertResult {
  revertedRequestIds: string[];
}

/**
 * TMS API Interface
 * All API operations for Task Management System
 */
export interface TmsApi {
  /**
   * List all tasks
   * GET /api/tms/requests
   *
   * Returns composite view combining:
   * - TMS_Request (request data)
   * - TMS_Request_Event (latest event for each request)
   * - Col_Request (collection status from R-segment)
   *
   * @returns Promise<Task[]> - Array of tasks with all related data
   */
  listTasks(): Promise<Task[]>;

  /**
   * Create a new task (creates TMS_Request + CREATE event with auto-approve)
   * POST /api/tms/requests
   *
   * Stage 1 Workflow:
   * 1. Create TMS_Request document
   * 2. Create TMS_Request_Event with eventType=CREATE, status=LOCAL, version=1
   * 3. Auto-approve: Create second event with eventType=CREATE, status=APPROVED, version=2
   *
   * Request body: Omit<Task, derived/generated fields>
   * Response: Task (with latestEvent showing APPROVED status)
   *
   * @param taskData - Task data without id, createdTime, user, version, etc.
   * @returns Promise<Task> - Newly created task with APPROVED status
   */
  createTask(
    taskData: Omit<
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
  ): Promise<Task>;

  /**
   * Mark tasks as PENDING_UPLOAD (called during XML export/commit)
   * POST /api/tms/events/mark-pending-upload
   *
   * Stage 1 Workflow:
   * - Only processes tasks with APPROVED events (per sync doc)
   * - Creates new event with same eventType but status=PENDING_UPLOAD
   * - Increments version
   *
   * Request body: { taskIds: string[] }
   * Response: void
   *
   * @param taskIds - Array of task IDs to mark as pending upload
   * @returns Promise<void>
   */
  markTasksAsPendingUpload(taskIds: string[]): Promise<void>;

  /**
   * Export selected tasks to XML payload (read-only, no status changes)
   * POST /api/tms/export/selected
   *
   * Request body: { taskIds: string[] }
   * Response: { tasks: Task[] }
   *
   * Used for "Download Selected XML" feature - exports ONLY selected tasks
   * without modifying any statuses or creating events.
   *
   * @param taskIds - Array of task IDs to export
   * @returns Promise<{ tasks: Task[] }> - Tasks to be included in XML
   */
  exportTasksToXmlPayload(taskIds: string[]): Promise<{ tasks: Task[] }>;

  /**
   * Delete multiple tasks (creates DELETE events with auto-approve)
   * POST /api/tms/events/bulk-delete
   *
   * Stage 1 Workflow (per S->R Segment Sync doc):
   * - Only allows deletion for tasks with PENDING_UPLOAD or UPLOADED status
   * - Creates DELETE event with LOCAL status
   * - Auto-approves: Creates second DELETE event with APPROVED status
   * - Skips tasks that already have DELETE events
   *
   * Request body: { taskIds: string[] }
   * Response: void
   *
   * @param taskIds - Array of task IDs to delete
   * @returns Promise<void>
   */
  deleteSelectedTasks(taskIds: string[]): Promise<void>;

  /**
   * Revert selected tasks (discard local/approved changes)
   * POST /api/tms/requests/revert
   *
   * Stage 1 Workflow:
   * - For newly created tasks (only LOCAL/APPROVED events): hard delete request + events
   * - Per sync doc: "you may only revert a current event that is of status local or approved"
   *
   * Request body: { requestIds: string[] }
   * Response: { revertedRequestIds: string[] }
   *
   * @param taskIds - Array of task IDs to revert
   * @returns Promise<RevertResult>
   */
  revertSelectedTasks(taskIds: string[]): Promise<RevertResult>;

  /**
   * Hard delete tasks (remove from database entirely)
   * DELETE /api/tms/requests
   *
   * Used internally for revert operations when a task has only LOCAL/APPROVED events.
   * Per sync doc: "If all the previous events are local, hard delete without approval"
   *
   * Request body: { requestIds: string[] }
   * Response: { deleted: true }
   *
   * @param taskIds - Array of task IDs to hard delete
   * @returns Promise<void>
   */
  hardDeleteTasks(taskIds: string[]): Promise<void>;

  /**
   * DevTools: Mark PENDING_UPLOAD tasks as UPLOADED
   * POST /api/devtools/simulate-upload
   *
   * Response: { updatedRequestIds: string[], createdEvents: number }
   *
   * Simulates successful R-segment upload feedback:
   * - Tasks with DELETE events are REMOVED from database
   * - Tasks with CREATE/UPDATE events get UPLOADED status
   *
   * @returns Promise<DevToolsUploadResult>
   */
  markPendingUploadAsUploaded(): Promise<DevToolsUploadResult>;
}
