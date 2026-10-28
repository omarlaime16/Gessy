import { useState, useEffect, useCallback } from 'react';
import { Category } from '../types';
import { DEFAULT_CATEGORIES } from '../lib/constants';
import { generateId } from '../lib/utils';

export interface CategoryFormData {
  name: string;
  icon: string;
  color: string;
  sort_order?: number;
  user_id?: string | null;
}

export interface UseCategoriesReturn {
  categories: Category[];
  addCategory: (data: CategoryFormData) => Category;
  updateCategory: (id: string, data: Partial<CategoryFormData>) => boolean;
  deleteCategory: (id: string) => boolean;
  getCategoryById: (id: string) => Category | undefined;
  resetToDefaults?: () => void;
}

const STORAGE_KEY = 'gessy_categories';

/**
 * Initializes categories from localStorage or maps default categories
 */
function getInitialCategories(): Category[] {
  if (typeof window === 'undefined') {
    return DEFAULT_CATEGORIES.map((cat) => ({
      ...cat,
      user_id: 'mock-user',
      created_at: new Date().toISOString(),
    }));
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter(
          (item): item is Category =>
            item !== null &&
            typeof item === 'object' &&
            typeof item.id === 'string' &&
            typeof item.name === 'string'
        );
      }
    }
  } catch (error) {
    console.error('Error al cargar categorías de localStorage:', error);
  }

  return DEFAULT_CATEGORIES.map((cat) => ({
    ...cat,
    user_id: 'mock-user',
    created_at: new Date().toISOString(),
  }));
}

/**
 * Custom hook for category management with localStorage persistence.
 */
export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>(getInitialCategories);

  // Sync to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    } catch (error) {
      console.error('Error al guardar categorías en localStorage:', error);
    }
  }, [categories]);

  /**
   * Adds a new custom category (is_default: false)
   */
  const addCategory = useCallback((data: CategoryFormData): Category => {
    const maxSortOrder = categories.length > 0
      ? Math.max(...categories.map((c) => c.sort_order || 0))
      : 0;

    const newCategory: Category = {
      id: generateId(),
      name: data.name.trim(),
      icon: data.icon,
      color: data.color,
      sort_order: data.sort_order ?? maxSortOrder + 1,
      is_default: false,
      user_id: data.user_id ?? 'mock-user',
      created_at: new Date().toISOString(),
    };

    setCategories((prev) => [...prev, newCategory]);
    return newCategory;
  }, [categories]);

  /**
   * Updates an existing category by ID
   */
  const updateCategory = useCallback((id: string, data: Partial<CategoryFormData>): boolean => {
    let updated = false;
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === id) {
          updated = true;
          return {
            ...cat,
            ...(data.name !== undefined ? { name: data.name.trim() } : {}),
            ...(data.icon !== undefined ? { icon: data.icon } : {}),
            ...(data.color !== undefined ? { color: data.color } : {}),
            ...(data.sort_order !== undefined ? { sort_order: data.sort_order } : {}),
            ...(data.user_id !== undefined ? { user_id: data.user_id } : {}),
          };
        }
        return cat;
      })
    );
    return updated;
  }, []);

  /**
   * Deletes a category by ID if it is not a default category
   */
  const deleteCategory = useCallback((id: string): boolean => {
    const target = categories.find((c) => c.id === id);
    if (!target) {
      console.warn(`Categoría no encontrada con id: ${id}`);
      return false;
    }
    if (target.is_default) {
      console.warn(`No se puede eliminar una categoría predeterminada: ${target.name}`);
      return false;
    }
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    return true;
  }, [categories]);

  /**
   * Finds category by its ID
   */
  const getCategoryById = useCallback(
    (id: string): Category | undefined => {
      return categories.find((c) => c.id === id);
    },
    [categories]
  );

  /**
   * Resets categories to default state
   */
  const resetToDefaults = useCallback(() => {
    const defaults: Category[] = DEFAULT_CATEGORIES.map((cat) => ({
      ...cat,
      user_id: 'mock-user',
      created_at: new Date().toISOString(),
    }));
    setCategories(defaults);
  }, []);

  return {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    resetToDefaults,
  };
}
