
import React, { useState, useMemo, useEffect } from 'react';
import { InventoryItem, Recipe } from '../types';
import { getRecipesForIngredients, generateRecipeImage } from '../services/geminiService';

interface RecipesProps {
  inventory: InventoryItem[];
}

const Recipes: React.FC<RecipesProps> = ({ inventory }) => {
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);

  const getItemStatus = (item: InventoryItem) => {
    if (!item.expiryDate) return { label: 'Fresh', color: 'bg-slate-300', text: 'text-slate-400' };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(item.expiryDate);
    expiry.setHours(0, 0, 0, 0);
    
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    // Threshold matched to Dashboard and Inventory (3 days)
    if (diffDays < 0) return { label: 'Expired', color: 'bg-red-500', text: 'text-red-500' };
    if (diffDays <= 3) return { label: 'Soon', color: 'bg-amber-500', text: 'text-amber-600' };
    return { label: 'Fresh', color: 'bg-slate-300', text: 'text-slate-400' };
  };

  // Combine and sort inventory items: expired first, then expiring soon, then fresh/alphabetical
  const sortedInventory = useMemo(() => {
    return [...inventory].sort((a, b) => {
      const statusA = getItemStatus(a);
      const statusB = getItemStatus(b);
      
      const rank = { 'Expired': 0, 'Soon': 1, 'Fresh': 2 };
      const diff = rank[statusA.label as keyof typeof rank] - rank[statusB.label as keyof typeof rank];
      
      if (diff !== 0) return diff;
      return a.name.localeCompare(b.name);
    });
  }, [inventory]);

  const fetchSuggestions = async () => {
    if (selectedIngredients.length === 0) return;
    setLoading(true);
    setRecipes([]);
    try {
      const data = await getRecipesForIngredients(selectedIngredients);
      setRecipes(data);
      
      // Kick off image generation in parallel for each recipe
      data.forEach(async (recipe) => {
        const imageUrl = await generateRecipeImage(recipe.title);
        if (imageUrl) {
          setRecipes(prev => prev.map(r => r.id === recipe.id ? { ...r, imageUrl } : r));
        }
      });
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
          <p className="text-slate-500">Transform your inventory into delicious meals.</p>
        </div>
        <button 
          onClick={fetchSuggestions}
          disabled={loading || selectedIngredients.length === 0}
          className="w-full md:w-auto px-8 py-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <i className="fas fa-wand-magic-sparkles"></i>
          )}
          Find Recipes
        </button>
      </header>

      <section className="bg-white p-6 rounded-[32px] border border-emerald-50 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Select Inventory Items to Use</h3>
          <p className="text-sm text-slate-400 mb-4">Click to select items. Status dots help you prioritize expiring food.</p>
          <div className="flex flex-wrap gap-2">
            {sortedInventory.length > 0 ? (
              sortedInventory.map(item => {
                const isSelected = selectedIngredients.includes(item.name);
                const status = getItemStatus(item);
                
                return (
                  <button 
                    key={item.id}
                    onClick={() => toggleIngredient(item.name)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
                      isSelected
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-400 hover:bg-emerald-50'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${status.color} ${status.label === 'Soon' ? 'animate-pulse' : ''}`}></span>
                    {item.name}
                    <span className={`text-[9px] font-black uppercase tracking-tighter ml-1 ${isSelected ? 'text-white/40' : status.text}`}>
                      ({status.label})
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="text-sm italic text-slate-400">Your inventory is empty. Try adding items first!</p>
            )}
          </div>
        </div>
      </section>

      {recipes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom duration-500">
          {recipes.map(recipe => (
            <div 
              key={recipe.id}
              className="bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col cursor-pointer group"
              onClick={() => setActiveRecipe(recipe)}
            >
              <div className="aspect-video bg-emerald-50 flex items-center justify-center text-emerald-200 relative overflow-hidden">
                {recipe.imageUrl ? (
                  <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <i className="fas fa-utensils text-5xl opacity-20"></i>
                    <p className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Generating AI Image...</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 flex gap-2">
                   <div className="bg-emerald-600/40 backdrop-blur-md text-white text-[9px] font-black uppercase px-2 py-1 rounded-lg border border-white/10">
                     AI Visual
                   </div>
                </div>
              </div>
              <div className="p-6 flex-1 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-xl font-bold text-slate-900 leading-tight line-clamp-2 group-hover:text-emerald-600 transition-colors">{recipe.title}</h3>
                  <div className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg shrink-0">
                    {recipe.calories} kcal
                  </div>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2">{recipe.description}</p>
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                    <i className="far fa-clock text-emerald-500"></i>
                    {recipe.cookTime}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                    <i className="fas fa-users text-emerald-500"></i>
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
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-y-auto animate-in zoom-in duration-300 border-t-8 border-emerald-600">
            <div className="relative aspect-[21/9] bg-emerald-50 overflow-hidden">
                {activeRecipe.imageUrl && (
                  <img src={activeRecipe.imageUrl} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-white"></div>
                <button 
                  onClick={() => setActiveRecipe(null)}
                  className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-emerald-600 hover:text-white transition-all z-20"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <div className="p-8 -mt-12 relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="space-y-6">
                <div className="bg-emerald-50 p-6 rounded-3xl space-y-4 border border-emerald-100 shadow-xl shadow-emerald-900/5">
                  <h4 className="font-bold text-emerald-600 uppercase text-xs tracking-widest">Efficiency Facts</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <NutritionMini label="Protein" val={activeRecipe.protein} unit="g" />
                    <NutritionMini label="Carbs" val={activeRecipe.carbs} unit="g" />
                    <NutritionMini label="Fat" val={activeRecipe.fat} unit="g" />
                    <NutritionMini label="Cals" val={activeRecipe.calories} unit="" />
                  </div>
                </div>

                <div className="space-y-3 px-2">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2">
                    <i className="fas fa-shopping-basket text-emerald-500"></i> Ingredients
                  </h4>
                  <ul className="space-y-2">
                    {activeRecipe.ingredients.map((ing, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-300 rounded-full mt-1.5 shrink-0"></div>
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="md:col-span-2 space-y-6">
                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-slate-900 leading-tight">{activeRecipe.title}</h2>
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                      <i className="fas fa-list-check text-emerald-500"></i> Instructions
                    </h4>
                    <div className="space-y-4">
                      {activeRecipe.instructions.map((step, i) => (
                        <div key={i} className="flex gap-4 p-4 bg-emerald-50/30 rounded-2xl group hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-emerald-100">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-emerald-600 font-bold text-xs shadow-sm shrink-0 border border-emerald-50">
                            {i + 1}
                          </div>
                          <p className="text-slate-600 leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/50">
               <button onClick={() => setActiveRecipe(null)} className="px-8 py-3 font-bold text-slate-500 hover:bg-white rounded-2xl transition-all">Close</button>
               <button className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center gap-2">
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
