import { Task } from "../pages/RequestListingPage/types";

/**
 * Schema for the mock database stored in localStorage
 */
export interface MockDbSchema {
  schemaVersion: number;
  tasks: Task[];
  updatedAt: string; // ISO timestamp
}

/**
 * Current schema version
 * Increment this when making breaking changes to the schema
 */
export const CURRENT_SCHEMA_VERSION = 1;

/**
 * localStorage key for the mock database
 */
export const MOCK_DB_KEY = "tms_mock_db_v1";
