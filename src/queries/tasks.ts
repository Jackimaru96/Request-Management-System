import { useQuery, useMutation, useQueryClient, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query";
import { listTasks, createTask, updateTask, deleteTask, markTasksAsPendingUpload, exportTasksToXmlPayload } from "../data/tasksApi.mock";
import { Task } from "../pages/RequestListingPage/types";

// Query key for tasks
export const TASKS_QUERY_KEY = ["tasks"];

/**
 * Hook to fetch all tasks
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
 */
export function useCreateTaskMutation(): UseMutationResult<
  Task,
  Error,
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
> {
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
 * Hook to update an existing task
 */
export function useUpdateTaskMutation(): UseMutationResult<
  Task,
  Error,
  {
    id: string;
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
    >;
  }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patch }) => updateTask(id, patch),
    onSuccess: (updatedTask) => {
      // Update the task in the cache
      queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (oldTasks) => {
        if (!oldTasks) {
          return [updatedTask];
        }
        return oldTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task));
      });
    },
  });
}

/**
 * Hook to delete a task
 */
export function useDeleteTaskMutation(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: (_, deletedId) => {
      // Refetch to get the updated task with DELETE event
      // (The task isn't removed, it's marked with a DELETE event)
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
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
