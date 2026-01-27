/**
 * TMS API exports
 *
 * This file exports the current API implementation.
 * Switch between mock and HTTP by changing the import.
 *
 * TODO: When backend is ready, change this to:
 * export { httpApi as api } from './tmsApiHttp';
 * export * from './tmsApiHttp';
 */

// Currently using mock implementation with localStorage
export { mockApi as api } from "./tasksApiMock";

// Export individual functions for convenience
export {
  listTasks,
  createTask,
  markTasksAsPendingUpload,
  exportTasksToXmlPayload,
  deleteSelectedTasks,
  revertSelectedTasks,
  hardDeleteTasks,
  markPendingUploadAsUploaded,
  seedTasks,
} from "./tasksApiMock";

// When ready to switch to HTTP:
// export { httpApi as api } from './tmsApiHttp';
// export {
//   listTasks,
//   createTask,
//   markTasksAsPendingUpload,
//   exportTasksToXmlPayload,
//   deleteSelectedTasks,
//   markPendingUploadAsUploaded,
// } from './tmsApiHttp';
