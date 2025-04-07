/**
 * Utility functions used throughout the application
 */

/**
 * Formats a duration in milliseconds to a human-readable string
 * @param ms Duration in milliseconds
 * @returns Formatted string (e.g., "500ms", "30s", "2m 15s")
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Truncates a string to a maximum length and adds ellipsis if needed
 * @param str The string to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated string
 */
export function truncateString(str: string, maxLength: number): string {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}

/**
 * Formats a date string to a locale date string
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString();
}

/**
 * Formats a date string to a locale date and time string
 * @param dateString ISO date string
 * @returns Formatted date and time string
 */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString();
}

/**
 * Formats a date string to a locale time string
 * @param dateString ISO date string
 * @returns Formatted time string
 */
export function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString();
}
