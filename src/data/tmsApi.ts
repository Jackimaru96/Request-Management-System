/**
 * TMS API Interface
 *
 * This file defines the contract for all TMS API operations.
 * Implementations: tmsApi.mock.ts (localStorage), tmsApi.http.ts (real backend)
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
   * Create a new task (creates TMS_Request + CREATE event)
   * POST /api/tms/requests
   *
   * Request body: Omit<Task, derived/generated fields>
   * Response: Task (newly created with generated ID, timestamps, etc.)
   *
   * @param taskData - Task data without id, createdTime, user, version, etc.
   * @returns Promise<Task> - Newly created task
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
    >
  ): Promise<Task>;

  /**
   * Mark tasks as PENDING_UPLOAD (called during XML export)
   * POST /api/tms/events/mark-pending-upload
   *
   * Request body: { taskIds: string[] }
   * Response: void
   *
   * Updates all LOCAL events for the given tasks to PENDING_UPLOAD status.
   * This happens when user exports XML from Review Changes page.
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
   * Delete multiple tasks (creates DELETE events)
   * POST /api/tms/events/bulk-delete
   *
   * Request body: { taskIds: string[] }
   * Response: void
   *
   * Creates DELETE events with LOCAL status for each task.
   * Skips tasks that already have DELETE events to avoid duplicates.
   *
   * @param taskIds - Array of task IDs to delete
   * @returns Promise<void>
   */
  deleteSelectedTasks(taskIds: string[]): Promise<void>;

  /**
   * DevTools: Mark PENDING_UPLOAD tasks as UPLOADED
   * POST /api/devtools/simulate-upload
   *
   * Response: { updatedRequestIds: string[], createdEvents: number }
   *
   * Simulates successful B-segment upload:
   * - Tasks with DELETE events are REMOVED from database
   * - Tasks with CREATE/UPDATE events get UPLOADED status
   *
   * @returns Promise<DevToolsUploadResult>
   */
  markPendingUploadAsUploaded(): Promise<DevToolsUploadResult>;
}
