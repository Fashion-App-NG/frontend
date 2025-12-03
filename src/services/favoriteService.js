const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3002";

class FavoriteService {
  // ✅ Remove useless constructor
  getAuthHeaders() {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication required for favorites");
    }
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async addToFavorites(productId) {
    // ❌ REMOVE localStorage fallback
    try {
      const response = await fetch(`${API_BASE_URL}/api/favorites`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ productId }),
      });

      if (response.status === 401) {
        throw new Error("Session expired");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add to favorites");
      }

      return await response.json();
    } catch (error) {
      console.error("❌ Add to favorites failed:", error);
      throw error;
    }
  }

  async getFavorites() {
    // ❌ REMOVE localStorage fallback
    try {
      const response = await fetch(`${API_BASE_URL}/api/favorites`, {
        headers: this.getAuthHeaders(),
      });

      if (response.status === 401) {
        throw new Error("Session expired");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to get favorites");
      }

      return await response.json();
    } catch (error) {
      console.error("❌ Get favorites failed:", error);
      throw error;
    }
  }

  async removeFromFavorites(productId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/favorites/${productId}`,
        {
          method: "DELETE",
          headers: this.getAuthHeaders(),
        }
      );

      if (response.status === 401) {
        throw new Error("Session expired");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove from favorites");
      }

      return await response.json();
    } catch (error) {
      console.error("❌ Remove from favorites failed:", error);
      throw error;
    }
  }

  async checkIsFavorite(productId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/favorites/check/${productId}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        return { isFavorite: false };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("❌ Check favorite failed:", error);
      return { isFavorite: false };
    }
  }
}

const favoriteService = new FavoriteService();
export default favoriteService;
