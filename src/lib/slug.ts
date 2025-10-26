/**
 * Converts a string to a URL-friendly slug
 * - Converts to lowercase
 * - Replaces spaces with dashes
 * - Removes non-alphanumeric characters
 * - Truncates to 80 characters
 */
export function toSlug(title: string): string {
  return title
    .toLowerCase() // convert to lowercase
    .trim() // remove leading/trailing whitespace
    .replace(/[^\w\s-]/g, '') // remove non-word chars (except spaces and dashes)
    .replace(/[\s_-]+/g, '-') // replace spaces and underscores with single dash
    .replace(/^-+|-+$/g, '') // remove leading/trailing dashes
    .slice(0, 80); // truncate to 80 chars
}