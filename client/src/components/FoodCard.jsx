import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import SizeSelectorModal from './SizeSelectorModal';
import { Dumbbell, Plus, ShieldCheck, Tag, Sparkles } from 'lucide-react';

export default function FoodCard({ item }) {
  const dispatch = useDispatch();
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);

  const isGymSection = item.category === 'Gym Guyz' || item.isHealthFocused;

  const handleAddClick = () => {
    if (item.hasSizes) {
      setIsSizeModalOpen(true);
    } else {
      dispatch(addToCart({
        ...item,
        selectedSize: '',
        extraToppings: []
      }));
    }
  };

  const handleModalConfirm = (configuredItem) => {
    dispatch(addToCart(configuredItem));
  };

  // Get lowest price for display
  const displayPrice = item.hasSizes && item.sizes && item.sizes.length > 0
    ? item.sizes[0].price
    : item.price;

  return (
    <>
      <div className={`group bg-white rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 hover:shadow-card-hover ${
        isGymSection 
          ? 'border-emerald-200 hover:border-emerald-400 bg-gradient-to-b from-emerald-50/30 to-white' 
          : 'border-slate-200/80 hover:border-rose-300'
      }`}>
        
        {/* Card Header & Badges */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider inline-block ${
                isGymSection
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
                {item.category}
              </span>
              
              {isGymSection && (
                <span className="ml-1.5 text-[10px] font-black px-2.5 py-1 rounded-lg bg-emerald-600 text-white uppercase inline-flex items-center gap-1">
                  <Dumbbell className="w-3 h-3" />
                  <span>High Protein</span>
                </span>
              )}
            </div>

            <div className="text-right">
              <span className="text-xl font-black text-slate-900 block leading-none">
                ₹{displayPrice}
              </span>
              {item.hasSizes && (
                <span className="text-[10px] text-slate-400 font-bold uppercase">Starting At</span>
              )}
            </div>
          </div>

          <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-rose-600 transition-colors leading-tight">
            {item.name}
          </h3>

          <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-3">
            {item.description || 'Freshly prepared at Pizza House using authentic ingredients.'}
          </p>
        </div>

        {/* Footer Action Bar */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>WYSWYP Tax Incl.</span>
          </div>

          <button
            onClick={handleAddClick}
            className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl font-black text-xs shadow-sm transition-all active:scale-95 ${
              isGymSection
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{item.hasSizes ? 'Select Size' : 'Add to Order'}</span>
          </button>
        </div>

      </div>

      {/* Size & Options Modal */}
      {item.hasSizes && (
        <SizeSelectorModal
          item={item}
          isOpen={isSizeModalOpen}
          onClose={() => setIsSizeModalOpen(false)}
          onConfirm={handleModalConfirm}
        />
      )}
    </>
  );
}
