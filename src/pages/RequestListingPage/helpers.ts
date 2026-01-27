import {
  Task,
  TaskDisplay,
  Depth,
  PRIORITY_LABELS,
  Priority,
  RequestType,
  DepthType,
  deriveDepthFromTask,
  deriveChangeStatus,
} from "./types";

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
 * Works with Depth objects that have ISO timestamp strings for date range
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
      // startDate and endDate are now ISO strings
      const startDate = depth.startDate.split("T")[0];
      if (depth.endDate) {
        const endDate = depth.endDate.split("T")[0];
        return `${startDate} to ${endDate}`;
      }
      return `From ${startDate}`;
    }

    default:
      return "-";
  }
}

/**
 * Format ISO timestamp string for display
 * @param isoString - ISO timestamp string (e.g., "2026-01-27T15:38:13.998+08:00")
 * @returns Formatted date string (e.g., "2026-01-27 15:38")
 */
export function formatIsoDate(isoString: string | null): string {
  if (!isoString) {
    return "";
  }

  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * @deprecated Use formatIsoDate instead for ISO timestamp strings
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
 * Derives depth and changeStatus from Task fields since they're not in the API response
 */
export function taskToDisplay(task: Task): TaskDisplay {
  // Derive depth from backcrawl fields (Task no longer has depth field)
  const depth = deriveDepthFromTask(task);

  // Derive changeStatus from latestEvent (Task no longer has changeStatus field)
  const changeStatus = deriveChangeStatus(task.latestEvent);

  return {
    id: task.id,
    changeStatus: changeStatus,
    url: task.url,
    taskType: toCamelCase(task.requestType),
    frequency: formatFrequency(task.requestType, task.recurringFreqHours),
    depth: formatDepth(depth),
    priority: getPriorityLabel(task.priority),
    country: task.country || "-",
    zone: task.zone || "-",
    status: task.collectionStatus ? toCamelCase(task.collectionStatus) : "-",
    lastCollected: formatIsoDate(task.colEndTime),
  };
}

/**
 * Convert multiple Tasks to TaskDisplay array
 */
export function tasksToDisplay(tasks: Task[]): TaskDisplay[] {
  return tasks.map(taskToDisplay);
}
