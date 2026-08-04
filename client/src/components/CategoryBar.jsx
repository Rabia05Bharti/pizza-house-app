import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedCategory } from '../redux/menuSlice';
import { ChevronDown, Dumbbell, Filter, Pizza, Sandwich, Coffee, Sparkles, Utensils } from 'lucide-react';

export default function CategoryBar() {
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.menu.categories);
  const selectedCategory = useSelector((state) => state.menu.selectedCategory);

  const getCategoryIcon = (cat) => {
    if (cat === 'Gym Guyz') return <Dumbbell className="w-4 h-4 text-emerald-600 inline mr-2" />;
    if (cat.includes('Pizza')) return <Pizza className="w-4 h-4 text-rose-500 inline mr-2" />;
    if (cat === 'Burgers' || cat === 'Sandwich') return <Sandwich className="w-4 h-4 text-amber-500 inline mr-2" />;
    if (cat === 'Shakes' || cat === 'Beverages') return <Coffee className="w-4 h-4 text-sky-500 inline mr-2" />;
    if (cat === 'Mocktails') return <Sparkles className="w-4 h-4 text-indigo-500 inline mr-2" />;
    return <Utensils className="w-4 h-4 text-slate-400 inline mr-2" />;
  };

  return (
    <div className="bg-white border-b border-slate-200 py-3 shadow-xs sticky top-20 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          
          {/* Label */}
          <div className="flex items-center space-x-2 text-sm font-extrabold text-slate-800">
            <Filter className="w-4 h-4 text-rose-600" />
            <span>Select Category:</span>
          </div>

          {/* Category Dropdown Menu */}
          <div className="relative flex-1 max-w-md">
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => dispatch(setSelectedCategory(e.target.value))}
                className="w-full appearance-none bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 font-bold text-sm py-3 px-4 pr-10 rounded-2xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none cursor-pointer transition-all shadow-xs"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="font-semibold py-2">
                    {cat === 'Gym Guyz' ? '🏋️ Gym Guyz (Priority Health)' : cat}
                  </option>
                ))}
              </select>

              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Active Category Indicator Badge */}
          {selectedCategory === 'Gym Guyz' ? (
            <div className="hidden sm:flex items-center space-x-1.5 bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-xl border border-emerald-300">
              <Dumbbell className="w-4 h-4 text-emerald-600" />
              <span>Gym Guyz Health Special</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center space-x-1.5 bg-rose-50 text-rose-700 text-xs font-black px-3 py-1.5 rounded-xl border border-rose-200">
              <span>{selectedCategory}</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
