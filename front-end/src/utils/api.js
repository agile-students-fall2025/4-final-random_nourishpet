// API utility for handling API base URL
// In Docker, nginx proxies /api requests, so we use relative URLs
// In local development, we use the full URL
export const getApiBaseUrl = () => {
  // If REACT_APP_API_BASE_URL is set, use it (for local development)
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  // Otherwise, use relative URLs (for Docker/production where nginx proxies)
  return '';
};

export const API_BASE_URL = getApiBaseUrl();

