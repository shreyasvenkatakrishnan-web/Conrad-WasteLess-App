import React, { useState, useMemo, useEffect } from 'react';
import { InventoryItem, Recipe } from '../types';
import { getRecipesForIngredients } from '../services/geminiService';

interface RecipesProps {
  inventory: InventoryItem[];
}

const Recipes: React.FC<RecipesProps> = ({ inventory }) => {
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);

  const expiringSoon = useMemo(() => {
    const today = new Date();
    return inventory.filter(item => {
      if (!item.expiryDate) return false;
      const expiry = new Date(item.expiryDate);
      const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
      return diffDays <= 5;
    });
  }, [inventory]);

  useEffect(() => {
    setSelectedIngredients(expiringSoon.map(i => i.name));
  }, [expiringSoon]);

  const fetchSuggestions = async () => {
    if (selectedIngredients.length === 0) return;
    setLoading(true);
    try {
      const data = await getRecipesForIngredients(selectedIngredients);
      setRecipes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleIngredient = (name: string) => {
    setSelectedIngredients(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Recipes</h1>
          <p className="text-slate-500">Transform your expiring food into delicious waste-reducing meals.</p>
        </div>
        <button 
          onClick={fetchSuggestions}
          disabled={loading || selectedIngredients.length === 0}
          className="w-full md:w-auto px-8 py-3 bg-emerald-600 text-white rounded-2xl shadow-lg hover:bg-emerald-700 transition-all font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <i className="fas fa-wand-magic-sparkles"></i>
          )}
          Find Recipes
        </button>
      </header>

      <section className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Select Pantry Items to Use</h3>
          <p className="text-sm text-slate-400 mb-4">Click to select items. Focus on items expiring soon!</p>
          <div className="flex flex-wrap gap-2">
            {expiringSoon.length > 0 ? (
              expiringSoon.map(item => (
                <button 
                  key={item.id}
                  onClick={() => toggleIngredient(item.name)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedIngredients.includes(item.name)
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:border-emerald-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <i className="fas fa-clock text-[10px] opacity-70"></i>
                    {item.name}
                  </span>
                </button>
              ))
            ) : (
              <p className="text-sm italic text-slate-400">Nothing expiring soon. You're an efficiency hero!</p>
            )}
            {inventory.filter(i => !expiringSoon.some(e => e.id === i.id)).slice(0, 8).map(item => (
              <button 
                key={item.id}
                onClick={() => toggleIngredient(item.name)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  selectedIngredients.includes(item.name)
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-300'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {recipes.length > 0 && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom duration-500">
          {recipes.map(recipe => (
            <div 
              key={recipe.id}
              className="bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col cursor-pointer group"
              onClick={() => setActiveRecipe(recipe)}
            >
              <div className="aspect-video bg-slate-100 flex items-center justify-center text-slate-300 relative">
                <i className="fas fa-utensils text-5xl group-hover:scale-110 transition-transform"></i>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              <div className="p-6 flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">{recipe.title}</h3>
                  <div className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg">
                    {recipe.calories} kcal
                  </div>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2">{recipe.description}</p>
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                    <i className="far fa-clock"></i>
                    {recipe.cookTime}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                    <i className="fas fa-users"></i>
                    {recipe.servings} Servings
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeRecipe && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-y-auto animate-in zoom-in duration-300">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md p-6 border-b border-slate-100 flex justify-between items-center z-10">
              <h2 className="text-2xl font-black text-slate-900">{activeRecipe.title}</h2>
              <button 
                onClick={() => setActiveRecipe(null)}
                className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="space-y-6">
                <div className="bg-emerald-50 p-6 rounded-3xl space-y-4 border border-emerald-100">
                  <h4 className="font-bold text-emerald-900 uppercase text-xs tracking-widest">Efficiency Facts</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <NutritionMini label="Protein" val={activeRecipe.protein} unit="g" />
                    <NutritionMini label="Carbs" val={activeRecipe.carbs} unit="g" />
                    <NutritionMini label="Fat" val={activeRecipe.fat} unit="g" />
                    <NutritionMini label="Cals" val={activeRecipe.calories} unit="" />
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2">
                    <i className="fas fa-shopping-basket text-emerald-500"></i> Ingredients
                  </h4>
                  <ul className="space-y-2">
                    {activeRecipe.ingredients.map((ing, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-200 rounded-full mt-1.5 shrink-0"></div>
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="md:col-span-2 space-y-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                    <i className="fas fa-list-check text-green-500"></i> Instructions
                  </h4>
                  <div className="space-y-4">
                    {activeRecipe.instructions.map((step, i) => (
                      <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-2xl group hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-100">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 font-bold text-xs shadow-sm shrink-0 border border-slate-100">
                          {i + 1}
                        </div>
                        <p className="text-slate-600 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 flex justify-end gap-4">
               <button onClick={() => setActiveRecipe(null)} className="px-8 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all">Close</button>
               <button className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2">
                 <i className="fas fa-bookmark"></i> Save Recipe
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NutritionMini: React.FC<{ label: string; val: number; unit: string }> = ({ label, val, unit }) => (
  <div className="space-y-0.5">
    <p className="text-[10px] font-black text-emerald-300 uppercase">{label}</p>
    <p className="font-bold text-emerald-900">{val}{unit}</p>
  </div>
);

export default Recipes;