import { Task, TaskDisplay, Depth, PRIORITY_LABELS, Priority, RequestType, DepthType } from "./types";

/**
 * Convert text to Camel Case for display
 * Examples: "ADHOC" -> "Adhoc", "PENDING-C" -> "Pending-C", "ERROR-COUNT" -> "Error-Count"
 */
export function toCamelCase(text: string): string {
  if (!text) {
    return text;
  }

  // Split by hyphen or underscore
  const parts = text.split(/[-_]/);

  return parts
    .map((part) => {
      if (!part) {
        return part;
      }
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join("-");
}

/**
 * Format frequency for display
 */
export function formatFrequency(taskType: RequestType, frequency?: number): string {
  if (taskType === RequestType.LIVESTREAM || taskType === RequestType.ADHOC) {
    return "-";
  }

  if (!frequency) {
    return "-";
  }

  if (frequency === 1) {
    return "Every 1 hour";
  }

  return `Every ${frequency} hours`;
}

/**
 * Get priority label from priority number
 */
export function getPriorityLabel(priority: Priority): string {
  return PRIORITY_LABELS[priority];
}

/**
 * Format depth for display
 */
export function formatDepth(depth: Depth): string {
  switch (depth.type) {
    case DepthType.LAST_HOURS:
      return "Last 2 hours";

    case DepthType.LAST_DAYS:
      if (depth.days === 1) {
        return "Last 1 day";
      }
      return `Last ${depth.days} days`;

    case DepthType.DATE_RANGE: {
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
    taskType: toCamelCase(task.requestType), // Convert to Camel Case
    frequency: formatFrequency(task.requestType, task.recurringFreq),
    depth: formatDepth(task.depth),
    priority: getPriorityLabel(task.priority),
    country: task.country || "-",
    status: task.collectionStatus ? toCamelCase(task.collectionStatus) : "-", // Convert to Camel Case
    lastCollected: task.colEndTime ? formatDate(task.colEndTime) : "", // From Col_Request.colEndTime
  };
}

/**
 * Convert multiple Tasks to TaskDisplay array
 */
export function tasksToDisplay(tasks: Task[]): TaskDisplay[] {
  return tasks.map(taskToDisplay);
}
