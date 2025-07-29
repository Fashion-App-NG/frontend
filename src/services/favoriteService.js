const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002';

class FavoriteService {
  constructor() {
    this.localStorageKey = 'fashion-app-favorites';
    this.useLocalStorage = true; // ✅ Fall back to localStorage until API is fixed
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  // Get local favorites from localStorage
  getLocalFavorites() {
    try {
      const favorites = localStorage.getItem(this.localStorageKey);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Failed to parse local favorites:', error);
      return [];
    }
  }

  // Save local favorites to localStorage
  saveLocalFavorites(favorites) {
    localStorage.setItem(this.localStorageKey, JSON.stringify(favorites));
  }

  async addToFavorites(productId) {
    if (this.useLocalStorage) {
      const favorites = this.getLocalFavorites();
      if (!favorites.includes(productId)) {
        favorites.push(productId);
        this.saveLocalFavorites(favorites);
      }
      return { success: true };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/favorites`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ productId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add to favorites');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Add to favorites failed:', error);
      throw error;
    }
  }

  async removeFromFavorites(productId) {
    if (this.useLocalStorage) {
      const favorites = this.getLocalFavorites();
      const index = favorites.indexOf(productId);
      if (index !== -1) {
        favorites.splice(index, 1);
        this.saveLocalFavorites(favorites);
      }
      return { success: true };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/favorites/${productId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove from favorites');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Remove from favorites failed:', error);
      throw error;
    }
  }

  async getFavorites() {
    if (this.useLocalStorage) {
      const favorites = this.getLocalFavorites();
      return { favorites };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/favorites`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get favorites');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Get favorites failed:', error);
      throw error;
    }
  }

  async checkIsFavorite(productId) {
    if (this.useLocalStorage) {
      const favorites = this.getLocalFavorites();
      return { isFavorite: favorites.includes(productId) };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/favorites/check/${productId}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        return { isFavorite: false };
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Check favorite failed:', error);
      return { isFavorite: false };
    }
  }
}

const favoriteService = new FavoriteService();
export default favoriteService;