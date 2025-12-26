// Helper function to make authenticated API calls
export async function apiCall(url: string, options: RequestInit = {}) {
  // Get token from localStorage if available
  const userStr = localStorage.getItem('user');
  let token: string | null = null;
  
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      token = user.token;
    } catch (e) {
      // Ignore parsing errors
    }
  }

  // Get token from cookie as fallback
  if (!token) {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(c => c.trim().startsWith('token='));
    if (tokenCookie) {
      token = tokenCookie.split('=')[1];
    }
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add Authorization header if token is available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  return response;
}

