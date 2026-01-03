
import React, { useState, useMemo } from 'react';
import { InventoryItem, InventoryUnit, InventoryCategory, StorageAdvice } from '../types';
import { getStorageAdvice } from '../services/geminiService';

interface InventoryProps {
  items: InventoryItem[];
  onUpdateQty: (id: string, delta: number) => void;
  onUpdateItem: (id: string, updates: Partial<InventoryItem>) => void;
  onRemove: (id: string) => void;
  onAdd: (item: Partial<InventoryItem>) => void;
  onScan: () => void;
  onViewCalendar: () => void;
}

const INV_CATEGORIES: { id: InventoryCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All Items', icon: 'fa-layer-group' },
  { id: 'fruits', label: 'Fruits', icon: 'fa-apple-whole' },
  { id: 'vegetables', label: 'Vegetables', icon: 'fa-carrot' },
  { id: 'meat-poultry', label: 'Meat & Poultry', icon: 'fa-drumstick-bite' },
  { id: 'seafood', label: 'Seafood', icon: 'fa-fish' },
  { id: 'dairy-eggs', label: 'Dairy & Eggs', icon: 'fa-egg' },
  { id: 'pantry', label: 'Pantry', icon: 'fa-box-archive' },
  { id: 'frozen', label: 'Frozen', icon: 'fa-snowflake' },
  { id: 'condiments', label: 'Condiments', icon: 'fa-bottle-droplet' },
  { id: 'snacks', label: 'Snacks', icon: 'fa-cookie' },
  { id: 'beverages', label: 'Beverages', icon: 'fa-bottle-water' },
  { id: 'other', label: 'Other', icon: 'fa-ellipsis' },
];

