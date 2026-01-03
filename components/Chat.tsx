
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, CartItem, NutritionGoals, InventoryItem, Budget } from '../types';
import { getAiResponse, parseShoppingItems } from '../services/geminiService';

interface ChatProps {
  history: ChatMessage[];
  setHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  context: {
    goals: NutritionGoals;
    inventory: InventoryItem[];
    cart: CartItem[];
    budget: Budget;
    currentSpending: number;
  };
  onAddToCart: (item: Partial<CartItem>) => void;
}

const SUGGESTED_PROMPTS = [
  "Waste-reducing meal plan for $50",
  "How to use my expiring produce?",
  "Healthy 20-min eco-friendly dinner",
  "Optimize my shopping for efficiency"
];

const Chat: React.FC<ChatProps> = ({ history, setHistory, context, onAddToCart }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history, loading]);

  const handleSubmit = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    };

    setHistory(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await getAiResponse(messageText, history, context);
      const extracted = parseShoppingItems(response);
      
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        extractedItems: extracted.length > 0 ? extracted : undefined
      };
      setHistory(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting. Please try again later.",
        timestamp: new Date().toISOString()
      };
      setHistory(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-60px)] p-4 max-w-4xl mx-auto">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2 scroll-smooth">
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-600 animate-bounce shadow-sm">
              <i className="fas fa-robot text-3xl"></i>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">WasteLess AI</h2>
              <p className="text-slate-500 max-w-sm">I'm your eco-friendly companion. I can help you reduce food waste, save money, and eat healthier.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 max-w-md">
              {SUGGESTED_PROMPTS.map(p => (
                <button 
                  key={p} 
                  onClick={() => handleSubmit(p)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-semibold text-slate-600 hover:bg-emerald-50 hover:border-emerald-400 transition-all shadow-sm"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {history.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-3xl px-6 py-4 shadow-sm ${
              msg.role === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
            }`}>
              <div className="prose prose-sm prose-slate max-w-none">
                {msg.content.split('\n').map((line, i) => (
                  <p key={i} className="mb-2 last:mb-0 leading-relaxed">{line}</p>
                ))}
              </div>
              
              {msg.extractedItems && msg.extractedItems.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Efficient suggestions</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.extractedItems.map((item, idx) => (
                      <button 
                        key={idx}
                        onClick={() => onAddToCart(item)}
                        className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors border border-emerald-100"
                      >
                        <i className="fas fa-cart-plus"></i> Add {item.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white px-6 py-4 rounded-3xl rounded-bl-none shadow-sm border border-slate-100">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 relative group">
        <input 
          type="text"
          placeholder="Ask WasteLess anything..."
          className="w-full pl-6 pr-14 py-4 bg-white border border-slate-200 rounded-2xl shadow-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all group-hover:border-emerald-400"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          disabled={loading}
        />
        <button 
          onClick={() => handleSubmit()}
          disabled={loading || !input.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 transition-all shadow-lg"
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
};

export default Chat;
