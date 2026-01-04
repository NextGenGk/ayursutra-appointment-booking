// API Configuration
export const config = {
  // Use localhost for now since Vercel has old code with FK errors
  // Switch to Vercel after deploying the fixes
  apiUrl: process.env.NEXT_PUBLIC_API_URL || '',
  
  // Helper function to get full API URL
  getApiUrl: (path: string) => {
    // Use localhost (relative paths) until Vercel is updated
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    
    // If no base URL, use relative path (localhost)
    if (!baseUrl) {
      return `/${path}`;
    }
    
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${baseUrl}/${cleanPath}`;
  },
};

export default config;
