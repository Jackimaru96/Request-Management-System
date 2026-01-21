import { Task, XmlPayload, requestToXmlPayload } from "../pages/RequestListingPage/types";

/**
 * Generate XML content for export
 * Each task with LOCAL status gets converted to an event XML element
 */
export function generateXml(tasks: Task[]): string {
  const xmlElements: string[] = [];

  tasks.forEach((task, index) => {
    const eventNumber = String(index + 1).padStart(3, "0");
    const payload = taskToXmlPayload(task);

    const payloadXml = Object.entries(payload)
      .map(([key, value]) => {
        if (value === undefined) {
          return "";
        }
        return `    <${key}>${escapeXml(String(value))}</${key}>`;
      })
      .filter((line) => line !== "")
      .join("\n");

    const eventXml = `<event${eventNumber}>
  <eventType>${task.latestEvent?.eventType || "CREATE"}</eventType>
  <requestId>${task.id}</requestId>
  <ver>${task.version}</ver>
  <payload>
${payloadXml}
  </payload>
</event${eventNumber}>`;

    xmlElements.push(eventXml);
  });

  return `<?xml version="1.0" encoding="UTF-8"?>\n<events>\n${xmlElements.join("\n\n")}\n</events>`;
}

/**
 * Convert Task to XmlPayload
 * Maps task fields to XML payload structure (a-m)
 */
function taskToXmlPayload(task: Task): XmlPayload {
  const payload: XmlPayload = {
    m: task.url,
    k: task.requestType,
    i: task.priority,
    e: task.contentType,
  };

  if (task.backcrawlDepth !== undefined) {
    payload.a = task.backcrawlDepth;
  }
  if (task.backcrawlEndTime) {
    payload.b = task.backcrawlEndTime.toISOString();
  }
  if (task.backcrawlStartTime) {
    payload.c = task.backcrawlStartTime.toISOString();
  }
  if (task.cutOffTime) {
    payload.d = task.cutOffTime.toISOString();
  }
  if (task.endCollectionTime) {
    payload.f = task.endCollectionTime.toISOString();
  }
  if (task.isAlwaysRun !== undefined) {
    payload.g = task.isAlwaysRun;
  }
  if (task.isCollectPopularPostOnly !== undefined) {
    payload.h = task.isCollectPopularPostOnly;
  }
  if (task.recurringFreq !== undefined) {
    payload.j = task.recurringFreq;
  }
  if (task.startCollectionTime) {
    payload.l = task.startCollectionTime.toISOString();
  }

  return payload;
}

/**
 * Escape special XML characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Simple stub encryption for XML
 * In production, use a proper encryption library
 * For now, we'll use base64 encoding with a password marker
 */
export function encryptXml(xmlContent: string, password: string): string {
  // Simple base64 encoding with password hash marker
  // In production, use crypto-js or similar library for AES encryption
  const passwordHash = simpleHash(password);
  const base64Content = btoa(xmlContent);

  return `ENCRYPTED(${passwordHash})::\n${base64Content}`;
}

/**
 * Simple hash function for password (NOT secure, just for demonstration)
 * In production, use a proper hashing algorithm
 */
function simpleHash(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Trigger browser download of the encrypted XML file
 */
export function downloadXmlFile(encryptedContent: string, filename = "tms_export.xml"): void {
  const blob = new Blob([encryptedContent], { type: "text/xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
