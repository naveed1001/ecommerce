/**
 * Get the API origin from environment or fallback to backend server
 */
export const getApiOrigin = () => {
  const envApiUrl = process.env.REACT_APP_API_URL;

  // Prefer the API URL from environment variables
  if (envApiUrl) {
    try {
      return new URL(envApiUrl).origin;
    } catch {
      // If env var is not a valid URL, fall back to default backend
    }
  }

  // In development, if we have a proxy setup, we can use relative URLs
  if (process.env.NODE_ENV === 'development') {
    return ''; // Use relative URLs in development with proxy
  }

  // Fallback: use the backend server origin
  if (typeof window !== 'undefined' && window.location?.origin) {
    // Check if we're in development with proxy setup
    if (window.location.origin.includes('localhost:3000') || window.location.origin.includes('127.0.0.1:3000')) {
      return ''; // Use relative URLs with proxy
    }
    return window.location.origin; // Production - same origin
  }

  return 'http://localhost:5000'; // Default backend URL
};

/**
 * Build a full image URL from a given path
 * - If absolute (http://, https://, //, or data:), return as is
 * - If starts with /uploads, prepend the API origin (or use relative in dev)
 * - Otherwise, return unchanged
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';

  const isAbsolute =
    /^(https?:)?\/\//i.test(imagePath) || imagePath.startsWith('data:');

  if (isAbsolute) return imagePath;

  if (imagePath.startsWith('/uploads')) {
    const apiOrigin = getApiOrigin();
    return apiOrigin ? `${apiOrigin}${imagePath}` : imagePath; // Use relative path if no origin
  }

  return imagePath;
};