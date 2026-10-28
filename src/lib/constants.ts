import { NavItem } from '../types';

export interface DefaultCategoryItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  sort_order: number;
  is_default: boolean;
}

export const DEFAULT_CATEGORIES: DefaultCategoryItem[] = [
  { id: 'cat-food', name: 'Comida', icon: '🍔', color: 'amber', sort_order: 1, is_default: true },
  { id: 'cat-transport', name: 'Transporte', icon: '🚗', color: 'blue', sort_order: 2, is_default: true },
  { id: 'cat-housing', name: 'Vivienda', icon: '🏠', color: 'slate', sort_order: 3, is_default: true },
  { id: 'cat-services', name: 'Servicios', icon: '💡', color: 'yellow', sort_order: 4, is_default: true },
  { id: 'cat-entertainment', name: 'Entretenimiento', icon: '🎬', color: 'purple', sort_order: 5, is_default: true },
  { id: 'cat-shopping', name: 'Compras', icon: '🛒', color: 'pink', sort_order: 6, is_default: true },
  { id: 'cat-health', name: 'Salud', icon: '🏥', color: 'red', sort_order: 7, is_default: true },
  { id: 'cat-education', name: 'Educación', icon: '📚', color: 'indigo', sort_order: 8, is_default: true },
  { id: 'cat-clothing', name: 'Ropa', icon: '👔', color: 'teal', sort_order: 9, is_default: true },
  { id: 'cat-tech', name: 'Tecnología', icon: '📱', color: 'cyan', sort_order: 10, is_default: true },
  { id: 'cat-gifts', name: 'Regalos', icon: '🎁', color: 'rose', sort_order: 11, is_default: true },
  { id: 'cat-travel', name: 'Viajes', icon: '✈️', color: 'sky', sort_order: 12, is_default: true },
  { id: 'cat-savings', name: 'Ahorro', icon: '💰', color: 'emerald', sort_order: 13, is_default: true },
  { id: 'cat-other', name: 'Otros', icon: '📦', color: 'gray', sort_order: 14, is_default: true },
];

export const CURRENCY = {
  code: 'PEN',
  symbol: 'S/',
  locale: 'es-PE',
} as const;

export const ALERT_THRESHOLDS = {
  warning: 60,
  danger: 80,
} as const;

export const NAV_ITEMS: NavItem[] = [
  {
    path: '/',
    icon: 'LayoutDashboard',
    label: 'Dashboard',
  },
  {
    path: '/transacciones',
    icon: 'ArrowLeftRight',
    label: 'Transacciones',
  },
  {
    path: '/presupuestos',
    icon: 'PieChart',
    label: 'Presupuestos',
  },
  {
    path: '/analisis',
    icon: 'BarChart3',
    label: 'Análisis',
  },
  {
    path: '/metas',
    icon: 'Target',
    label: 'Metas',
  },
];
