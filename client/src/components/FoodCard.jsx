import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import SizeSelectorModal from './SizeSelectorModal';
import { Dumbbell, Plus, ShieldCheck, Tag } from 'lucide-react';

const categoryFallbackImages = {
  'Gym Guyz': 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=80',
  'Momos & Rolls': 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=500&auto=format&fit=crop&q=80',
  'Pizza Single Topping': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80',
  'Pizza Veg Double Topping': 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&auto=format&fit=crop&q=80',
  'Kidz Pizza': 'https://images.unsplash.com/photo-1573821663912-569905455b1c?w=500&auto=format&fit=crop&q=80',
  'Pizza Veg-1': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=80',
  'Pizza Veg-2': 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=500&auto=format&fit=crop&q=80',
  'Pizza Veg-3': 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=500&auto=format&fit=crop&q=80',
  'Burgers': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
  'Sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80',
  'Pasta': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&auto=format&fit=crop&q=80',
  'Fries': 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=500&auto=format&fit=crop&q=80',
  'Wraps': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&auto=format&fit=crop&q=80',
  'Shakes': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=80',
  'Hot Dessert': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80',
  'Mocktails': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80',
  'Cold Desserts': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&auto=format&fit=crop&q=80',
  'Breads': 'https://images.unsplash.com/photo-1573140247614-681b4d452440?w=500&auto=format&fit=crop&q=80',
  'Beverages': 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=500&auto=format&fit=crop&q=80'
};

const defaultFallback = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80';

export default function FoodCard({ item }) {
  const dispatch = useDispatch();
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState(item.image || categoryFallbackImages[item.category] || defaultFallback);

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

  const handleImageError = () => {
    const categoryFallback = categoryFallbackImages[item.category] || defaultFallback;
    if (imgSrc !== categoryFallback) {
      setImgSrc(categoryFallback);
    } else if (imgSrc !== defaultFallback) {
      setImgSrc(defaultFallback);
    }
  };

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
            src={imgSrc}
            alt={item.name}
            onError={handleImageError}
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

        {/* Content Section */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-extrabold text-slate-900 text-base group-hover:text-rose-600 transition-colors line-clamp-1">
                {item.name}
              </h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase shrink-0">
                {item.category}
              </span>
            </div>

            <p className="text-xs text-slate-500 font-normal line-clamp-2 mt-1.5 leading-relaxed">
              {item.description}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>WYSWYP Price</span>
            </div>

            <button
              onClick={handleAddClick}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-all active:scale-95 ${
                isGymSection
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{item.hasSizes ? 'Select Size' : 'Add to Order'}</span>
            </button>
          </div>
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
