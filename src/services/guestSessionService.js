const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002';

const guestSessionService = {
  async getOrCreateGuestSession() {
    let guestSessionToken = localStorage.getItem('guestSessionToken');
    if (guestSessionToken) {
      // ✅ VALIDATE: Check if token is still valid
      const isValid = await this.validateToken(guestSessionToken);
      if (isValid) {
        return guestSessionToken;
      } else {
        console.log('🔄 Guest session expired, creating new one...');
        localStorage.removeItem('guestSessionToken');
      }
    }
    
    const response = await fetch(`${API_BASE_URL}/api/session/guest-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      console.error('❌ Guest session creation failed:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      throw new Error(`Failed to create guest session: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('🔍 Guest session API response:', data);
    
    // ✅ FIX: Handle the actual response format { token: "..." }
    if (data.token) {
      localStorage.setItem('guestSessionToken', data.token);
      console.log('✅ Guest session created successfully');
      return data.token;
    }
    
    console.error('❌ No token in response:', data);
    throw new Error('Invalid guest session response - no token received');
  },

  // ✅ VALIDATE: Token expiry check
  async validateToken(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      
      return payload.exp > now;
    } catch {
      return false;
    }
  },

  clearGuestSession() {
    localStorage.removeItem('guestSessionToken');
    console.log('🔄 Guest session cleared');
  }
};

export default guestSessionService;