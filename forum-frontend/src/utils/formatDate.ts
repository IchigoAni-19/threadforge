/**
 * Formats an ISO date string into a human-readable label.
 * Example: "Jun 13, 2026, 3:45 PM"
 */
export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
