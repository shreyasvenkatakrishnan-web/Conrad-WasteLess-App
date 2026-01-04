
export type ProductCategory =
  | 'produce'
  | 'dairy'
  | 'meat'
  | 'poultry'
  | 'seafood'
  | 'bakery'
  | 'pantry'
  | 'frozen'
  | 'beverages'
  | 'snacks'
  | 'deli';

export type InventoryUnit =
  | 'pieces'
  | 'lbs'
  | 'oz'
  | 'kg'
  | 'g'
  | 'liters'
  | 'ml'
  | 'cups'
  | 'containers'
  | 'packages'
  | 'bottles'
  | 'cans'
  | 'bags';

export type InventoryCategory =
  | 'fruits'
  | 'vegetables'
  | 'meat-poultry'
  | 'seafood'
  | 'dairy-eggs'
  | 'pantry'
  | 'frozen'
  | 'condiments'
  | 'snacks'
  | 'beverages'
  | 'other';

export interface Product {
  id: string;
  name: string;
  price: number;
  storeId: string;
  category: ProductCategory;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  isOrganic: boolean;
  isOnSale: boolean;
  salePrice?: number;
  saleEndDate?: string;
  imageUrl?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  storeId: string;
  isOrganic: boolean;
  isOnSale: boolean;
  category: ProductCategory;
  imageUrl?: string;
}

export interface StorageAdvice {
  location: 'Pantry' | 'Fridge' | 'Freezer';
  temperature: string;
  container: string;
  tips: string[];
  shelfLifeExtension: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: InventoryUnit;
  category: InventoryCategory;
  expiryDate?: string;
  addedDate: string;
  notes?: string;
  imageUrl?: string;
  storageAdvice?: StorageAdvice;
}

export interface Recommendation {
  id: string;
  name: string;
  reason: string;
  category: ProductCategory;
  estimatedPrice: number;
  isReplacement: boolean;
}

export interface NutritionGoals {
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
}

export interface Budget {
  weeklyAmount: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  extractedItems?: Partial<CartItem>[];
}

export interface GroceryStore {
  id: string;
  name: string;
  address: string;
  isFavorite: boolean;
  isSelected: boolean;
}

export interface Deal {
  id: string;
  title: string;
  description: string;
  discountType: 'bogo' | 'percentage' | 'fixed' | 'bundle';
  discountValue: number;
  applicableProductIds: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Integration {
  id: string;
  name: string;
  category: 'fitness' | 'shopping' | 'health';
  isConnected: boolean;
  icon: string;
  description: string;
  lastSynced?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  ingredients: string[];
  instructions: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUrl?: string;
  imageAlt?: string;
}

export type ViewType = 'dashboard' | 'shop' | 'cart' | 'inventory' | 'calendar' | 'chat' | 'checkout' | 'stores' | 'settings' | 'deals' | 'integrations' | 'recipes';
