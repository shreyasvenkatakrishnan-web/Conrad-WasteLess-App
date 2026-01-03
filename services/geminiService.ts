
import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage, CartItem, NutritionGoals, InventoryItem, Budget, Recipe, StorageAdvice, Recommendation } from '../types';

// Initialize the Google GenAI client with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAiResponse = async (
  prompt: string,
  history: ChatMessage[],
  context: {
    goals: NutritionGoals;
    inventory: InventoryItem[];
    cart: CartItem[];
    budget: Budget;
    currentSpending: number;
  }
) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      ...history.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
      { role: 'user', parts: [{ text: prompt }] }
    ],
    config: {
      systemInstruction: `You are WasteLess, an AI shopping and waste-reduction assistant.
      Current Context:
      - Nutrition Goals: ${JSON.stringify(context.goals)}
      - Inventory: ${context.inventory.map(i => i.name).join(', ')}
      - Cart Items: ${context.cart.map(i => i.name).join(', ')}
      - Weekly Budget: $${context.budget.weeklyAmount}
      - Current Cart Total: $${context.currentSpending.toFixed(2)}

      Rules:
      1. Help with meal plans, recipes, and shopping.
      2. When suggesting items to buy, use the EXACT format: "- Item Name: $X.XX" or "• Item Name - $X.XX" so they can be parsed.
      3. Be mindful of the budget and nutrition goals.
      4. Suggest meals based on inventory to reduce waste (Eco-conscious approach).
      5. Keep responses concise and helpful.
      6. CRITICAL: Never use the phrases "zero-waste" or "sustainable" in your responses. Use "eco-friendly" or "waste-reducing" instead.
      7. INGREDIENT RULE: In any list of ingredients or recipes, do not use any words before the name of the food itself. No quantities, no measurements (cups, oz, etc), and no adjectives (fresh, organic, diced). Only output the name of the food (e.g., "Eggs" instead of "2 Large Eggs").`
    }
  });

  return response.text;
};

export const getShoppingRecommendations = async (
  inventory: InventoryItem[],
  goals: NutritionGoals
): Promise<Recommendation[]> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Strictly filter for items where expiryDate is in the past
  const expiredItems = inventory.filter(i => i.expiryDate && new Date(i.expiryDate) < today);
  
  // If no items are expired, return an empty array immediately to avoid unnecessary API calls
  if (expiredItems.length === 0) {
    return [];
  }

  const prompt = `You are the Purchase Recommendation Assistant. Your ONLY job is to suggest fresh replacements for items that have EXPIRED in the user's pantry.
  
  List of Expired Items: [${expiredItems.map(i => `${i.name} (expired on ${i.expiryDate})`).join(', ')}]
  Nutrition Goals Context: ${JSON.stringify(goals)}

  CRITICAL INSTRUCTION: 
  - ONLY recommend items that match the names of the expired items listed above. 
  - DO NOT suggest new items or items that are still fresh.
  - Provide a reason that explicitly mentions replacing the expired stock with a fresh purchase.
  
  Output the response as a JSON array of objects.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            reason: { type: Type.STRING },
            category: { type: Type.STRING },
            estimatedPrice: { type: Type.NUMBER },
            isReplacement: { type: Type.BOOLEAN }
          },
          required: ["id", "name", "reason", "category", "estimatedPrice", "isReplacement"]
        }
      }
    }
  });

  try {
    const data = JSON.parse(response.text);
    // Extra safety filter to ensure AI followed instructions
    return data.filter((rec: any) => 
      expiredItems.some(exp => rec.name.toLowerCase().includes(exp.name.toLowerCase()) || exp.name.toLowerCase().includes(rec.name.toLowerCase()))
    );
  } catch (e) {
    console.error("Failed to parse recommendations:", e);
    return [];
  }
};

export const getStorageAdvice = async (itemName: string): Promise<StorageAdvice> => {
  const prompt = `Provide the absolute best scientific storage advice for "${itemName}" to maximize its shelf life and minimize waste. 
  Focus on location, temperature, and specific container types.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          location: { type: Type.STRING, description: "Must be one of: Pantry, Fridge, Freezer" },
          temperature: { type: Type.STRING },
          container: { type: Type.STRING },
          tips: { type: Type.ARRAY, items: { type: Type.STRING } },
          shelfLifeExtension: { type: Type.STRING, description: "Estimate of how many extra days this adds" },
        },
        required: ["location", "temperature", "container", "tips", "shelfLifeExtension"],
      },
    }
  });

  try {
    return JSON.parse(response.text) as StorageAdvice;
  } catch (e) {
    console.error("Failed to parse storage advice JSON", e);
    // Fallback
    return {
      location: 'Fridge',
      temperature: '34°F - 38°F',
      container: 'Airtight Container',
      tips: ['Store in a cool, dark place', 'Keep away from moisture'],
      shelfLifeExtension: '3-5 days'
    };
  }
};

