
import React from 'react';
import { InventoryItem, ViewType } from '../types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  expired: InventoryItem[];
  expiringSoon: InventoryItem[];
  onDismissAlerts: () => void;
  onNavigate: (view: ViewType) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose, expired, expiringSoon, onDismissAlerts, onNavigate }) => {
  const total = expired.length + expiringSoon.length;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Slide-out Panel */}
      <aside 
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-[70] transform transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <header className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <i className="fas fa-bell"></i>
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Safety Center</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{total} Active Alerts</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors"
            >
              <i className="fas fa-times text-lg"></i>
            </button>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {total === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-300">
                  <i className="fas fa-check-circle text-4xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Everything looks great!</h3>
                  <p className="text-sm text-slate-500">Your inventory is fresh and optimized.</p>
                </div>
              </div>
            ) : (
              <>
                {/* Expired Section */}
                {expired.length > 0 && (
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                        <i className="fas fa-circle-exclamation"></i>
                        Expired ({expired.length})
                      </h4>
                      <button 
                        onClick={onDismissAlerts}
                        className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors underline"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="space-y-3">
                      {expired.map(item => (
                        <NotificationCard 
                          key={item.id} 
                          item={item} 
                          type="expired" 
                          onClick={() => onNavigate('inventory')} 
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Expiring Soon Section */}
                {expiringSoon.length > 0 && (
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                        <i className="fas fa-hourglass-half"></i>
                        Expiring Soon ({expiringSoon.length})
                      </h4>
                      {expired.length === 0 && (
                        <button 
                          onClick={onDismissAlerts}
                          className="text-[10px] font-bold text-slate-400 hover:text-amber-500 transition-colors underline"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {expiringSoon.map(item => (
                        <NotificationCard 
                          key={item.id} 
                          item={item} 
                          type="warning" 
                          onClick={() => onNavigate('recipes')} 
                        />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>

          {/* Footer Actions */}
          <footer className="p-6 border-t border-slate-100 space-y-3 bg-slate-50/50">
             <p className="text-[10px] text-slate-400 font-medium text-center italic mb-4">
               Safety tip: Always check the look and smell of your food before consumption.
             </p>
             <button 
                onClick={() => onNavigate('recipes')}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2"
             >
               <i className="fas fa-wand-magic-sparkles"></i>
               Find Recipes for these items
             </button>
          </footer>
        </div>
      </aside>
    </>
  );
};

interface NotificationCardProps {
  item: InventoryItem;
  type: 'expired' | 'warning';
  onClick: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ item, type, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full bg-white border border-slate-100 p-4 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left flex gap-4 group"
  >
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden ${
      type === 'expired' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600'
    }`}>
      {item.imageUrl ? (
        <img src={item.imageUrl} className="w-full h-full object-cover" />
      ) : (
        <i className={`fas ${type === 'expired' ? 'fa-skull-crossbones' : 'fa-clock'}`}></i>
      )}
    </div>
    <div className="flex-1 space-y-1">
      <div className="flex justify-between items-start">
        <h5 className="text-sm font-bold text-slate-800 line-clamp-1">{item.name}</h5>
        <i className="fas fa-chevron-right text-[10px] text-slate-300 group-hover:text-emerald-500 transition-colors mt-1"></i>
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
        {item.quantity} {item.unit} in stock
      </p>
      <div className="pt-1 flex items-center gap-1.5">
         <div className={`w-1.5 h-1.5 rounded-full ${type === 'expired' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
         <span className={`text-[9px] font-black uppercase ${type === 'expired' ? 'text-red-500' : 'text-amber-500'}`}>
           {type === 'expired' ? `Expired on ${item.expiryDate}` : `Expiring in ${item.expiryDate}`}
         </span>
      </div>
    </div>
  </button>
);

export default NotificationCenter;
