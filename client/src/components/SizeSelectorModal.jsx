import React, { useState } from 'react';
import { X, Plus, Check } from 'lucide-react';

export default function SizeSelectorModal({ item, isOpen, onClose, onConfirm }) {
  if (!isOpen || !item) return null;

  const [selectedSize, setSelectedSize] = useState(
    item.hasSizes && item.sizes && item.sizes.length > 0 ? item.sizes[0].size : 'Regular'
  );
  const [selectedToppings, setSelectedToppings] = useState([]);

  // Calculate dynamic price based on size and extra toppings
  const currentSizeObj = item.sizes ? item.sizes.find(s => s.size === selectedSize) : null;
  const basePrice = currentSizeObj ? currentSizeObj.price : (item.price || 0);

  const getToppingCostForSize = (size) => {
    if (size === 'Regular') return 30;
    if (size === 'Medium') return 50;
    if (size === 'Large') return 80;
    return 30;
  };

  const extraToppingUnitPrice = getToppingCostForSize(selectedSize);
  const toppingTotal = selectedToppings.length * extraToppingUnitPrice;
  const finalItemPrice = basePrice + toppingTotal;

  const toggleTopping = (toppingName) => {
    if (selectedToppings.includes(toppingName)) {
      setSelectedToppings(selectedToppings.filter(t => t !== toppingName));
    } else {
      setSelectedToppings([...selectedToppings, toppingName]);
    }
  };

  const handleConfirm = () => {
    onConfirm({
      ...item,
      selectedSize,
      price: finalItemPrice,
      extraToppings: selectedToppings
    });
    onClose();
  };

  const toppingList = ['Extra Cheese', 'Extra Paneer', 'Crispy Corn', 'Jalapenos & Olives'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 overflow-hidden relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Item Header */}
        <div className="flex items-center space-x-4 mb-5">
          <img
            src={item.image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80'}
            alt={item.name}
            className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
          />
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg leading-snug">{item.name}</h3>
            <p className="text-xs text-slate-500 font-medium">{item.category}</p>
          </div>
        </div>

        {/* Size Selection */}
        {item.hasSizes && item.sizes && (
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Pizza Size
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {item.sizes.map((s) => {
                const isSelected = selectedSize === s.size;
                return (
                  <button
                    key={s.size}
                    type="button"
                    onClick={() => setSelectedSize(s.size)}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-rose-50 border-rose-600 text-rose-700 ring-2 ring-rose-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xs font-bold">{s.size}</span>
                    <span className="text-sm font-black mt-1">₹{s.price}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Extra Toppings */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Add Extra Toppings
            </label>
            <span className="text-xs font-semibold text-rose-600">
              +₹{extraToppingUnitPrice} / topping
            </span>
          </div>

          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {toppingList.map((topping) => {
              const isChecked = selectedToppings.includes(topping);
              return (
                <button
                  key={topping}
                  type="button"
                  onClick={() => toggleTopping(topping)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    isChecked
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs">{topping}</span>
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                    isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                  }`}>
                    {isChecked && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Total & Action */}
        <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Final Price (WYSWYP)</span>
            <span className="text-2xl font-black text-slate-900">₹{finalItemPrice}</span>
          </div>

          <button
            onClick={handleConfirm}
            className="flex items-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-md shadow-rose-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add to Cart</span>
          </button>
        </div>

      </div>
    </div>
  );
}
