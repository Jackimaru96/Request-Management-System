import { Task } from "../pages/RequestListingPage/types";
import { MockDbSchema, CURRENT_SCHEMA_VERSION, MOCK_DB_KEY } from "./mockDb.types";
import { seedTasks } from "./tasksApiMock";

/**
 * Get the database from localStorage
 * Returns null if not found or corrupted
 *
 * NOTE: All date fields are stored as ISO timestamp strings.
 * No Date object revival is needed since the new Task interface uses strings.
 */
function getDbFromStorage(): MockDbSchema | null {
  try {
    const raw = localStorage.getItem(MOCK_DB_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    // Validate schema
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof parsed.schemaVersion !== "number" ||
      !Array.isArray(parsed.tasks) ||
      typeof parsed.updatedAt !== "string"
    ) {
      console.warn("MockDB: Invalid schema in localStorage, will reset");
      return null;
    }

    // Check schema version
    if (parsed.schemaVersion !== CURRENT_SCHEMA_VERSION) {
      console.warn(
        `MockDB: Schema version mismatch (found ${parsed.schemaVersion}, expected ${CURRENT_SCHEMA_VERSION}), will reset`,
      );
      return null;
    }

    // No Date revival needed - all dates are ISO strings in the new Task interface

    return parsed as MockDbSchema;
  } catch (error) {
    console.error("MockDB: Error reading from localStorage", error);
    return null;
  }
}

/**
 * Save the database to localStorage
 */
function saveDbToStorage(db: MockDbSchema): void {
  try {
    const serialized = JSON.stringify(db);
    localStorage.setItem(MOCK_DB_KEY, serialized);
  } catch (error) {
    console.error("MockDB: Error saving to localStorage", error);
    throw error;
  }
}


/**
 * Initialize the database with seed data
 */
function initializeDb(): MockDbSchema {
  const db: MockDbSchema = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    tasks: seedTasks(),
    updatedAt: new Date().toISOString(),
  };

  saveDbToStorage(db);
  console.log("MockDB: Initialized with seed data");

  return db;
}

// In-memory cache to avoid repeated localStorage reads
let dbCache: MockDbSchema | null = null;

/**
 * Get the current database
 * Loads from localStorage on first call, then uses in-memory cache
 */
export function getDb(): MockDbSchema {
  if (dbCache) {
    return dbCache;
  }

  // Try to load from localStorage
  let db = getDbFromStorage();

  // If not found or corrupted, initialize with seed data
  if (!db) {
    db = initializeDb();
  }

  dbCache = db;
  return db;
}

/**
 * Save the database
 * Updates both in-memory cache and localStorage
 */
export function saveDb(db: MockDbSchema): void {
  db.updatedAt = new Date().toISOString();
  dbCache = db;
  saveDbToStorage(db);
}

/**
 * Reset the database to seed data
 * Clears localStorage and reinitializes
 */
export function resetDb(): void {
  localStorage.removeItem(MOCK_DB_KEY);
  dbCache = null;
  initializeDb();
  console.log("MockDB: Reset to seed data");
}

/**
 * Check for duplicate task IDs and log a warning if found
 * This is a dev-only sanity check to catch bugs early
 */
function checkForDuplicateIds(tasks: Task[], context: string): void {
  const idSet = new Set<string>();
  const duplicates: string[] = [];

  for (const task of tasks) {
    if (idSet.has(task.id)) {
      duplicates.push(task.id);
    } else {
      idSet.add(task.id);
    }
  }

  if (duplicates.length > 0) {
    console.error(
      `[MockDB] DUPLICATE IDs DETECTED (${context}):`,
      duplicates,
      "\nThis indicates a bug in task creation or persistence.",
      "\nCall window.__TMS_MOCK_DB_RESET__() to reset the database."
    );
  }
}

/**
 * Get all tasks from the database
 * Includes a dev-only duplicate ID check
 */
export function getAllTasks(): Task[] {
  const db = getDb();

  // Dev-only sanity check for duplicate IDs
  if (process.env.NODE_ENV !== "production") {
    checkForDuplicateIds(db.tasks, "getAllTasks");
  }

  return db.tasks;
}

/**
 * Update tasks in the database
 * Includes validation to prevent duplicate IDs
 */
export function updateTasks(updater: (tasks: Task[]) => Task[]): void {
  const db = getDb();
  const updatedTasks = updater(db.tasks);

  // Dev-only sanity check for duplicate IDs after update
  if (process.env.NODE_ENV !== "production") {
    checkForDuplicateIds(updatedTasks, "updateTasks");
  }

  db.tasks = updatedTasks;
  saveDb(db);
}

// Expose reset function globally for dev convenience
if (typeof window !== "undefined") {
  (window as typeof window & { __TMS_MOCK_DB_RESET__?: () => void }).__TMS_MOCK_DB_RESET__ =
    resetDb;
  console.log(
    "MockDB: Dev utility available - call window.__TMS_MOCK_DB_RESET__() to reset data",
  );
}
