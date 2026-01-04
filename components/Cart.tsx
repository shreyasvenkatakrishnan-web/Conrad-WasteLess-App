
import React, { useState } from 'react';
import { CartItem, NutritionGoals, Budget, InventoryItem } from '../types';

interface CartProps {
  items: CartItem[];
  onUpdateQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
  onClear: () => void;
  subtotal: number;
  nutrition: { calories: number; protein: number; carbs: number; fat: number };
  goals: NutritionGoals;
  budget: Budget;
  inventory: InventoryItem[];
}

const Cart: React.FC<CartProps> = ({ items, onUpdateQty, onRemove, onCheckout, onClear, subtotal, nutrition, goals, budget, inventory }) => {
  const [showEfficiencyAlert, setShowEfficiencyAlert] = useState(false);
  const [duplicates, setDuplicates] = useState<{ cartItem: CartItem; invItem: InventoryItem }[]>([]);

  const handleCheckoutClick = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Efficiency Check: Look for cart items already in inventory that ARE NOT expired
    const foundDuplicates = items.reduce((acc, cartItem) => {
      const invMatch = inventory.find(i => i.name.toLowerCase() === cartItem.name.toLowerCase());
      
      if (invMatch) {
        // If the item in inventory has an expiry date, check if it's already expired
        let isExpired = false;
        if (invMatch.expiryDate) {
          const expiry = new Date(invMatch.expiryDate);
          expiry.setHours(0, 0, 0, 0);
          isExpired = expiry < today;
        }

        // Only warn if the item we already have is still good/usable
        if (!isExpired) {
          acc.push({ cartItem, invItem: invMatch });
        }
      }
      return acc;
    }, [] as { cartItem: CartItem; invItem: InventoryItem }[]);

    if (foundDuplicates.length > 0) {
      setDuplicates(foundDuplicates);
      setShowEfficiencyAlert(true);
    } else {
      onCheckout();
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 p-6 text-center animate-in zoom-in duration-300">
        <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-6">
          <i className="fas fa-shopping-basket text-6xl"></i>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900">Cart is empty</h2>
        <p className="text-slate-500 mt-2 max-w-sm">Looks like you haven't added anything to your cart yet. Start building your sustainable shopping list!</p>
      </div>
    );
  }

  const budgetUsed = (subtotal / budget.weeklyAmount) * 100;
  const isOverBudget = subtotal > budget.weeklyAmount;

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-slate-900">Cart <span className="text-slate-400 font-normal">({items.length} items)</span></h1>
          <button onClick={onClear} className="text-red-500 text-sm font-bold hover:underline">Clear All</button>
        </div>

        <div className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex gap-4 items-center group">
              <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-emerald-50 overflow-hidden transition-colors">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <i className="fas fa-box text-3xl"></i>
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-800">{item.name}</h4>
                  <button onClick={() => onRemove(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="flex justify-between items-end mt-2">
                  <div className="space-y-1">
                    <p className="text-sm font-extrabold text-slate-900">${item.price.toFixed(2)}</p>
                    <div className="flex gap-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{item.calories * item.quantity} kcal</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{item.protein * item.quantity}g protein</span>
                    </div>
                  </div>
                  <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                    <button 
                      onClick={() => onUpdateQty(item.id, -1)}
                      className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                    >
                      <i className="fas fa-minus text-xs"></i>
                    </button>
                    <span className="w-10 text-center font-bold text-slate-700">{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateQty(item.id, 1)}
                      className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                    >
                      <i className="fas fa-plus text-xs"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {/* Cart Summary Card */}
        <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-xl sticky top-6 space-y-8 border-t-4 border-emerald-600">
          <h3 className="text-2xl font-bold">Sustainability Summary</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center text-slate-400">
              <span>Subtotal</span>
              <span className="font-bold text-white">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Est. Tax</span>
              <span className="font-bold text-white">${(subtotal * 0.08).toFixed(2)}</span>
            </div>
            <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
              <span className="text-lg font-bold">Total</span>
              <span className="text-3xl font-black">${(subtotal * 1.08).toFixed(2)}</span>
            </div>
          </div>

          {/* Budget Widget in Cart */}
          <div className="bg-white/5 p-4 rounded-3xl border border-white/10 space-y-3">
             <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400">
               <span>Budget Status</span>
               <span className={isOverBudget ? 'text-red-400' : 'text-emerald-400'}>
                 {isOverBudget ? 'Exceeded' : 'Safe'}
               </span>
             </div>
             <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
               <div className={`h-full rounded-full transition-all duration-1000 ${isOverBudget ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, budgetUsed)}%` }}></div>
             </div>
             <p className="text-[10px] text-slate-500">
               {isOverBudget ? `You are $${(subtotal - budget.weeklyAmount).toFixed(2)} over your weekly limit.` : `You have $${(budget.weeklyAmount - subtotal).toFixed(2)} left.`}
             </p>
          </div>

          <button 
            onClick={handleCheckoutClick}
            className="w-full py-5 bg-emerald-600 text-white rounded-[24px] font-black text-lg hover:bg-emerald-700 hover:shadow-2xl shadow-emerald-900/40 transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            Go to Checkout
            <i className="fas fa-arrow-right"></i>
          </button>
        </div>

        {/* Nutrition Goal Quick View */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-800">Health Impact</h4>
          <NutritionMiniStat label="Calories" current={nutrition.calories} goal={goals.dailyCalories} color="bg-emerald-500" />
          <NutritionMiniStat label="Protein" current={nutrition.protein} goal={goals.dailyProtein} color="bg-green-500" />
        </div>
      </div>

      {/* Custom Warning Alert Modal */}
      {showEfficiencyAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowEfficiencyAlert(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border-t-8 border-emerald-500">
            <div className="p-8 space-y-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 text-3xl">
                  <i className="fas fa-triangle-exclamation"></i>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-900">Warning</h2>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    You already have some of these items at home. To minimize waste and save money, would you like to review your cart?
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-3xl p-4 max-h-60 overflow-y-auto space-y-3 border border-slate-100">
                {duplicates.map(({ cartItem, invItem }, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-2xl flex items-center justify-between border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-emerald-500 overflow-hidden shrink-0">
                         {invItem.imageUrl ? <img src={invItem.imageUrl} className="w-full h-full object-cover" /> : <i className="fas fa-box text-sm"></i>}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight">{invItem.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400">Current Stock: {invItem.quantity} {invItem.unit}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                        invItem.expiryDate && new Date(invItem.expiryDate) < new Date() ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {invItem.expiryDate ? `Expires ${invItem.expiryDate}` : 'No Expiry'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button 
                  onClick={() => setShowEfficiencyAlert(false)}
                  className="w-full py-4 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Let me review my cart
                </button>
                <button 
                  onClick={() => {
                    setShowEfficiencyAlert(false);
                    onCheckout();
                  }}
                  className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                >
                  Continue to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NutritionMiniStat: React.FC<{ label: string; current: number; goal: number; color: string }> = ({ label, current, goal, color }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
      <span>{label}</span>
      <span>{Math.min(100, (current / goal) * 100).toFixed(0)}%</span>
    </div>
    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, (current / goal) * 100)}%` }}></div>
    </div>
  </div>
);

export default Cart;
