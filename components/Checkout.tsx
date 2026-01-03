
import React, { useState } from 'react';
import { CartItem, GroceryStore, InventoryItem } from '../types';

interface CheckoutProps {
  cart: CartItem[];
  subtotal: number;
  onSuccess: () => void;
  onCancel: () => void;
  stores: GroceryStore[];
}

const Checkout: React.FC<CheckoutProps> = ({ cart, subtotal, onSuccess, onCancel, stores }) => {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [paymentMethod, setPaymentMethod] = useState<'apple' | 'google' | 'card'>('card');
  const [loading, setLoading] = useState(false);

  const tax = subtotal * 0.08875;
  const fees = method === 'delivery' ? 5.98 : 1.99;
  const total = subtotal + tax + fees;

  const handleFinish = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin"></div>
          <i className="fas fa-shopping-cart absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-600"></i>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-800">Processing Order</h2>
          <p className="text-slate-500">Securely completing your purchase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right duration-500">
      <header className="flex items-center gap-4">
        <button onClick={onCancel} className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-500 hover:text-emerald-600 transition-colors">
          <i className="fas fa-arrow-left"></i>
        </button>
        <h1 className="text-3xl font-bold">Checkout</h1>
      </header>

      <div className="flex gap-4 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex-1 flex items-center gap-3">
             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{s}</div>
             <div className={`flex-1 h-1 rounded-full ${step > s ? 'bg-emerald-600' : 'bg-slate-200'}`}></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-slate-800">How would you like your order?</h2>
              <div className="grid grid-cols-2 gap-4">
                <FulfillmentCard active={method === 'pickup'} icon="fa-store" label="Store Pickup" onClick={() => setMethod('pickup')} />
                <FulfillmentCard active={method === 'delivery'} icon="fa-truck" label="Home Delivery" onClick={() => setMethod('delivery')} />
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-4 shadow-sm">
                <label className="block text-sm font-bold text-slate-700">Select Store / Address</label>
                <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500">
                  {stores.filter(s => s.isSelected).map(s => <option key={s.id}>{s.name} - {s.address}</option>)}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-slate-800">Payment Method</h2>
              <div className="space-y-3">
                <PaymentRow 
                  icon="fab fa-apple" 
                  label="Apple Pay" 
                  active={paymentMethod === 'apple'} 
                  onClick={() => setPaymentMethod('apple')} 
                />
                <PaymentRow 
                  icon="fab fa-google-pay" 
                  label="Google Pay" 
                  active={paymentMethod === 'google'} 
                  onClick={() => setPaymentMethod('google')} 
                />
                <PaymentRow 
                  icon="fas fa-credit-card" 
                  label="Credit Card" 
                  active={paymentMethod === 'card'} 
                  onClick={() => setPaymentMethod('card')} 
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-slate-800">Final Review</h2>
              <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 space-y-2">
                <p className="text-emerald-800 font-bold flex items-center gap-2">
                  <i className="fas fa-info-circle"></i> Confirm items & totals
                </p>
                <p className="text-sm text-emerald-600">You are about to place an order for {cart.length} items using {paymentMethod === 'card' ? 'Credit Card' : paymentMethod === 'apple' ? 'Apple Pay' : 'Google Pay'} to be {method === 'pickup' ? 'picked up' : 'delivered'}.</p>
              </div>
            </div>
          )}

          <div className="pt-8 flex gap-4">
            {step > 1 && <button onClick={() => setStep(step - 1)} className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50">Back</button>}
            <button 
              onClick={() => step === 3 ? handleFinish() : setStep(step + 1)} 
              className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg shadow-slate-200 hover:bg-emerald-600 transition-all"
            >
              {step === 3 ? 'Place Order' : 'Continue'}
            </button>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6 h-fit">
          <h3 className="text-xl font-bold text-slate-800">Your Order</h3>
          <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <div className="flex gap-3 items-center">
                  <span className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center text-[10px] font-bold text-slate-500">{item.quantity}</span>
                  <span className="font-medium text-slate-700">{item.name}</span>
                </div>
                <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="pt-6 border-t border-slate-100 space-y-3">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500">
              <span>Fulfillment Fee</span>
              <span>${fees.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500">
              <span>Taxes</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="pt-4 flex justify-between items-center">
              <span className="text-lg font-bold">Total</span>
              <span className="text-2xl font-black text-emerald-600">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FulfillmentCard: React.FC<{ active: boolean; icon: string; label: string; onClick: () => void }> = ({ active, icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${
      active ? 'bg-emerald-50 border-emerald-600 text-emerald-600' : 'bg-white border-slate-100 text-slate-400 grayscale hover:grayscale-0'
    }`}
  >
    <i className={`fas ${icon} text-3xl`}></i>
    <span className="font-bold text-sm uppercase tracking-widest">{label}</span>
  </button>
);

const PaymentRow: React.FC<{ icon: string; label: string; active?: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all text-left ${
      active ? 'border-emerald-600 bg-emerald-50' : 'border-slate-100 hover:border-slate-200 bg-white'
    }`}
  >
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-600">
        <i className={icon}></i>
      </div>
      <span className="font-bold text-slate-700">{label}</span>
    </div>
    {active ? (
      <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-white text-[10px]">
        <i className="fas fa-check"></i>
      </div>
    ) : (
      <div className="w-6 h-6 rounded-full border border-slate-200"></div>
    )}
  </button>
);

export default Checkout;
