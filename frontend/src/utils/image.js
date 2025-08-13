export const getApiOrigin = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  if (!apiUrl) {
    if (typeof window !== 'undefined' && window.location?.origin) {
      return window.location.origin;
    }
    return '';
  }
  try {
    const parsed = new URL(apiUrl);
    return parsed.origin;
  } catch (e) {
    if (typeof window !== 'undefined' && window.location?.origin) {
      return window.location.origin;
    }
    return '';
  }
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  const isAbsolute = /^(https?:)?\/\//i.test(imagePath) || imagePath.startsWith('data:');
  if (isAbsolute) return imagePath;
  if (imagePath.startsWith('/uploads')) {
    return `${getApiOrigin()}${imagePath}`;
  }
  return imagePath;
};