const Inventory: React.FC<InventoryProps> = ({ items, onUpdateQty, onUpdateItem, onRemove, onAdd, onScan, onViewCalendar }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [activeCategory, setActiveCategory] = useState<InventoryCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [activeAdvice, setActiveAdvice] = useState<{ item: InventoryItem; advice: StorageAdvice } | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState<string | null>(null);
  const [editingDateId, setEditingDateId] = useState<string | null>(null);
  
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '',
    quantity: 1,
    unit: 'pieces',
    category: 'other'
  });

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, activeCategory]);

  const getExpiryStatus = (date?: string) => {
    if (!date) return { label: 'No Expiry', color: 'bg-slate-100 text-slate-500' };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(date);
    expiry.setHours(0, 0, 0, 0);
    const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (diff < 0) return { label: 'Expired', color: 'bg-red-100 text-red-600' };
    if (diff === 0) return { label: 'Today', color: 'bg-orange-100 text-orange-600' };
    if (diff <= 3) return { label: 'Soon', color: 'bg-yellow-100 text-yellow-600' };
    return { label: 'Fresh', color: 'bg-green-100 text-green-600' };
  };

  const handleAdd = () => {
    if (!newItem.name) return;
    onAdd(newItem);
    setNewItem({ name: '', quantity: 1, unit: 'pieces', category: 'other' });
    setShowAdd(false);
  };

  const handleShowStorageAdvice = async (item: InventoryItem) => {
    if (item.storageAdvice) {
      setActiveAdvice({ item, advice: item.storageAdvice });
      return;
    }
    
    setLoadingAdvice(item.id);
    try {
      const advice = await getStorageAdvice(item.name);
      onUpdateItem(item.id, { storageAdvice: advice });
      setActiveAdvice({ item, advice });
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAdvice(null);
    }
  };

  const handleDateChange = (id: string, date: string) => {
    onUpdateItem(id, { expiryDate: date });
    setEditingDateId(null);
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col xl:flex-row justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900">Home Inventory</h1>
          <p className="text-slate-500">Track items at home to minimize waste and maximize freshness.</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Search Bar */}
          <div className="relative w-full md:w-64">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="Search inventory..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button 
              onClick={onViewCalendar}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl shadow-sm hover:bg-emerald-50 hover:text-emerald-600 transition-all font-semibold"
            >
              <i className="fas fa-calendar-alt text-emerald-500"></i>
              Expiry Calendar
            </button>
            <button 
              onClick={onScan}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-2xl shadow-sm hover:bg-emerald-200 transition-all font-semibold"
            >
              <i className="fas fa-receipt"></i>
              Scan Receipt
            </button>
            <button 
              onClick={() => setShowAdd(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl shadow-lg hover:bg-emerald-700 transition-all font-semibold"
            >
              <i className="fas fa-plus"></i>
              Add Item
            </button>
          </div>
        </div>
      </header>

      {/* Category Selection Bar */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
        {INV_CATEGORIES.map(cat => (
          <button 
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl whitespace-nowrap font-bold text-sm transition-all shadow-sm border ${
              activeCategory === cat.id 
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-200' 
                : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
            }`}
          >
            <i className={`fas ${cat.icon} ${activeCategory === cat.id ? 'text-white' : 'text-emerald-500'}`}></i>
            {cat.label}
          </button>
        ))}
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl animate-in slide-in-from-top duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-widest">Item Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g. Avocado"
                value={newItem.name}
                onChange={e => setNewItem({...newItem, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-widest">Quantity</label>
              <div className="flex bg-slate-50 rounded-xl p-1 border border-slate-200">
                <input 
                  type="number" 
                  className="w-full bg-transparent px-3 py-2 outline-none font-bold text-slate-700"
                  value={newItem.quantity}
                  onChange={e => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-widest">Expiry Date</label>
              <input 
                type="date" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                value={newItem.expiryDate || ''}
                onChange={e => setNewItem({...newItem, expiryDate: e.target.value})}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setShowAdd(false)} className="px-6 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-xl">Cancel</button>
            <button onClick={handleAdd} className="px-8 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700">Save to Inventory</button>
          </div>
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
            <i className="fas fa-magnifying-glass text-5xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">No items found</h2>
          <p className="text-slate-500 max-w-sm mt-2">Adjust your filters or search terms to find what you're looking for.</p>
          {(activeCategory !== 'all' || search !== '') && (
            <button 
              onClick={() => { setActiveCategory('all'); setSearch(''); }}
              className="mt-6 text-emerald-600 font-bold hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => {
            const status = getExpiryStatus(item.expiryDate);
            const isProcessing = loadingAdvice === item.id;
            const isEditingDate = editingDateId === item.id;

            return (
              <div key={item.id} className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 group">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-emerald-50 overflow-hidden transition-colors shrink-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <i className="fas fa-apple-whole text-2xl"></i>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-slate-800 line-clamp-1">{item.name}</h3>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleShowStorageAdvice(item)}
                          disabled={isProcessing}
                          title="Storage optimization advice"
                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                            isProcessing ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          }`}
                        >
                          {isProcessing ? <i className="fas fa-circle-notch animate-spin text-xs"></i> : <i className="fas fa-shield-halved text-xs"></i>}
                        </button>
                        <button 
                          onClick={() => onRemove(item.id)} 
                          title="Remove entirely"
                          className="w-8 h-8 rounded-xl flex items-center justify-center bg-red-50 text-red-400 hover:bg-red-100 transition-all"
                        >
                          <i className="fas fa-trash text-xs"></i>
                        </button>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.unit}</p>
                    <div className="pt-1 flex items-center gap-2">
                      {isEditingDate ? (
                        <input 
                          type="date" 
                          autoFocus
                          className="text-[10px] font-bold px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                          value={item.expiryDate || ''}
                          onBlur={() => setEditingDateId(null)}
                          onChange={(e) => handleDateChange(item.id, e.target.value)}
                        />
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${status.color}`}>
                            {status.label}
                          </span>
                          <button 
                            onClick={() => setEditingDateId(item.id)}
                            className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all flex items-center justify-center shadow-sm"
                            title="Edit expiry date"
                          >
                            <i className="fas fa-pen text-[8px]"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Quantity Controls */}
                <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-2 border border-slate-100 mt-auto">
                   <div className="flex items-center gap-1">
                    <button 
                      onClick={() => onUpdateQty(item.id, -1)}
                      title="Use 1"
                      className="w-8 h-8 flex items-center justify-center bg-white text-slate-500 hover:text-red-500 hover:shadow-sm rounded-xl transition-all border border-slate-100"
                    >
                      <i className="fas fa-minus text-xs"></i>
                    </button>
                    <div className="w-12 text-center">
                      <span className="font-black text-slate-900 text-lg">{item.quantity}</span>
                    </div>
                    <button 
                      onClick={() => onUpdateQty(item.id, 1)}
                      title="Add 1"
                      className="w-8 h-8 flex items-center justify-center bg-white text-slate-500 hover:text-emerald-500 hover:shadow-sm rounded-xl transition-all border border-slate-100"
                    >
                      <i className="fas fa-plus text-xs"></i>
                    </button>
                   </div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mr-2">In Stock</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Storage Advice Modal */}
      {activeAdvice && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setActiveAdvice(null)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border-t-8 border-emerald-500">
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 text-3xl overflow-hidden shrink-0">
                   {activeAdvice.item.imageUrl ? <img src={activeAdvice.item.imageUrl} className="w-full h-full object-cover" /> : <i className="fas fa-leaf"></i>}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 leading-tight">{activeAdvice.item.name}</h2>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Freshness Maximizer</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-center space-y-1">
                   <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center mx-auto text-emerald-500 shadow-sm">
                      <i className={`fas ${activeAdvice.advice.location === 'Fridge' ? 'fa-snowflake' : activeAdvice.advice.location === 'Freezer' ? 'fa-ice-cream' : 'fa-house-user'}`}></i>
                   </div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Location</p>
                   <p className="text-sm font-bold text-slate-700">{activeAdvice.advice.location}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-center space-y-1">
                   <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center mx-auto text-emerald-500 shadow-sm">
                      <i className="fas fa-thermometer-half"></i>
                   </div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Ideal Temp</p>
                   <p className="text-sm font-bold text-slate-700">{activeAdvice.advice.temperature}</p>
                </div>
              </div>

              <div className="space-y-4">
                 <div className="bg-emerald-50/50 p-4 rounded-3xl border border-emerald-100">
                    <h4 className="text-xs font-black text-emerald-800 uppercase mb-2 flex items-center gap-2">
                       <i className="fas fa-box-open"></i> Recommended Container
                    </h4>
                    <p className="text-sm text-emerald-900 font-medium leading-relaxed">{activeAdvice.advice.container}</p>
                 </div>

                 <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <i className="fas fa-lightbulb"></i> Pro Storage Tips
                    </h4>
                    <ul className="space-y-2">
                       {activeAdvice.advice.tips.map((tip, i) => (
                         <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0"></div>
                            {tip}
                         </li>
                       ))}
                    </ul>
                 </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                 <div className="flex items-center justify-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 py-2 rounded-xl">
                    <i className="fas fa-plus"></i>
                    ADDS APPROX. {activeAdvice.advice.shelfLifeExtension.toUpperCase()} OF FRESHNESS
                 </div>
                 <button 
                  onClick={() => setActiveAdvice(null)}
                  className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-all"
                >
                  Got it, thanks!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
