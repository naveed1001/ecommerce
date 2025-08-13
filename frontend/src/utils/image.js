/**
 * Get the API origin from environment or fallback to browser location
 */
export const getApiOrigin = () => {
  const envApiUrl = process.env.REACT_APP_API_URL;

  // Prefer the API URL from environment variables
  if (envApiUrl) {
    try {
      return new URL(envApiUrl).origin;
    } catch {
      // If env var is not a valid URL, fall back to window location
    }
  }

  // Fallback: use the browser's origin if available
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return '';
};

/**
 * Build a full image URL from a given path
 * - If absolute (http://, https://, //, or data:), return as is
 * - If starts with /uploads, prepend the API origin
 * - Otherwise, return unchanged
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';

  const isAbsolute =
    /^(https?:)?\/\//i.test(imagePath) || imagePath.startsWith('data:');

  if (isAbsolute) return imagePath;

  if (imagePath.startsWith('/uploads')) {
    return `${getApiOrigin()}${imagePath}`;
  }

  return imagePath;
};