import { CSSProperties } from "react";

export const priorityColors: Record<string, { bg: string; text: string }> = {
  Urgent: { bg: "#f44236", text: "#fff" },
  High: { bg: "#fea829", text: "#000" },
  Medium: { bg: "#547992", text: "#000" },
  Low: { bg: "#4a4a4a", text: "#fff" },
};

export const strikethroughDimmedStyle = (isPendingDeletion: boolean): CSSProperties => ({
  opacity: isPendingDeletion ? 0.6 : 1,
  textDecoration: isPendingDeletion ? "line-through" : "none",
});
