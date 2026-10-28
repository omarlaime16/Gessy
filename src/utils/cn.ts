export type ClassValue = string | number | boolean | undefined | null;

/**
 * Utility function to conditionally join CSS class names cleanly.
 */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}
