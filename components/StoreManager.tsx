
import React, { useState } from 'react';
import { GroceryStore } from '../types';

interface StoreManagerProps {
  stores: GroceryStore[];
  onToggleFavorite: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onAddStore: (name: string, address: string) => void;
}

const StoreManager: React.FC<StoreManagerProps> = ({ stores, onToggleFavorite, onToggleSelect, onAddStore }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && newAddress.trim()) {
      onAddStore(newName, newAddress);
      setNewName('');
      setNewAddress('');
      setShowAddForm(false);
    }
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Grocery Stores</h1>
          <p className="text-slate-500">Manage your preferred shopping locations.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl shadow-lg hover:bg-emerald-700 transition-all font-semibold shrink-0"
        >
          <i className={`fas ${showAddForm ? 'fa-times' : 'fa-plus'}`}></i>
          {showAddForm ? 'Cancel' : 'Add Store'}
        </button>
      </header>

      {showAddForm && (
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl animate-in slide-in-from-top duration-300">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-widest">Store Name</label>
              <input 
                type="text" 
                autoFocus
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g. Safeway"
                value={newName}
                onChange={e => setNewName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-widest">Location/Address</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g. 123 Main St"
                value={newAddress}
                onChange={e => setNewAddress(e.target.value)}
              />
            </div>
            <div className="md:col-span-2 flex justify-end pt-2">
              <button 
                type="submit"
                disabled={!newName.trim() || !newAddress.trim()}
                className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 disabled:opacity-50 transition-all"
              >
                Save Store
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map(store => (
          <div 
            key={store.id} 
            className={`bg-white rounded-[32px] border-2 p-6 transition-all space-y-4 relative ${
              store.isSelected ? 'border-emerald-600 shadow-lg shadow-emerald-50' : 'border-slate-100 opacity-60'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl ${
                store.id === 's1' ? 'bg-green-600' : store.id === 's2' ? 'bg-emerald-600' : 'bg-slate-400'
              }`}>
                <i className="fas fa-store"></i>
              </div>
              <button 
                onClick={() => onToggleFavorite(store.id)}
                className={`text-xl transition-colors ${store.isFavorite ? 'text-yellow-500' : 'text-slate-200 hover:text-yellow-300'}`}
              >
                <i className={`${store.isFavorite ? 'fas' : 'far'} fa-star`}></i>
              </button>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 line-clamp-1">{store.name}</h3>
              <p className="text-sm text-slate-400 line-clamp-1">{store.address}</p>
            </div>
            <button 
              onClick={() => onToggleSelect(store.id)}
              className={`w-full py-3 rounded-2xl font-bold transition-all ${
                store.isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {store.isSelected ? 'Selected' : 'Select Store'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoreManager;
