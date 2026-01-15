import { Task, TaskDisplay, Depth } from "./types";

/**
 * Format frequency for display
 */
export function formatFrequency(taskType: Task["requestType"], frequency: number): string {
  if (taskType === "Livestream" || taskType === "Ad-Hoc") {
    return "-";
  }

  if (frequency === 1) {
    return "Every 1 hour";
  }

  return `Every ${frequency} hours`;
}

/**
 * Format depth for display
 */
export function formatDepth(depth: Depth): string {
  switch (depth.type) {
    case "lastHours":
      return "Last 2 hours";

    case "lastDays":
      if (depth.days === 1) {
        return "Last 1 day";
      }
      return `Last ${depth.days} days`;

    case "dateRange": {
      const startDate = depth.startDate.toISOString().split("T")[0];
      if (depth.endDate) {
        const endDate = depth.endDate.toISOString().split("T")[0];
        return `${startDate} to ${endDate}`;
      }
      return `From ${startDate}`;
    }

    default:
      return "-";
  }
}

/**
 * Format date for display
 */
export function formatDate(date: Date | null): string {
  if (!date) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * Convert Task to TaskDisplay for the data grid
 */
export function taskToDisplay(task: Task): TaskDisplay {
  return {
    id: task.id,
    changeStatus: task.changeStatus,
    url: task.url,
    taskType: task.requestType,
    frequency: formatFrequency(task.requestType, task.frequency),
    depth: formatDepth(task.depth),
    priority: task.priority,
    country: task.country,
    status: task.status,
    lastCollected: formatDate(task.lastCollected),
  };
}

/**
 * Convert multiple Tasks to TaskDisplay array
 */
export function tasksToDisplay(tasks: Task[]): TaskDisplay[] {
  return tasks.map(taskToDisplay);
}
