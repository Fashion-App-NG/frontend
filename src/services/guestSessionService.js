const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const guestSessionService = {
  async getOrCreateGuestSession() {
    let guestSessionToken = localStorage.getItem('guestSessionToken');
    if (guestSessionToken) {
      return guestSessionToken;
    }
    const response = await fetch(`${API_BASE_URL}/api/session/guest-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to create guest session');
    const data = await response.json();
    if (data.token) {
      localStorage.setItem('guestSessionToken', data.token);
      return data.token;
    }
    throw new Error('No token received');
  },
  clearGuestSession() {
    localStorage.removeItem('guestSessionToken');
  }
};

export default guestSessionService;