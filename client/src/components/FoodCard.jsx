import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import SizeSelectorModal from './SizeSelectorModal';
import { Dumbbell, Plus, ShieldCheck, Tag } from 'lucide-react';

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
      <div className={`group bg-white rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 ${
        isGymSection 
          ? 'border-emerald-200 hover:border-emerald-400 hover:shadow-card-hover' 
          : 'border-slate-200/80 hover:border-rose-300 hover:shadow-card-hover'
      }`}>
        
        {/* Top Image Container */}
        <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
          <img
            src={item.image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80'}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Health Badge */}
          {isGymSection && (
            <div className="absolute top-3 left-3 bg-emerald-600/95 backdrop-blur-md text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-md flex items-center space-x-1">
              <Dumbbell className="w-3.5 h-3.5" />
              <span>Gym Guyz Special</span>
            </div>
          )}

          {/* Price Tag */}
          <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1 rounded-xl text-sm font-black shadow-md">
            {item.hasSizes ? `From ₹${displayPrice}` : `₹${displayPrice}`}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
              <span>{item.category}</span>
              {item.hasSizes && <span className="text-rose-600 font-bold">Sizes Available</span>}
            </div>
            
            <h3 className="text-base font-extrabold text-slate-900 leading-snug group-hover:text-rose-600 transition-colors">
              {item.name}
            </h3>

            <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed font-normal">
              {item.description || 'Prepared fresh with high quality ingredients.'}
            </p>
          </div>

          {/* Bottom Action Footer */}
          <div className="border-t border-slate-100 pt-3.5 flex items-center justify-between">
            <div className="flex items-center text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
              <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
              <span>WYSWYP Final</span>
            </div>

            <button
              onClick={handleAddClick}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 shadow-xs ${
                isGymSection
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{item.hasSizes ? 'Select Size' : 'ADD'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Modal for items with sizes */}
      <SizeSelectorModal
        item={item}
        isOpen={isSizeModalOpen}
        onClose={() => setIsSizeModalOpen(false)}
        onConfirm={handleModalConfirm}
      />
    </>
  );
}
