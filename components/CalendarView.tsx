
import React, { useState, useMemo } from 'react';
import { InventoryItem } from '../types';

interface CalendarViewProps {
  items: InventoryItem[];
  onBack: () => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ items, onBack }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const itemsByDate = useMemo(() => {
    const map: { [key: string]: InventoryItem[] } = {};
    items.forEach(item => {
      if (item.expiryDate) {
        if (!map[item.expiryDate]) map[item.expiryDate] = [];
        map[item.expiryDate].push(item);
      }
    });
    return map;
  }, [items]);

  const days = useMemo(() => {
    const numDays = daysInMonth(year, month);
    const startOffset = firstDayOfMonth(year, month);
    const result = [];

    // Fill offset
    for (let i = 0; i < startOffset; i++) {
      result.push(null);
    }

    // Fill days
    for (let d = 1; d <= numDays; d++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      result.push({
        day: d,
        dateString,
        items: itemsByDate[dateString] || []
      });
    }

    return result;
  }, [year, month, itemsByDate]);

  const getStatusColor = (expiryDate: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const expiry = new Date(expiryDate);
    const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (diff < 0) return 'bg-red-500';
    if (diff === 0) return 'bg-orange-500';
    if (diff <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-all"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Expiry Calendar</h1>
            <p className="text-slate-500">Visualization of your food shelf life.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <button onClick={prevMonth} className="w-10 h-10 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 transition-colors">
            <i className="fas fa-chevron-left"></i>
          </button>
          <span className="text-lg font-bold text-slate-800 min-w-[140px] text-center">
            {monthName} {year}
          </span>
          <button onClick={nextMonth} className="w-10 h-10 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 transition-colors">
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </header>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-50 bg-slate-50/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 auto-rows-[120px]">
          {days.map((d, i) => (
            <div key={i} className={`border-r border-b border-slate-50 p-2 group transition-colors ${d ? 'hover:bg-blue-50/30' : 'bg-slate-50/20'}`}>
              {d && (
                <>
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-lg ${
                      new Date().toDateString() === new Date(year, month, d.day).toDateString() 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-400'
                    }`}>
                      {d.day}
                    </span>
                    {d.items.length > 0 && (
                      <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-md">
                        {d.items.length}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 overflow-y-auto h-[70px] pr-1 scrollbar-hide">
                    {d.items.map(item => (
                      <div 
                        key={item.id} 
                        className={`text-[9px] font-bold p-1 rounded-md text-white truncate shadow-sm flex items-center gap-1 ${getStatusColor(item.expiryDate!)}`}
                        title={`${item.name} (${item.quantity} ${item.unit})`}
                      >
                        <i className="fas fa-apple-whole text-[8px]"></i>
                        {item.name}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-6 justify-center pt-4">
        <LegendItem color="bg-red-500" label="Expired" />
        <LegendItem color="bg-orange-500" label="Expiring Today" />
        <LegendItem color="bg-yellow-500" label="Expiring Soon (3d)" />
        <LegendItem color="bg-green-500" label="Fresh" />
      </div>
    </div>
  );
};

const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${color}`}></div>
    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
  </div>
);

export default CalendarView;
