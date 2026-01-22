import { Task } from "../pages/RequestListingPage/types";
import { serializeEventToXml } from "./xmlSerializers";

/**
 * Generate XML content for export (ERD-compliant)
 *
 * Each task gets converted to an event XML element using centralized
 * serialization logic from xmlSerializers.ts.
 *
 * Output format matches ERD specifications:
 * - Datetime fields as epoch milliseconds
 * - Boolean fields as 0/1
 * - Includes userGroup per ERD requirements
 *
 * @param tasks - Array of Task objects to export
 * @returns Complete XML document string
 */
export function generateXml(tasks: Task[]): string {
  const xmlElements: string[] = [];

  tasks.forEach((task, index) => {
    const eventNumber = String(index + 1).padStart(3, "0");
    const eventXml = serializeEventToXml(task, eventNumber);
    xmlElements.push(eventXml);
  });

  return `<?xml version="1.0" encoding="UTF-8"?>\n<events>\n${xmlElements.join("\n\n")}\n</events>`;
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
    hash = (hash << 5) - hash + char;
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
