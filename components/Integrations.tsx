
import React, { useState } from 'react';
import { Integration } from '../types';

interface IntegrationsProps {
  integrations: Integration[];
  onToggle: (id: string) => void;
}

const Integrations: React.FC<IntegrationsProps> = ({ integrations, onToggle }) => {
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleAction = (id: string, isConnected: boolean) => {
    if (!isConnected) {
      setSyncingId(id);
      setTimeout(() => {
        onToggle(id);
        setSyncingId(null);
      }, 1500);
    } else {
      onToggle(id);
    }
  };

  const handleSyncNow = (id: string) => {
    setSyncingId(id);
    setTimeout(() => {
      setSyncingId(null);
    }, 2000);
  };

  return (
    <div className="p-6 space-y-8 animate-in slide-in-from-bottom duration-500 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900">Connected Services</h1>
          <p className="text-slate-500">Supercharge WasteLess with your health and purchase history.</p>
        </div>
        <div className="bg-emerald-50 px-4 py-2 rounded-2xl flex items-center gap-2 border border-emerald-100">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">System Online</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map(item => {
          const isSyncing = syncingId === item.id;
          
          return (
            <div key={item.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-6 flex flex-col relative overflow-hidden group">
              {item.isConnected && (
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 group-hover:w-2 transition-all"></div>
              )}
              
              <div className="flex justify-between items-start">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 duration-500 ${
                  item.category === 'health' ? 'bg-red-50 text-red-600' :
                  item.category === 'fitness' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  <i className={item.icon}></i>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    item.isConnected ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {item.isConnected ? 'Active' : 'Not Linked'}
                  </span>
                  {item.isConnected && item.lastSynced && (
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                      Synced {new Date(item.lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-black text-slate-800 tracking-tight">{item.name}</h3>
                <p className="text-sm text-slate-500 leading-relaxed opacity-80">{item.description}</p>
              </div>

              <div className="space-y-3">
                {item.isConnected && (
                   <button 
                    disabled={isSyncing}
                    onClick={() => handleSyncNow(item.id)}
                    className="w-full py-2 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all flex items-center justify-center gap-2"
                   >
                     {isSyncing ? (
                       <i className="fas fa-circle-notch animate-spin"></i>
                     ) : (
                       <i className="fas fa-rotate"></i>
                     )}
                     {isSyncing ? 'Refreshing...' : 'Sync Now'}
                   </button>
                )}
                
                <button 
                  disabled={isSyncing}
                  onClick={() => handleAction(item.id, item.isConnected)}
                  className={`w-full py-3 rounded-2xl font-black text-sm transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 ${
                    item.isConnected 
                      ? 'bg-white border-2 border-slate-100 text-red-500 hover:border-red-100 hover:bg-red-50' 
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100 shadow-lg'
                  }`}
                >
                  {isSyncing ? (
                    <>
                      <i className="fas fa-circle-notch animate-spin"></i>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <i className={`fas ${item.isConnected ? 'fa-unlink' : 'fa-link'}`}></i>
                      {item.isConnected ? 'Disconnect Service' : 'Connect Account'}
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-900 p-10 rounded-[48px] border border-slate-800 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <i className="fas fa-shield-halved text-[140px] text-white"></i>
        </div>
        <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center text-white text-4xl shrink-0 shadow-2xl shadow-emerald-900">
          <i className="fas fa-lock"></i>
        </div>
        <div className="space-y-3 relative z-10 text-center md:text-left">
          <h3 className="text-2xl font-black text-white">Trust & Security at WasteLess</h3>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
            We use bank-grade AES-256 encryption to protect your nutritional data and purchase history. WasteLess is committed to zero data sharing—your personal habits never leave your local workspace.
          </p>
          <div className="flex flex-wrap gap-4 pt-2 justify-center md:justify-start">
             <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
               <i className="fas fa-check-circle"></i> E2E Encrypted
             </div>
             <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
               <i className="fas fa-check-circle"></i> GDPR Compliant
             </div>
             <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
               <i className="fas fa-check-circle"></i> Privacy Focused
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integrations;
