import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectCartItems,
  selectCartTotal,
  removeFromCart,
  updateQuantity,
  clearCart,
  toggleCartDrawer
} from '../redux/cartSlice';
import { setCheckoutOpen } from '../redux/orderSlice';
import { X, Trash2, Plus, Minus, ShieldCheck, ArrowRight, ShoppingBag } from 'lucide-react';

export default function CartDrawer() {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.cart.isCartOpen);
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);

  if (!isOpen) return null;

  const handleCheckoutClick = () => {
    dispatch(toggleCartDrawer(false));
    dispatch(setCheckoutOpen(true));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => dispatch(toggleCartDrawer(false))}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fadeIn"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Your Cart</h2>
                <p className="text-xs text-slate-500 font-medium">{cartItems.length} unique items</p>
              </div>
            </div>

            <button
              onClick={() => dispatch(toggleCartDrawer(false))}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
                <ShoppingBag className="w-16 h-16 mb-4 stroke-1 text-slate-300" />
                <p className="text-base font-bold text-slate-700">Your cart is empty</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Add some delicious pizzas, gym smoothies or sides to get started!
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
                  <span>Selected Items</span>
                  <button
                    onClick={() => dispatch(clearCart())}
                    className="text-rose-600 hover:text-rose-700 flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Cart</span>
                  </button>
                </div>

                {cartItems.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex items-center justify-between space-x-3"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{item.name}</h4>
                      
                      {/* Meta badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {item.selectedSize && (
                          <span className="px-2 py-0.5 text-[10px] font-extrabold bg-rose-100 text-rose-700 rounded-md">
                            Size: {item.selectedSize}
                          </span>
                        )}
                        {item.extraToppings && item.extraToppings.length > 0 && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-md">
                            +{item.extraToppings.join(', ')}
                          </span>
                        )}
                      </div>

                      <div className="text-sm font-black text-slate-900 mt-1.5">
                        ₹{item.unitPrice * item.quantity}
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center space-x-2 bg-white rounded-xl border border-slate-200 px-2 py-1 shadow-xs">
                      <button
                        onClick={() => dispatch(updateQuantity({ cartItemId: item.cartItemId, quantity: item.quantity - 1 }))}
                        className="p-1 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => dispatch(updateQuantity({ cartItemId: item.cartItemId, quantity: item.quantity + 1 }))}
                        className="p-1 text-slate-500 hover:text-emerald-600 rounded-lg hover:bg-slate-100"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* WYSWYP Footer Calculation & Checkout */}
          {cartItems.length > 0 && (
            <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
              
              {/* WYSWYP Guarantee Badge */}
              <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200 flex items-start space-x-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-extrabold text-emerald-900">What You See Is What You Pay Model</p>
                  <p className="text-emerald-700 text-[11px] mt-0.5">
                    No extra GST, packaging fees, or hidden taxes. The total price below is exact.
                  </p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">₹{cartTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & GST (0%)</span>
                  <span className="font-bold text-emerald-600">₹0 (Included)</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-base font-black text-slate-900">
                  <span>Final Payable Amount</span>
                  <span className="text-rose-600">₹{cartTotal}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckoutClick}
                className="w-full flex items-center justify-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white py-3.5 rounded-2xl font-extrabold text-sm shadow-lg shadow-rose-600/25 transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
