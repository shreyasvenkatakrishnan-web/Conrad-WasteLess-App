import React, { useState } from 'react';
import { InventoryItem, InventoryUnit, InventoryCategory } from '../types';

interface PantryProps {
  items: InventoryItem[];
  onRemove: (id: string) => void;
  onAdd: (item: Partial<InventoryItem>) => void;
  onScan: () => void;
  onViewCalendar: () => void;
}

const Pantry: React.FC<PantryProps> = ({ items, onRemove, onAdd, onScan, onViewCalendar }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '',
    quantity: 1,
    unit: 'pieces',
    category: 'other'
  });

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

  return (
    <div className="p-6 space-y-8">
      <header className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pantry Inventory</h1>
          <p className="text-slate-500">Track what's at home to reduce waste.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={onViewCalendar}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl shadow-sm hover:bg-slate-50 transition-all font-semibold"
          >
            <i className="fas fa-calendar-alt text-blue-500"></i>
            Calendar View
          </button>
          <button 
            onClick={onScan}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-2xl shadow-lg hover:bg-purple-700 transition-all font-semibold"
          >
            <i className="fas fa-receipt"></i>
            Scan Receipt
          </button>
          <button 
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl shadow-lg hover:bg-blue-700 transition-all font-semibold"
          >
            <i className="fas fa-plus"></i>
            Add Item
          </button>
        </div>
      </header>

      {showAdd && (
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl animate-in slide-in-from-top duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-widest">Item Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Greek Yogurt"
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
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={newItem.expiryDate || ''}
                onChange={e => setNewItem({...newItem, expiryDate: e.target.value})}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setShowAdd(false)} className="px-6 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-xl">Cancel</button>
            <button onClick={handleAdd} className="px-8 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700">Save Item</button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-6">
            <i className="fas fa-boxes-stacked text-5xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Your pantry is empty</h2>
          <p className="text-slate-500 max-w-sm mt-2">Add items manually or scan a receipt to start tracking your food inventory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => {
            const status = getExpiryStatus(item.expiryDate);
            return (
              <div key={item.id} className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-start gap-4 group">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-300 transition-colors overflow-hidden">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <i className="fas fa-apple-whole text-2xl"></i>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-800">{item.name}</h3>
                    <button onClick={() => onRemove(item.id)} className="text-slate-200 hover:text-red-500 transition-colors">
                      <i className="fas fa-trash text-xs"></i>
                    </button>
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.quantity} {item.unit}</p>
                  <div className="pt-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Pantry;