/**
 * TMS API HTTP Implementation
 *
 * This file contains the real HTTP API implementation using axios.
 * Currently stubs with TODO markers - replace with actual backend calls.
 *
 * TODO: Install axios if not already available: npm install axios
 * TODO: Configure base URL and auth interceptors
 * TODO: Add error handling and retry logic
 * TODO: Add request/response logging for debugging
 */

import { Task } from "../pages/RequestListingPage/types";
import { TmsApi, DevToolsUploadResult } from "./tmsApi";

// TODO: Configure axios instance
// import axios from 'axios';
//
// const apiClient = axios.create({
//   baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000',
//   timeout: 30000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });
//
// // Add auth interceptor
// apiClient.interceptors.request.use((config) => {
//   const token = localStorage.getItem('auth_token'); // Or from auth context
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });
//
// // Add error interceptor
// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // Handle 401 Unauthorized, 403 Forbidden, etc.
//     if (error.response?.status === 401) {
//       // Redirect to login or refresh token
//     }
//     return Promise.reject(error);
//   }
// );

/**
 * List all tasks
 * GET /api/tms/requests
 */
export async function listTasks(): Promise<Task[]> {
  // TODO: Replace with real API call
  // try {
  //   const response = await apiClient.get<Task[]>('/api/tms/requests');
  //   return response.data;
  // } catch (error) {
  //   console.error('Failed to fetch tasks:', error);
  //   throw new Error('Failed to fetch tasks from server');
  // }

  throw new Error("HTTP API not implemented - using mock API");
}

/**
 * Create a new task
 * POST /api/tms/requests
 */
export async function createTask(
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
): Promise<Task> {
  // TODO: Replace with real API call
  // try {
  //   const response = await apiClient.post<Task>('/api/tms/requests', taskData);
  //   return response.data;
  // } catch (error) {
  //   console.error('Failed to create task:', error);
  //   throw new Error('Failed to create task on server');
  // }

  throw new Error("HTTP API not implemented - using mock API");
}

/**
 * Mark tasks as PENDING_UPLOAD after XML export
 * POST /api/tms/events/mark-pending-upload
 */
export async function markTasksAsPendingUpload(taskIds: string[]): Promise<void> {
  // TODO: Replace with real API call
  // try {
  //   await apiClient.post('/api/tms/events/mark-pending-upload', { taskIds });
  // } catch (error) {
  //   console.error('Failed to mark tasks as pending upload:', error);
  //   throw new Error('Failed to mark tasks as pending upload');
  // }

  throw new Error("HTTP API not implemented - using mock API");
}

/**
 * Export selected tasks to XML payload (read-only)
 * POST /api/tms/export/selected
 */
export async function exportTasksToXmlPayload(taskIds: string[]): Promise<{ tasks: Task[] }> {
  // TODO: Replace with real API call
  // try {
  //   const response = await apiClient.post<{ tasks: Task[] }>('/api/tms/export/selected', { taskIds });
  //   return response.data;
  // } catch (error) {
  //   console.error('Failed to export selected tasks:', error);
  //   throw new Error('Failed to export selected tasks');
  // }

  throw new Error("HTTP API not implemented - using mock API");
}

/**
 * Delete multiple tasks (creates DELETE events)
 * POST /api/tms/events/bulk-delete
 */
export async function deleteSelectedTasks(taskIds: string[]): Promise<void> {
  // TODO: Replace with real API call
  // try {
  //   await apiClient.post('/api/tms/events/bulk-delete', { taskIds });
  // } catch (error) {
  //   console.error('Failed to delete selected tasks:', error);
  //   throw new Error('Failed to delete selected tasks');
  // }

  throw new Error("HTTP API not implemented - using mock API");
}

/**
 * DevTools: Mark PENDING_UPLOAD tasks as UPLOADED
 * POST /api/devtools/simulate-upload
 */
export async function markPendingUploadAsUploaded(): Promise<DevToolsUploadResult> {
  // TODO: Replace with real API call
  // try {
  //   const response = await apiClient.post<DevToolsUploadResult>('/api/devtools/simulate-upload');
  //   return response.data;
  // } catch (error) {
  //   console.error('Failed to simulate upload:', error);
  //   throw new Error('Failed to simulate upload');
  // }

  throw new Error("HTTP API not implemented - using mock API");
}

// Export as TmsApi interface implementation
export const httpApi: TmsApi = {
  listTasks,
  createTask,
  markTasksAsPendingUpload,
  exportTasksToXmlPayload,
  deleteSelectedTasks,
  markPendingUploadAsUploaded,
};
