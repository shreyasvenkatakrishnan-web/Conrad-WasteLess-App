
import React, { useState, useMemo, useEffect } from 'react';
import { Product, ProductCategory, InventoryItem, NutritionGoals, Recommendation, CartItem } from '../types';
import { MOCK_PRODUCTS } from '../constants';
import { getShoppingRecommendations } from '../services/geminiService';

interface CatalogProps {
  onAddToCart: (product: Product) => void;
  cart: CartItem[];
  selectedStores: string[];
  inventory: InventoryItem[];
  goals: NutritionGoals;
}

const CATEGORIES: { id: ProductCategory; label: string; icon: string }[] = [
  { id: 'produce', label: 'Produce', icon: 'fa-apple-whole' },
  { id: 'meat', label: 'Meat', icon: 'fa-drumstick-bite' },
  { id: 'dairy', label: 'Dairy', icon: 'fa-cheese' },
  { id: 'seafood', label: 'Seafood', icon: 'fa-fish' },
  { id: 'bakery', label: 'Bakery', icon: 'fa-bread-slice' },
  { id: 'pantry', label: 'Pantry', icon: 'fa-jar' },
  { id: 'frozen', label: 'Frozen', icon: 'fa-snowflake' },
  { id: 'beverages', label: 'Drinks', icon: 'fa-bottle-water' },
  { id: 'snacks', label: 'Snacks', icon: 'fa-cookie' },
];

const Catalog: React.FC<CatalogProps> = ({ onAddToCart, cart, selectedStores, inventory, goals }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');
  const [filterSale, setFilterSale] = useState(false);
  const [filterOrganic, setFilterOrganic] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    const fetchRecs = async () => {
      // Don't even try if there's nothing expired
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiredCount = inventory.filter(i => i.expiryDate && new Date(i.expiryDate) < today).length;
      
      if (expiredCount === 0) {
        setRecommendations([]);
        return;
      }

      setLoadingRecs(true);
      try {
        const recs = await getShoppingRecommendations(inventory, goals);
        setRecommendations(recs);
      } catch (e) {
        console.error("Failed to load recommendations:", e);
      } finally {
        setLoadingRecs(false);
      }
    };
    fetchRecs();
  }, [inventory, goals]);

  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
      const matchesStores = selectedStores.length === 0 || selectedStores.includes(p.storeId);
      const matchesSale = !filterSale || p.isOnSale;
      const matchesOrganic = !filterOrganic || p.isOrganic;
      return matchesSearch && matchesCategory && matchesStores && matchesSale && matchesOrganic;
    });
  }, [search, activeCategory, selectedStores, filterSale, filterOrganic]);

  const handleAddRecommendation = (rec: Recommendation) => {
    const match = MOCK_PRODUCTS.find(p => p.name.toLowerCase().includes(rec.name.toLowerCase()) || rec.name.toLowerCase().includes(p.name.toLowerCase()));
    
    if (match) {
      onAddToCart(match);
    } else {
      onAddToCart({
        id: rec.id,
        name: rec.name,
        price: rec.estimatedPrice,
        category: rec.category,
        storeId: 's1',
        calories: 100, protein: 5, carbs: 10, fat: 2,
        servingSize: '1 unit',
        isOrganic: false,
        isOnSale: false
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Shop</h1>
        <div className="relative w-full md:w-96">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input 
            type="text" 
            placeholder="Search items..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {/* Purchase Recommendations - Strictly for Expired Items */}
      {(loadingRecs || recommendations.length > 0) && (
        <section className="space-y-4 animate-in slide-in-from-left duration-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <i className="fas fa-sparkles text-emerald-500"></i>
              Purchase Recommendations
            </h2>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1">
            {loadingRecs ? (
              Array(2).fill(0).map((_, i) => (
                <div key={i} className="min-w-[280px] h-44 bg-slate-100 rounded-[32px] animate-pulse"></div>
              ))
            ) : recommendations.map(rec => (
              <div 
                key={rec.id} 
                className="min-w-[280px] bg-white p-5 rounded-[32px] border-2 border-emerald-50 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
                
                <div className="relative z-10 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg uppercase tracking-tight">
                      {rec.category}
                    </span>
                    <span className="animate-pulse flex items-center gap-1 text-[9px] font-bold text-emerald-600 uppercase">
                      <i className="fas fa-arrows-rotate text-[8px]"></i> Replenish
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 group-hover:text-emerald-600 transition-colors text-sm">{rec.name}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 italic leading-relaxed mt-1">"{rec.reason}"</p>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between relative z-10">
                  <span className="text-base font-black text-slate-900">${rec.estimatedPrice.toFixed(2)}</span>
                  <button 
                    onClick={() => handleAddRecommendation(rec)}
                    className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-slate-100"
                  >
                    <i className="fas fa-cart-plus"></i>
                    Add to List
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Categories Scroller */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        <button 
          onClick={() => setActiveCategory('all')}
          className={`px-6 py-3 rounded-2xl whitespace-nowrap font-semibold transition-all shadow-sm border ${
            activeCategory === 'all' ? 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-200' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
          }`}
        >
          All Items
        </button>
        {CATEGORIES.map(cat => (
          <button 
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl whitespace-nowrap font-semibold transition-all shadow-sm border ${
              activeCategory === cat.id ? 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-200' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            <i className={`fas ${cat.icon}`}></i>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap gap-2 items-center">
        <FilterChip label="On Sale" active={filterSale} onClick={() => setFilterSale(!filterSale)} />
        <FilterChip label="Organic" active={filterOrganic} onClick={() => setFilterOrganic(!filterOrganic)} />
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
            <i className="fas fa-search-minus text-4xl"></i>
          </div>
          <h3 className="text-xl font-bold text-slate-700">No products found</h3>
          <p className="text-slate-500">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => {
            const isInCart = cart.some(item => item.productId === product.id);
            return (
              <div key={product.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col group">
                <div className="relative aspect-square bg-slate-50 rounded-2xl mb-4 overflow-hidden flex items-center justify-center text-slate-300">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <i className="fas fa-box-open text-6xl group-hover:scale-110 transition-transform"></i>
                  )}
                  {product.isOrganic && (
                    <span className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider shadow-sm">Organic</span>
                  )}
                  {product.isOnSale && (
                    <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider shadow-sm">Sale</span>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-bold text-slate-800 line-clamp-1 group-hover:text-emerald-600 transition-colors">{product.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-extrabold text-slate-900">${(product.isOnSale ? product.salePrice : product.price)?.toFixed(2)}</span>
                    {product.isOnSale && (
                      <span className="text-sm text-slate-400 line-through">${product.price.toFixed(2)}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <i className="fas fa-store text-[10px]"></i>
                    {product.storeId === 's1' ? 'Whole Foods' : product.storeId === 's2' ? 'Trader Joe\'s' : 'Kroger'}
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2">
                     <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{product.calories} kcal</span>
                     <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md">{product.protein}g protein</span>
                  </div>
                </div>
                <button 
                  onClick={() => onAddToCart(product)}
                  className={`mt-4 w-full py-2.5 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    isInCart 
                      ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 shadow-sm' 
                      : 'bg-slate-900 text-white hover:bg-emerald-600 shadow-lg shadow-slate-100'
                  }`}
                >
                  <i className={`fas ${isInCart ? 'fa-check' : 'fa-plus'}`}></i>
                  {isInCart ? 'Added to Cart' : 'Add to Cart'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const FilterChip: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-all ${
      active ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-200' : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-400'
    }`}
  >
    {label}
  </button>
);

export default Catalog;
