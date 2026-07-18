// Public material lookup service — no auth required.
// Used anywhere a vendor or shopper needs the list of active fabric materials
// (product upload form, product filters, etc). Backed by the same Material
// collection the admin CRUD (adminService.js) manages, but exposed here via
// a read-only, unauthenticated endpoint since vendors/shoppers aren't admins.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

class MaterialService {
    /**
     * Fetch all active materials for use in dropdowns/filters.
     * Returns an array of { _id, name, material_code, weightCategory, description }.
     * Returns [] (never throws) on failure, so calling components can render
     * an empty/fallback state instead of crashing the form.
     */
    async fetchActiveMaterials() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/materials`);
            const data = await response.json();

            if (!response.ok) {
                console.error('Failed to fetch materials:', data.message);
                return [];
            }

            return data.materials || [];

        } catch (error) {
            console.error('Error fetching materials:', error);
            return [];
        }
    }
}

export const materialService = new MaterialService();
export default materialService;
