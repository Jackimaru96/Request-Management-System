import { useQuery, useMutation, useQueryClient, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query";
import { listTasks, createTask, markTasksAsPendingUpload, exportTasksToXmlPayload, deleteSelectedTasks, revertSelectedTasks } from "../data";
import { Task, CreateTaskApiPayload } from "../pages/RequestListingPage/types";
import { RevertResult } from "../data/tmsApi";

// Query key for tasks
export const TASKS_QUERY_KEY = ["tasks"];

/**
 * Hook to fetch all tasks
 * Returns Task objects with all dates as ISO timestamp strings
 */
export function useTasksQuery(): UseQueryResult<Task[], Error> {
  return useQuery({
    queryKey: TASKS_QUERY_KEY,
    queryFn: listTasks,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });
}

/**
 * Hook to create a new task
 *
 * Accepts CreateTaskApiPayload where all dates are ISO timestamp strings.
 * The UI should use mapCreateTaskFormToApi() to convert Date objects before calling mutate().
 *
 * TODO: Update with real API
 * Endpoint: POST /api/tms/requests
 * Body: CreateTaskApiPayload
 * Returns: Task
 */
export function useCreateTaskMutation(): UseMutationResult<Task, Error, CreateTaskApiPayload> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: (newTask) => {
      // Optimistically update the cache with the new task
      queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (oldTasks) => {
        if (!oldTasks) {
          return [newTask];
        }
        // Add new task to the beginning of the list
        return [newTask, ...oldTasks];
      });
    },
  });
}


/**
 * Hook to mark tasks as PENDING_UPLOAD after XML export
 */
export function useExportTasksMutation(): UseMutationResult<void, Error, string[]> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markTasksAsPendingUpload,
    onSuccess: () => {
      // Refetch tasks to get updated status
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
}

/**
 * Hook to export selected tasks to XML payload
 * This is for ad-hoc "Download Selected XML" feature
 * Does NOT modify task statuses or create events
 */
export function useExportSelectedTasksMutation(): UseMutationResult<{ tasks: Task[] }, Error, string[]> {
  return useMutation({
    mutationFn: exportTasksToXmlPayload,
    // No cache updates needed - this is read-only export
  });
}

/**
 * Hook to delete multiple selected tasks
 * Creates DELETE events for each task (skips already deleted tasks)
 *
 * Stage 1 Workflow:
 * - Only allows deletion for tasks with PENDING_UPLOAD or UPLOADED status
 * - Creates DELETE event with auto-approval (LOCAL → APPROVED)
 */
export function useDeleteSelectedTasksMutation(): UseMutationResult<void, Error, string[]> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSelectedTasks,
    onSuccess: () => {
      // Refetch to get the updated tasks with DELETE events
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
}

/**
 * Hook to revert selected tasks (discard local/approved changes)
 *
 * Stage 1 Workflow:
 * - For newly created tasks with only LOCAL/APPROVED events: hard delete
 * - Per sync doc: "you may only revert a current event that is of status local or approved"
 *
 * TODO: Update with real API
 * Endpoint: POST /api/tms/requests/revert
 * Body: { requestIds: string[] }
 * Returns: { revertedRequestIds: string[] }
 */
export function useRevertSelectedTasksMutation(): UseMutationResult<RevertResult, Error, string[]> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revertSelectedTasks,
    onSuccess: () => {
      // Refetch to get the updated task list (reverted tasks are removed)
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
}
