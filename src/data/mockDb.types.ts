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
 * v2: Added zone field, updated seed data for Stage 1 workflow with APPROVED status
 */
export const CURRENT_SCHEMA_VERSION = 2;

/**
 * localStorage key for the mock database
 */
export const MOCK_DB_KEY = "tms_mock_db_v1";
