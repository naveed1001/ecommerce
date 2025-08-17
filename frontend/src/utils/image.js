/**
 * Get the API origin from environment or fallback to backend server
 */
export const getApiOrigin = () => {
  const envApiUrl = process.env.REACT_APP_API_URL;

  // Prefer environment variable if valid
  if (envApiUrl) {
    try {
      return new URL(envApiUrl).origin;
    } catch {
      // ignore invalid URL, fallback below
    }
  }

  // Development: use relative URLs with proxy (CRA / Vite dev server)
  if (process.env.NODE_ENV === "development") {
    return "";
  }

  // Production: use current window origin
  if (typeof window !== "undefined" && window.location?.origin) {
    if (
      window.location.origin.includes("localhost:3000") ||
      window.location.origin.includes("127.0.0.1:3000")
    ) {
      return ""; // dev proxy
    }
    return window.location.origin;
  }

  // Final fallback (useful in SSR or misconfigured envs)
  return "http://localhost:5000";
};

/**
 * Build a full image URL from a given path
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return "";

  // Already a valid absolute or data URI
  const isAbsolute =
    /^(https?:)?\/\//i.test(imagePath) || imagePath.startsWith("data:");
  if (isAbsolute) return imagePath;

  // Uploaded files -> prepend API origin if available
  if (imagePath.startsWith("/uploads")) {
    const apiOrigin = getApiOrigin();
    return apiOrigin ? `${apiOrigin}${imagePath}` : imagePath;
  }

  return imagePath;
};
