
import React, { useMemo } from 'react';
import { NutritionGoals, Budget, InventoryItem, ViewType, Product } from '../types';

interface DashboardProps {
  cartNutrition: { calories: number; protein: number; carbs: number; fat: number };
  goals: NutritionGoals;
  budget: Budget;
  spent: number;
  inventory: InventoryItem[];
  onNavigate: (view: ViewType) => void;
  onAddToCart: (product: Product) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ cartNutrition, goals, budget, spent, inventory, onNavigate, onAddToCart }) => {
  const expiringItems = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    return inventory.filter(item => {
      if (!item.expiryDate) return false;
      const expiry = new Date(item.expiryDate);
      const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
      return diffDays <= 3;
    }).slice(0, 2); // Matching the image which shows exactly 2 items
  }, [inventory]);

  const budgetProgress = Math.min(100, (spent / budget.weeklyAmount) * 100);

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-700">
      {/* Header Section */}
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">Dashboard</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Helping you shop smarter and manage your pantry efficiently.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('chat')} 
            className="bg-[#10b981] hover:bg-[#059669] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm shadow-emerald-200"
          >
            <i className="fas fa-pen text-sm"></i>
            Ask AI Assistant
          </button>
          <div className="relative">
             <button className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
              <i className="fas fa-bell text-sm"></i>
            </button>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white">2</span>
          </div>
        </div>
      </header>

      {/* Main Grid: Row 1 */}
      <div className="grid grid-cols-12 gap-8">
        {/* Expiring Soon Column (Span 4) */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-[32px] p-8 shadow-sm border border-slate-50 flex flex-col h-full">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-slate-800">Expiring Soon</h3>
            <span className="bg-[#ecfdf5] text-[#10b981] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tight">
              {expiringItems.length} Items
            </span>
          </div>
          <div className="space-y-4 flex-1">
            {expiringItems.map(item => {
              const expiry = item.expiryDate ? new Date(item.expiryDate) : null;
              const today = new Date();
              today.setHours(0,0,0,0);
              const diff = expiry ? Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24)) : 0;
              
              return (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-[#f8fafc]/50 rounded-2xl border border-slate-50 group transition-all">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-300 border border-slate-100 overflow-hidden shrink-0">
                    {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <i className="fas fa-egg"></i>}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">{item.name}</p>
                    <p className="text-[11px] font-semibold text-slate-400">{item.quantity} {item.unit}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold whitespace-nowrap ${
                    diff < 0 ? 'bg-red-50 text-red-500' : 'bg-[#fffbeb] text-[#d97706]'
                  }`}>
                    {diff < 0 ? 'Expired' : diff === 0 ? 'Today' : `in ${diff}d`}
                  </span>
                </div>
              );
            })}
          </div>
          <button 
            onClick={() => onNavigate('inventory')}
            className="mt-8 text-center text-[#10b981] font-bold text-sm hover:underline tracking-tight"
          >
            Manage Inventory
          </button>
        </div>

        {/* Quick Actions Grid (Span 8) */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <ActionTile 
            title="Shop Products" 
            desc="Find smart options and deals" 
            icon="fa-search" 
            color="bg-[#10b981]" 
            onClick={() => onNavigate('shop')} 
          />
          <ActionTile 
            title="Scan Receipt" 
            desc="Instantly import your grocery history" 
            icon="fa-receipt" 
            color="bg-[#047857]" 
            onClick={() => onNavigate('inventory')} 
          />
          <ActionTile 
            title="Meal Planner" 
            desc="Optimized menu generated by AI" 
            icon="fa-utensils" 
            color="bg-[#10b981]" 
            onClick={() => onNavigate('chat')} 
          />
          <ActionTile 
            title="Favorite Stores" 
            desc="Compare local pricing and deals" 
            icon="fa-store" 
            color="bg-[#10b981]" 
            onClick={() => onNavigate('stores')} 
          />
        </div>
      </div>

      {/* Main Grid: Row 2 */}
      <div className="grid grid-cols-12 gap-8">
        {/* Weekly Budget (Span 4) */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-[32px] p-8 shadow-sm border border-slate-50 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-[#ecfdf5] rounded-2xl flex items-center justify-center text-[#10b981]">
                <i className="fas fa-wallet text-lg"></i>
              </div>
              <span className="px-3 py-1 bg-[#ecfdf5] text-[#10b981] text-[10px] font-black rounded-lg uppercase tracking-tight">Good</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-400">Weekly Budget</h3>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-black text-slate-900">${spent.toFixed(2)}</span>
                <span className="text-sm text-slate-400 font-bold">/ ${budget.weeklyAmount}</span>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <div className="h-2 w-full bg-[#f1f5f9] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#10b981] transition-all duration-1000" 
                style={{ width: `${budgetProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Nutrition Goals (Span 8) */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-[32px] p-8 shadow-sm border border-slate-50">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-lg font-bold text-slate-800">Shopping Cart Nutrition</h3>
            <button 
              onClick={() => onNavigate('settings')} 
              className="text-[#10b981] text-[11px] font-extrabold uppercase hover:underline"
            >
              Edit Goals
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <NutritionProgress label="CALORIES" current={cartNutrition.calories} goal={goals.dailyCalories} unit="kcal" />
            <NutritionProgress label="PROTEIN" current={cartNutrition.protein} goal={goals.dailyProtein} unit="g" />
            <NutritionProgress label="CARBS" current={cartNutrition.carbs} goal={goals.dailyCarbs} unit="g" />
            <NutritionProgress label="FAT" current={cartNutrition.fat} goal={goals.dailyFat} unit="g" />
          </div>
        </div>
      </div>

      {/* Footer Banner */}
      <div className="bg-[#0a0f1d] rounded-[32px] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="space-y-2 relative z-10">
          <h2 className="text-2xl font-black tracking-tight">Help us grow WasteLess</h2>
          <p className="text-slate-400 text-sm font-medium max-w-xl">
            Your feedback helps us build a more efficient software for everyone. Share your thoughts on how we can improve.
          </p>
        </div>
        <button className="bg-[#10b981] hover:bg-[#059669] text-white font-extrabold px-8 py-4 rounded-2xl flex items-center gap-3 transition-all relative z-10 shadow-lg shadow-[#10b981]/10">
          <i className="fas fa-comment text-lg"></i>
          Give Feedback
        </button>
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
      </div>
    </div>
  );
};

const NutritionProgress: React.FC<{ label: string; current: number; goal: number; unit: string }> = ({ label, current, goal, unit }) => {
  const percent = Math.min(100, (current / goal) * 100);
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-black text-slate-400 tracking-tight">{label}</span>
        <span className="text-[10px] font-black text-slate-400">{percent.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 w-full bg-[#f1f5f9] rounded-full overflow-hidden">
        <div className="h-full bg-[#10b981] transition-all duration-1000" style={{ width: `${percent}%` }} />
      </div>
      <p className="text-sm font-black text-slate-900 leading-none">
        {current.toFixed(0)} <span className="text-slate-400 text-[11px] font-bold ml-0.5 tracking-tight uppercase">{unit} / {goal}{unit}</span>
      </p>
    </div>
  );
};

const ActionTile: React.FC<{ title: string; desc: string; icon: string; color: string; onClick: () => void }> = ({ title, desc, icon, color, onClick }) => (
  <button 
    onClick={onClick}
    className="bg-white p-6 rounded-[32px] border border-slate-50 shadow-sm hover:shadow-md transition-all flex items-center gap-6 text-left group"
  >
    <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-emerald-50 shrink-0 group-hover:scale-105 transition-transform`}>
      <i className={`fas ${icon}`}></i>
    </div>
    <div>
      <h4 className="font-extrabold text-[#111827] text-lg leading-tight">{title}</h4>
      <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed line-clamp-2">{desc}</p>
    </div>
  </button>
);

export default Dashboard;
