import { useEffect, useState } from 'react';
import materialService from '../services/materialService';

/**
 * Shared hook for fetching the live, admin-managed materials list.
 * Every component that needs materials (Add Product, Edit Product, Filters,
 * Bulk Upload, Vendor Product List) should call this instead of duplicating
 * the fetch/sort/error-handling logic. Adding a material via the admin UI
 * means every one of these updates automatically — no frontend change needed.
 *
 * Returns:
 *   materials      — sorted array of material objects ({_id, name, material_code, ...})
 *   materialNames  — sorted array of just the name strings, for components
 *                     that only need plain strings (e.g. <option value>)
 *   loading        — true while the initial fetch is in flight
 *   error          — a user-facing message if the fetch failed or returned empty, else null
 */
export function useMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadMaterials = async () => {
      setLoading(true);
      const data = await materialService.fetchActiveMaterials();

      if (!isMounted) return;

      const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));

      if (sorted.length === 0) {
        setError('Unable to load materials right now. Please refresh or try again shortly.');
      } else {
        setError(null);
      }

      setMaterials(sorted);
      setLoading(false);
    };

    loadMaterials();

    return () => {
      isMounted = false;
    };
  }, []);

  const materialNames = materials.map(m => m.name);

  return { materials, materialNames, loading, error };
}

export default useMaterials;
