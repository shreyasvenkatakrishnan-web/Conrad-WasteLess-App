
import React from 'react';
import { Product, Deal } from '../types';

interface DealsProps {
  onAddToCart: (product: Product) => void;
  products: Product[];
  deals: Deal[];
}

const Deals: React.FC<DealsProps> = ({ onAddToCart, products, deals }) => {
  const activeDeals = deals.filter(d => d.isActive);

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Weekly Deals</h1>
        <p className="text-slate-500">Save big on your grocery favorites this week.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeDeals.map(deal => (
          <div key={deal.id} className="bg-gradient-to-br from-emerald-600 to-green-700 p-8 rounded-[40px] text-white shadow-xl shadow-emerald-200 relative overflow-hidden group">
            <div className="relative z-10 space-y-4">
              <span className="bg-white/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">{deal.discountType === 'bogo' ? 'BOGO Offer' : 'Limited Time'}</span>
              <div>
                <h2 className="text-3xl font-black">{deal.title}</h2>
                <p className="text-emerald-100 mt-2 leading-relaxed opacity-90">{deal.description}</p>
              </div>
              <div className="flex items-center gap-4 pt-4">
                 <button 
                  onClick={() => {
                    const prod = products.find(p => deal.applicableProductIds.includes(p.id));
                    if (prod) onAddToCart(prod);
                  }}
                  className="bg-white text-emerald-600 px-8 py-3 rounded-2xl font-black text-sm hover:bg-emerald-50 transition-all active:scale-95"
                 >
                   Claim Deal
                 </button>
                 <span className="text-xs text-emerald-200 font-bold uppercase tracking-tighter">Ends in 4 days</span>
              </div>
            </div>
            {/* Background elements */}
            <i className="fas fa-tag absolute -right-10 -bottom-10 text-[180px] text-white/10 rotate-12 group-hover:rotate-45 transition-transform duration-700"></i>
          </div>
        ))}
      </div>

      <div className="space-y-6 pt-6">
        <h3 className="text-2xl font-bold text-slate-800">Featured On-Sale Items</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.filter(p => p.isOnSale).map(product => (
            <div key={product.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col group">
              <div className="relative aspect-square bg-slate-50 rounded-2xl mb-4 flex items-center justify-center text-slate-300 overflow-hidden">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <i className="fas fa-box-open text-5xl"></i>
                )}
                <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase shadow-sm">-{Math.round(((product.price - (product.salePrice || product.price)) / product.price) * 100)}%</span>
              </div>
              <h4 className="font-bold text-slate-800 line-clamp-1 group-hover:text-emerald-600 transition-colors">{product.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-black text-slate-900">${product.salePrice?.toFixed(2)}</span>
                <span className="text-sm text-slate-400 line-through">${product.price.toFixed(2)}</span>
              </div>
              <button 
                onClick={() => onAddToCart(product)}
                className="mt-4 w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
              >
                <i className="fas fa-plus"></i>
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Deals;