export const getRecipesForIngredients = async (ingredients: string[]): Promise<Recipe[]> => {
  const prompt = `Suggest 3 unique recipes that primarily use these ingredients: ${ingredients.join(', ')}. 
  Prioritize reducing food waste and efficiency. 
  
  CRITICAL RULES:
  1. DO NOT use the terms "zero-waste" or "sustainable" anywhere in the response.
  2. INGREDIENTS LIST: In the "ingredients" array, only use the name of the foods. DO NOT include quantities, measurements, or any descriptive words before the name of the food. 
     - WRONG: "1 cup of milk", "3 large eggs", "Fresh spinach".
     - RIGHT: "Milk", "Eggs", "Spinach".
  3. Ensure the JSON response strictly follows the schema.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            prepTime: { type: Type.STRING },
            cookTime: { type: Type.STRING },
            servings: { type: Type.NUMBER },
            ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fat: { type: Type.NUMBER },
          },
          required: ["id", "title", "description", "prepTime", "cookTime", "servings", "ingredients", "instructions", "calories", "protein", "carbs", "fat"],
        },
      },
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse recipes JSON", e);
    return [];
  }
};

export const parseShoppingItems = (text: string): Partial<CartItem>[] => {
  const items: Partial<CartItem>[] = [];
  const regex = /(?:[-•])\s*([^:\-]+)[:\-]\s*\$(\d+(?:\.\d{2})?)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const name = match[1].trim();
    const price = parseFloat(match[2]);
    
    let calories = 100, protein = 3, carbs = 15, fat = 3;
    let imageUrl = 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=200&auto=format&fit=crop'; 
    const lowerName = name.toLowerCase();

    if (lowerName.includes('salmon') || lowerName.includes('fish') || lowerName.includes('tuna')) {
      calories = 200; protein = 25; carbs = 0; fat = 10;
      imageUrl = 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=200&auto=format&fit=crop';
    } else if (lowerName.includes('chicken') || lowerName.includes('turkey')) {
      calories = 165; protein = 30; carbs = 0; fat = 4;
      imageUrl = 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?q=80&w=200&auto=format&fit=crop';
    } else if (lowerName.includes('beef') || lowerName.includes('steak')) {
      calories = 250; protein = 25; carbs = 0; fat = 15;
      imageUrl = 'https://images.unsplash.com/photo-1588168333986-5078d3ae3973?q=80&w=200&auto=format&fit=crop';
    } else if (lowerName.includes('rice') || lowerName.includes('pasta') || lowerName.includes('bread')) {
      calories = 200; protein = 5; carbs = 40; fat = 2;
      imageUrl = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=200&auto=format&fit=crop';
    } else if (lowerName.includes('broccoli') || lowerName.includes('spinach') || lowerName.includes('veg')) {
      calories = 30; protein = 3; carbs = 5; fat = 0;
      imageUrl = 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=200&auto=format&fit=crop';
    } else if (lowerName.includes('banana') || lowerName.includes('apple') || lowerName.includes('fruit')) {
      calories = 95; protein = 1; carbs = 25; fat = 0;
      imageUrl = 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?q=80&w=200&auto=format&fit=crop';
    } else if (lowerName.includes('milk') || lowerName.includes('yogurt')) {
      calories = 150; protein = 8; carbs = 12; fat = 8;
      imageUrl = 'https://images.unsplash.com/photo-1550583724-b26cc28df5d1?q=80&w=200&auto=format&fit=crop';
    } else if (lowerName.includes('egg')) {
      calories = 155; protein = 13; carbs = 1; fat = 11;
      imageUrl = 'https://images.unsplash.com/photo-1582722872445-41ca507ad311?q=80&w=200&auto=format&fit=crop';
    }

    items.push({
      id: Math.random().toString(36).substr(2, 9),
      name,
      price,
      quantity: 1,
      calories,
      protein,
      carbs,
      fat,
      storeId: 's1',
      isOrganic: false,
      isOnSale: false,
      imageUrl
    });
  }

  return items;
};
