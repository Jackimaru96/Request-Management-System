/**
 * XML Serialization Helpers (ERD-Compliant)
 *
 * This module provides centralized serialization logic for converting
 * Task data structures to ERD-compliant XML format.
 *
 * Key conversions per ERD:
 * - Datetime fields → epoch milliseconds (number)
 * - Boolean fields → 0 or 1 (number)
 * - Priority enum → numeric value (0-3)
 * - RequestType enum → string value
 *
 * Single source of truth for XML generation.
 */

import { Task, XmlPayload } from "../pages/RequestListingPage/types";

/**
 * Convert Date to epoch milliseconds
 * Returns undefined if date is undefined (preserves optionality)
 *
 * @param date - JavaScript Date object
 * @returns Epoch milliseconds since Jan 1, 1970 UTC, or undefined
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
 * - Date → epoch ms
 * - boolean → 0/1
 * - Enums → appropriate values
 *
 * Maps to payload structure defined in ERD (fields a-m).
 *
 * @param task - Task object from application state
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
  if (task.backcrawlDepth !== undefined) {
    payload.a = task.backcrawlDepth; // int (no conversion needed)
  }

  if (task.backcrawlEndTime) {
    payload.b = toEpochMs(task.backcrawlEndTime); // datetime → epoch ms
  }

  if (task.backcrawlStartTime) {
    payload.c = toEpochMs(task.backcrawlStartTime); // datetime → epoch ms
  }

  if (task.cutOffTime) {
    payload.d = toEpochMs(task.cutOffTime); // datetime → epoch ms
  }

  if (task.endCollectionTime) {
    payload.f = toEpochMs(task.endCollectionTime); // datetime → epoch ms
  }

  if (task.isAlwaysRun !== undefined) {
    payload.g = boolToInt(task.isAlwaysRun); // bool → 0/1
  }

  if (task.isCollectPopularPostOnly !== undefined) {
    payload.h = boolToInt(task.isCollectPopularPostOnly); // bool → 0/1
  }

  if (task.recurringFreq !== undefined) {
    payload.k = task.recurringFreq; // int (no conversion needed)
  }

  if (task.startCollectionTime) {
    payload.n = toEpochMs(task.startCollectionTime); // datetime → epoch ms
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
