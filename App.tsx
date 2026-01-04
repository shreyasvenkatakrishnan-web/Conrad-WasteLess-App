
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Product, 
  CartItem, 
  InventoryItem, 
  NutritionGoals, 
  Budget, 
  ChatMessage, 
  ViewType,
  GroceryStore,
  InventoryUnit,
  InventoryCategory,
  Integration,
  ProductCategory
} from './types';
import { 
  DEFAULT_NUTRITION_GOALS, 
  MOCK_STORES, 
  MOCK_PRODUCTS, 
  MOCK_DEALS 
} from './constants';
import Dashboard from './components/Dashboard';
import Catalog from './components/Catalog';
import Cart from './components/Cart';
import Inventory from './components/Inventory';
import CalendarView from './components/CalendarView';
import Chat from './components/Chat';
import Checkout from './components/Checkout';
import StoreManager from './components/StoreManager';
import Deals from './components/Deals';
import Integrations from './components/Integrations';
import Recipes from './components/Recipes';
import NotificationCenter from './components/NotificationCenter';

const App: React.FC = () => {
  // --- Persisted State ---
  const [view, setView] = useState<ViewType>('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnseenAlerts, setHasUnseenAlerts] = useState(false);
  
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('inventory');
    return saved ? JSON.parse(saved) : [
      { id: 'i1', name: 'Eggs', quantity: 6, unit: 'pieces', category: 'dairy-eggs', expiryDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], addedDate: new Date().toISOString(), imageUrl: 'https://images.unsplash.com/photo-1582722872445-41ca507ad311?q=80&w=200&auto=format&fit=crop' },
      { id: 'i2', name: 'Milk', quantity: 1, unit: 'containers', category: 'dairy-eggs', expiryDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], addedDate: new Date().toISOString(), imageUrl: 'https://images.unsplash.com/photo-1550583724-b26cc28df5d1?q=80&w=200&auto=format&fit=crop' },
      { id: 'i3', name: 'Rice', quantity: 1, unit: 'bags', category: 'pantry', expiryDate: undefined, addedDate: new Date().toISOString(), imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=200&auto=format&fit=crop' }
    ];
  });

  // Track which alerts have been manually "seen" (cleared from the badge)
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('dismissedAlertIds');
    return saved ? JSON.parse(saved) : [];
  });

  const [goals, setGoals] = useState<NutritionGoals>(() => {
    const saved = localStorage.getItem('goals');
    return saved ? JSON.parse(saved) : DEFAULT_NUTRITION_GOALS;
  });
  const [budget, setBudget] = useState<Budget>(() => {
    const saved = localStorage.getItem('budget');
    return saved ? JSON.parse(saved) : { weeklyAmount: 150 };
  });
  const [stores, setStores] = useState<GroceryStore[]>(() => {
    const saved = localStorage.getItem('stores');
    return saved ? JSON.parse(saved) : MOCK_STORES;
  });
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [integrations, setIntegrations] = useState<Integration[]>(() => {
    const saved = localStorage.getItem('integrations');
    return saved ? JSON.parse(saved) : [
      { id: 'apple-health', name: 'Apple Health', category: 'health', isConnected: false, icon: 'fab fa-apple', description: 'Sync your calories and macro goals.' },
      { id: 'myfitnesspal', name: 'MyFitnessPal', category: 'fitness', isConnected: false, icon: 'fas fa-heartbeat', description: 'Log food intake automatically.' },
      { id: 'walmart', name: 'Walmart Plus', category: 'shopping', isConnected: false, icon: 'fas fa-shopping-bag', description: 'Import past purchase history.' },
    ];
  });

  // --- Effects ---
  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('inventory', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem('goals', JSON.stringify(goals)); }, [goals]);
  useEffect(() => { localStorage.setItem('budget', JSON.stringify(budget)); }, [budget]);
  useEffect(() => { localStorage.setItem('stores', JSON.stringify(stores)); }, [stores]);
  useEffect(() => { localStorage.setItem('chatHistory', JSON.stringify(chatHistory)); }, [chatHistory]);
  useEffect(() => { localStorage.setItem('integrations', JSON.stringify(integrations)); }, [integrations]);
  useEffect(() => { localStorage.setItem('dismissedAlertIds', JSON.stringify(dismissedAlertIds)); }, [dismissedAlertIds]);

  // --- Derived State ---
  const cartSubtotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);
  const cartNutrition = useMemo(() => cart.reduce((acc, item) => ({
    calories: acc.calories + (item.calories * item.quantity),
    protein: acc.protein + (item.protein * item.quantity),
    carbs: acc.carbs + (item.carbs * item.quantity),
    fat: acc.fat + (item.fat * item.quantity),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 }), [cart]);

  // alertItems now includes all items, regardless of dismissedAlertIds
  const alertItems = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    return inventory.reduce((acc, item) => {
      if (!item.expiryDate) return acc;
      const expiry = new Date(item.expiryDate);
      expiry.setHours(0,0,0,0);
      const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
      
      if (diff < 0) acc.expired.push(item);
      else if (diff <= 3) acc.expiringSoon.push(item);
      
      return acc;
    }, { expired: [] as InventoryItem[], expiringSoon: [] as InventoryItem[] });
  }, [inventory]);

  // unseenAlertsCount specifically calculates items the user hasn't seen yet
  const unseenAlertsCount = useMemo(() => {
    const expiredUnseen = alertItems.expired.filter(i => !dismissedAlertIds.includes(i.id)).length;
    const soonUnseen = alertItems.expiringSoon.filter(i => !dismissedAlertIds.includes(i.id)).length;
    return expiredUnseen + soonUnseen;
  }, [alertItems, dismissedAlertIds]);

  // Set unseen alerts flag for animation whenever new alerts appear that aren't dismissed
  useEffect(() => {
    if (unseenAlertsCount > 0) {
      setHasUnseenAlerts(true);
    } else {
      setHasUnseenAlerts(false);
    }
  }, [unseenAlertsCount]);

  // --- Actions ---
  const dismissAlerts = useCallback(() => {
    const currentAlertIds = [...alertItems.expired, ...alertItems.expiringSoon].map(i => i.id);
    if (currentAlertIds.length > 0) {
      setDismissedAlertIds(prev => [...new Set([...prev, ...currentAlertIds])]);
    }
    setHasUnseenAlerts(false);
  }, [alertItems]);

  const openNotifications = useCallback(() => {
    setShowNotifications(true);
  }, []);

  const closeNotifications = useCallback(() => {
    dismissAlerts();
    setShowNotifications(false);
  }, [dismissAlerts]);

  const addToCart = useCallback((product: Product | Partial<CartItem>) => {
    setCart(prev => {
      const isProduct = (p: any): p is Product => p && 'category' in p;
      const pId = isProduct(product) ? product.id : (product.productId || product.id);
      
      const existing = prev.find(i => i.productId === pId);
      if (existing) {
        return prev.map(i => i.productId === existing.productId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      
      let newItem: CartItem;
      if (isProduct(product)) {
        newItem = {
          id: Math.random().toString(36).substr(2, 9),
          productId: product.id,
          name: product.name,
          price: product.isOnSale && product.salePrice ? product.salePrice : product.price,
          quantity: 1,
          calories: product.calories,
          protein: product.protein,
          carbs: product.carbs,
          fat: product.fat,
          storeId: product.storeId,
          isOrganic: product.isOrganic,
          isOnSale: product.isOnSale,
          category: product.category,
          imageUrl: product.imageUrl,
        };
      } else {
        newItem = {
          id: Math.random().toString(36).substr(2, 9),
          productId: product.productId || product.id || '',
          name: product.name || 'Unknown Item',
          price: product.price || 0,
          quantity: product.quantity || 1,
          calories: product.calories || 0,
          protein: product.protein || 0,
          carbs: product.carbs || 0,
          fat: product.fat || 0,
          storeId: product.storeId || 's1',
          isOrganic: !!product.isOrganic,
          isOnSale: !!product.isOnSale,
          category: (product.category as ProductCategory) || 'pantry',
          imageUrl: product.imageUrl,
        };
      }
      return [...prev, newItem];
    });
  }, []);

  const updateCartQuantity = useCallback((id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return newQty === 0 ? null : { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const handleCheckoutSuccess = useCallback(() => {
    const now = new Date();
    const purchaseDate = now.toLocaleDateString();

    const newInventoryItems: InventoryItem[] = cart.map(item => {
      let invCat: InventoryCategory = 'other';
      let shelfLifeDays = 14;

      switch(item.category) {
        case 'produce': invCat = 'vegetables'; shelfLifeDays = 5; break;
        case 'dairy': invCat = 'dairy-eggs'; shelfLifeDays = 10; break;
        case 'meat': case 'poultry': invCat = 'meat-poultry'; shelfLifeDays = 3; break;
        case 'seafood': invCat = 'seafood'; shelfLifeDays = 2; break;
        case 'bakery': invCat = 'pantry'; shelfLifeDays = 5; break;
        case 'frozen': invCat = 'frozen'; shelfLifeDays = 180; break;
        case 'beverages': invCat = 'beverages'; shelfLifeDays = 30; break;
        case 'snacks': invCat = 'snacks'; shelfLifeDays = 60; break;
        case 'pantry': invCat = 'pantry'; shelfLifeDays = 90; break;
      }

      const expiryDate = new Date();
      expiryDate.setDate(now.getDate() + shelfLifeDays);

      return {
        id: Math.random().toString(36).substr(2, 9),
        name: item.name,
        quantity: item.quantity,
        unit: 'pieces' as InventoryUnit,
        category: invCat,
        expiryDate: expiryDate.toISOString().split('T')[0],
        addedDate: now.toISOString(),
        notes: `Purchased on ${purchaseDate} via Checkout.`,
        imageUrl: item.imageUrl
      };
    });

    setInventory(prev => [...prev, ...newInventoryItems]);
    clearCart();
    setView('dashboard');
  }, [cart, clearCart]);

  const addToInventory = useCallback((item: Partial<InventoryItem>) => {
    const newItem: InventoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: item.name || 'Unknown',
      quantity: item.quantity || 1,
      unit: item.unit || 'pieces',
      category: item.category || 'other',
      expiryDate: item.expiryDate,
      addedDate: new Date().toISOString(),
      notes: item.notes,
      imageUrl: item.imageUrl,
    };
    setInventory(prev => [...prev, newItem]);
  }, []);

  const updateInventoryQuantity = useCallback((id: string, delta: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return newQty === 0 ? null : { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean) as InventoryItem[]);
  }, []);

  const updateInventoryItem = useCallback((id: string, updates: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    
    if (updates.expiryDate) {
      setDismissedAlertIds(prev => prev.filter(dId => dId !== id));
    }
  }, []);

  const removeFromInventory = useCallback((id: string) => {
    setInventory(prev => prev.filter(i => i.id !== id));
    setDismissedAlertIds(prev => prev.filter(dId => dId !== id));
  }, []);

  const toggleStoreFavorite = useCallback((id: string) => {
    setStores(prev => prev.map(s => s.id === id ? { ...s, isFavorite: !s.isFavorite } : s));
  }, []);

  const toggleStoreSelection = useCallback((id: string) => {
    setStores(prev => prev.map(s => s.id === id ? { ...s, isSelected: !s.isSelected } : s));
  }, []);

  const addStore = useCallback((name: string, address: string) => {
    const newStore: GroceryStore = {
      id: `s${Date.now()}`,
      name,
      address,
      isFavorite: false,
      isSelected: true
    };
    setStores(prev => [...prev, newStore]);
  }, []);

  const toggleIntegration = useCallback((id: string) => {
    setIntegrations(prev => prev.map(i => i.id === id ? { 
      ...i, 
      isConnected: !i.isConnected,
      lastSynced: !i.isConnected ? new Date().toISOString() : undefined 
    } : i));
  }, []);

  const scanReceipt = useCallback(() => {
    const common = [
      { name: 'Apples', cat: 'fruits', img: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?q=80&w=200&auto=format&fit=crop' },
      { name: 'Bread', cat: 'pantry', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=200&auto=format&fit=crop' },
      { name: 'Oatmeal', cat: 'pantry', img: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?q=80&w=200&auto=format&fit=crop' },
      { name: 'Ground Beef', cat: 'meat-poultry', img: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3973?q=80&w=200&auto=format&fit=crop' },
      { name: 'Greek Yogurt', cat: 'dairy-eggs', img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=200&auto=format&fit=crop' }
    ];
    const itemsToAdd = common.sort(() => 0.5 - Math.random()).slice(0, 4);
    itemsToAdd.forEach(item => {
      addToInventory({
        name: item.name,
        quantity: Math.floor(Math.random() * 3) + 1,
        unit: 'packages',
        category: item.cat as InventoryCategory,
        expiryDate: new Date(Date.now() + 86400000 * (Math.floor(Math.random() * 10) + 3)).toISOString().split('T')[0],
        imageUrl: item.img
      });
    });
  }, [addToInventory]);

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard 
          cartNutrition={cartNutrition} 
          goals={goals} 
          budget={budget} 
          spent={cartSubtotal} 
          inventory={inventory}
          onNavigate={setView}
          onAddToCart={addToCart}
        />;
      case 'shop':
        return <Catalog 
          onAddToCart={addToCart} 
          selectedStores={stores.filter(s => s.isSelected).map(s => s.id)}
          inventory={inventory}
          goals={goals}
        />;
      case 'deals':
        return <Deals onAddToCart={addToCart} products={MOCK_PRODUCTS} deals={MOCK_DEALS} />;
      case 'cart':
        return <Cart 
          items={cart} 
          onUpdateQty={updateCartQuantity} 
          onRemove={removeFromCart} 
          onCheckout={() => setView('checkout')}
          onClear={clearCart}
          subtotal={cartSubtotal}
          nutrition={cartNutrition}
          goals={goals}
          budget={budget}
          inventory={inventory}
        />;
      case 'inventory':
        return <Inventory 
          items={inventory} 
          onUpdateQty={updateInventoryQuantity}
          onUpdateItem={updateInventoryItem}
          onRemove={removeFromInventory} 
          onAdd={addToInventory}
          onScan={scanReceipt}
          onViewCalendar={() => setView('calendar')}
        />;
      case 'calendar':
        return <CalendarView items={inventory} onBack={() => setView('inventory')} />;
      case 'chat':
        return <Chat 
          history={chatHistory} 
          setHistory={setChatHistory}
          context={{ goals, inventory, cart, budget, currentSpending: cartSubtotal }}
          onAddToCart={addToCart}
        />;
      case 'recipes':
        return <Recipes inventory={inventory} />;
      case 'checkout':
        return <Checkout 
          cart={cart} 
          subtotal={cartSubtotal} 
          onSuccess={handleCheckoutSuccess} 
          onCancel={() => setView('cart')}
          stores={stores}
        />;
      case 'stores':
        return <StoreManager 
          stores={stores} 
          onToggleFavorite={toggleStoreFavorite} 
          onToggleSelect={toggleStoreSelection}
          onAddStore={addStore}
        />;
      case 'integrations':
        return <Integrations 
          integrations={integrations} 
          onToggle={toggleIntegration} 
        />;
      case 'settings':
        return (
          <div className="p-6 max-w-2xl mx-auto space-y-8 animate-in fade-in">
            <h1 className="text-3xl font-bold mb-6">Settings</h1>
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <i className="fas fa-bullseye text-emerald-500"></i> Nutrition Goals
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {Object.keys(goals).map((key) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-slate-500 mb-1 capitalize">
                      {key.replace('daily', '')} ({key === 'dailyCalories' ? 'kcal' : 'g'})
                    </label>
                    <input 
                      type="number"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={goals[key as keyof NutritionGoals]}
                      onChange={(e) => setGoals(prev => ({ ...prev, [key]: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                ))}
              </div>
            </section>
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <i className="fas fa-wallet text-green-500"></i> Weekly Budget
              </h2>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Budget Amount ($)</label>
                <input 
                  type="number"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                  value={budget.weeklyAmount}
                  onChange={(e) => setBudget({ weeklyAmount: parseInt(e.target.value) || 0 })}
                />
              </div>
            </section>
            <div className="flex gap-4">
               <button 
                onClick={() => {
                  if(confirm("Are you sure you want to reset all data?")) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="px-6 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium"
              >
                Reset Data
              </button>
            </div>
          </div>
        );
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 relative overflow-hidden">
      {/* Sidebar Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 md:relative md:w-20 lg:w-64 bg-white border-t md:border-t-0 md:border-r border-slate-200 flex md:flex-col justify-around md:justify-start p-2 md:p-4 z-50 transition-all duration-300">
        <div className="hidden md:flex flex-col items-center lg:items-start mb-10 px-2">
          {/* Reverted Logo to Original Leaf Icon */}
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white mb-2">
            <i className="fas fa-leaf text-lg"></i>
          </div>
          <h1 className="text-xl font-black text-slate-800 hidden lg:block tracking-tight">WasteLess</h1>
        </div>

        <div className="flex md:flex-col justify-around md:justify-start flex-1 w-full gap-1">
          <NavItem icon="fas fa-th-large" label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
          <NavItem icon="fas fa-search" label="Shop" active={view === 'shop'} onClick={() => setView('shop')} />
          <NavItem icon="fas fa-utensils" label="Recipes" active={view === 'recipes'} onClick={() => setView('recipes')} />
          <NavItem icon="fas fa-tag" label="Deals" active={view === 'deals'} onClick={() => setView('deals')} />
          <NavItem icon="fas fa-shopping-basket" label="Cart" active={view === 'cart'} badge={cart.length} onClick={() => setView('cart')} />
          <NavItem icon="fas fa-clipboard-list" label="Inventory" active={view === 'inventory' || view === 'calendar'} onClick={() => setView('inventory')} />
          <NavItem icon="fas fa-robot" label="AI Assistant" active={view === 'chat'} onClick={() => setView('chat')} />
        </div>
        
        <div className="hidden md:flex md:flex-col mt-auto space-y-1">
          <NavItem icon="fas fa-link" label="Integrations" active={view === 'integrations'} onClick={() => setView('integrations')} />
          <NavItem icon="fas fa-store" label="Stores" active={view === 'stores'} onClick={() => setView('stores')} />
          <NavItem icon="fas fa-cog" label="Settings" active={view === 'settings'} onClick={() => setView('settings')} />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 h-[calc(100vh-64px)] md:h-screen relative">
        {/* Global Action Bar */}
        <div className="absolute top-6 right-6 z-40 flex items-center gap-3">
          <button 
            onClick={openNotifications}
            className="w-12 h-12 bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center text-slate-500 hover:text-emerald-600 transition-all relative group"
          >
            <i className={`fas fa-bell text-lg ${hasUnseenAlerts && unseenAlertsCount > 0 ? 'animate-swing' : ''}`}></i>
            {unseenAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                {unseenAlertsCount}
              </span>
            )}
            <span className="absolute right-full mr-3 px-3 py-1.5 bg-slate-800 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-widest">
              Notifications
            </span>
          </button>
        </div>

        <div className="max-w-7xl mx-auto">
          {renderView()}
        </div>
      </main>

      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={closeNotifications} 
        expired={alertItems.expired}
        expiringSoon={alertItems.expiringSoon}
        onDismissAlerts={dismissAlerts}
        onNavigate={(v) => { setView(v); dismissAlerts(); setShowNotifications(false); }}
      />
    </div>
  );
};

interface NavItemProps {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick, badge }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col md:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-3 p-2 md:p-3 lg:px-4 rounded-xl transition-all w-full relative group ${
      active ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500 hover:bg-slate-50'
    }`}
  >
    <div className="relative shrink-0">
      <i className={`${icon} text-lg md:text-xl transition-transform group-hover:scale-110`}></i>
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
          {badge}
        </span>
      )}
    </div>
    <span className="text-[10px] md:hidden lg:inline text-xs lg:text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
      {label}
    </span>
    <span className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden md:block lg:hidden pointer-events-none z-50 shadow-xl">
      {label}
    </span>
  </button>
);

export default App;
