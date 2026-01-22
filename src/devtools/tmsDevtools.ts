import { QueryClient } from "@tanstack/react-query";
import { markPendingUploadAsUploaded } from "../data";
import { TASKS_QUERY_KEY } from "../queries/tasks";

/**
 * DevTools summary result from operations
 */
export interface DevToolsResult {
  updatedRequestIds: string[];
  createdEvents: number;
}

/**
 * TMS DevTools API namespace
 * Provides developer utilities for testing and debugging
 */
class TmsDevTools {
  private queryClient: QueryClient | null = null;

  /**
   * Initialize devtools with QueryClient instance
   * Called from app bootstrap
   */
  initialize(queryClient: QueryClient): void {
    this.queryClient = queryClient;
    console.info("TMS DevTools: Initialized and ready");
  }

  /**
   * Mark all tasks with PENDING_UPLOAD status as UPLOADED
   * Simulates successful B-segment upload
   *
   * Special handling:
   * - Tasks with DELETE eventType are removed from database
   * - Tasks with CREATE/UPDATE eventType are marked as UPLOADED
   *
   * @returns Summary of updated tasks
   */
  async markPendingUploadAsUploaded(): Promise<DevToolsResult> {
    if (!this.queryClient) {
      throw new Error("TMS DevTools: Not initialized. QueryClient is required.");
    }

    try {
      // Call mock API to update tasks
      const result = await markPendingUploadAsUploaded();

      // Invalidate cache to trigger UI update
      await this.queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });

      // Log summary
      console.info(
        `TMS DevTools: Processed ${result.createdEvents} PENDING_UPLOAD task(s)`,
        `\n  - Tasks marked as UPLOADED and/or deleted from database`,
        `\n  - Affected requestIds: [${result.updatedRequestIds.join(", ")}]`,
      );

      return result;
    } catch (error) {
      console.error("TMS DevTools: Failed to mark tasks as uploaded", error);
      throw error;
    }
  }

  /**
   * Print current database state to console
   * Useful for debugging
   */
  printDb(): void {
    const db = localStorage.getItem("tms_mock_db_v1");
    if (!db) {
      console.log("TMS DevTools: No database found in localStorage");
      return;
    }

    try {
      const parsed = JSON.parse(db);
      console.log("TMS DevTools: Current Database State");
      console.log("====================================");
      console.log(`Schema Version: ${parsed.schemaVersion}`);
      console.log(`Updated At: ${parsed.updatedAt}`);
      console.log(`Total Tasks: ${parsed.tasks?.length || 0}`);
      console.log("\nTasks:");
      console.table(
        parsed.tasks?.map((task: { id: string; url: string; latestEvent?: { status: string; eventType: string } }) => ({
          id: task.id,
          url: task.url.substring(0, 40),
          status: task.latestEvent?.status || "N/A",
          eventType: task.latestEvent?.eventType || "N/A",
        })),
      );
    } catch (error) {
      console.error("TMS DevTools: Failed to parse database", error);
    }
  }
}

// Create singleton instance
const tmsDevTools = new TmsDevTools();

/**
 * Initialize TMS DevTools
 * Only call this in development mode with a QueryClient instance
 */
export function initializeTmsDevTools(queryClient: QueryClient): void {
  tmsDevTools.initialize(queryClient);

  // Expose to window for console access
  if (typeof window !== "undefined") {
    (window as Window & { __TMS_DEVTOOLS__?: TmsDevTools }).__TMS_DEVTOOLS__ = tmsDevTools;
    console.log(
      "TMS DevTools: Available commands:\n" +
        "  - __TMS_DEVTOOLS__.markPendingUploadAsUploaded() - Mark pending uploads as uploaded\n" +
        "  - __TMS_DEVTOOLS__.printDb() - Print database state\n" +
        "  - __TMS_MOCK_DB_RESET__() - Reset database to seed data",
    );
  }
}

export default tmsDevTools;
