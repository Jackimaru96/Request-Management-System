/**
 * XML Serialization Helpers (ERD-Compliant)
 *
 * This module provides centralized serialization logic for converting
 * Task data structures to ERD-compliant XML format.
 *
 * Key conversions per ERD:
 * - Datetime fields (ISO strings) → epoch milliseconds (number)
 * - Boolean fields → 0 or 1 (number)
 * - Priority enum → numeric value (0-3)
 * - RequestType enum → string value
 *
 * Single source of truth for XML generation.
 */

import { Task, XmlPayload } from "../pages/RequestListingPage/types";

/**
 * Convert ISO timestamp string to epoch milliseconds
 * Returns undefined if input is undefined/null (preserves optionality)
 *
 * @param isoString - ISO timestamp string (e.g., "2026-01-27T15:38:13.998+08:00")
 * @returns Epoch milliseconds since Jan 1, 1970 UTC, or undefined
 */
export function isoToEpochMs(isoString: string | undefined | null): number | undefined {
  if (!isoString) {
    return undefined;
  }
  return new Date(isoString).getTime();
}

/**
 * @deprecated Use isoToEpochMs instead - Task date fields are now ISO strings
 */
export function toEpochMs(date: Date | undefined): number | undefined {
  if (!date) {
    return undefined;
  }
  return date.getTime();
}

/**
 * Convert boolean to integer (0 or 1) per ERD requirements
 * Returns undefined if value is undefined (preserves optionality)
 *
 * @param value - Boolean value
 * @returns 1 if true, 0 if false, undefined if undefined
 */
export function boolToInt(value: boolean | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  return value ? 1 : 0;
}

/**
 * Convert Task to ERD-compliant XmlPayload
 *
 * This function performs all necessary type conversions:
 * - ISO string → epoch ms
 * - boolean → 0/1
 * - Enums → appropriate values
 *
 * Maps to payload structure defined in ERD (fields a-p).
 *
 * @param task - Task object from application state (date fields are ISO strings)
 * @returns XmlPayload with properly serialized values
 */
export function serializePayload(task: Task): XmlPayload {
  const payload: XmlPayload = {
    // Required fields
    e: task.contentType, // contentType (string)
    j: task.priority, // priority (numeric enum value 0-3)
    m: task.requestType, // requestType (string enum value)
    p: task.url, // url (string)
  };

  // Optional fields with proper conversions
  if (task.backcrawlDepthHours !== undefined) {
    payload.a = task.backcrawlDepthHours; // int (no conversion needed)
  }

  if (task.backcrawlEndTime) {
    payload.b = isoToEpochMs(task.backcrawlEndTime); // ISO string → epoch ms
  }

  if (task.backcrawlStartTime) {
    payload.c = isoToEpochMs(task.backcrawlStartTime); // ISO string → epoch ms
  }

  if (task.cutOffTime) {
    payload.d = isoToEpochMs(task.cutOffTime); // ISO string → epoch ms
  }

  if (task.endCollectionTime) {
    payload.f = isoToEpochMs(task.endCollectionTime); // ISO string → epoch ms
  }

  if (task.isAlwaysRun !== undefined) {
    payload.g = boolToInt(task.isAlwaysRun); // bool → 0/1
  }

  if (task.isCollectPopularPostOnly !== undefined) {
    payload.h = boolToInt(task.isCollectPopularPostOnly); // bool → 0/1
  }

  if (task.recurringFreqHours !== undefined) {
    payload.k = task.recurringFreqHours; // int (no conversion needed)
  }

  if (task.startCollectionTime) {
    payload.n = isoToEpochMs(task.startCollectionTime); // ISO string → epoch ms
  }

  return payload;
}

/**
 * Escape special XML characters to prevent injection
 *
 * @param text - Raw text to escape
 * @returns XML-safe text
 */
export function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Serialize a single event to XML format (ERD-compliant)
 *
 * Generates XML structure per ERD:
 * <eventNNN>
 *   <eventType>...</eventType>
 *   <requestId>...</requestId>
 *   <userGroup>...</userGroup>
 *   <ver>...</ver>
 *   <payload>
 *     <a>...</a>
 *     <b>...</b>
 *     ...
 *   </payload>
 * </eventNNN>
 *
 * @param task - Task object containing event data
 * @param eventNumber - Zero-padded event number (e.g., "001")
 * @returns Complete XML string for this event
 */
export function serializeEventToXml(task: Task, eventNumber: string): string {
  const payload = serializePayload(task);

  // Sort payload keys alphabetically (a, b, c, ..., m) and convert to XML
  const payloadXml = Object.keys(payload)
    .sort()
    .map((key) => {
      const value = payload[key as keyof XmlPayload];
      if (value === undefined) {
        return "";
      }
      // Convert value to string and escape
      return `    <${key}>${escapeXml(String(value))}</${key}>`;
    })
    .filter((line) => line !== "")
    .join("\n");

  // Construct event XML per ERD structure
  const eventXml = `<event${eventNumber}>
  <eventType>${task.latestEvent?.eventType || "CREATE"}</eventType>
  <requestId>${task.id}</requestId>
  <userGroup>${task.userGroup}</userGroup>
  <ver>${task.version}</ver>
  <payload>
${payloadXml}
  </payload>
</event${eventNumber}>`;

  return eventXml;
}
