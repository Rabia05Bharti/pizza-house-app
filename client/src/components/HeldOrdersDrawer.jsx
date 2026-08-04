import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectHeldOrders, toggleHeldOrdersDrawer, resumeHeldOrder, deleteHeldOrder } from '../redux/cartSlice';
import { X, Play, Trash2, PauseCircle, Clock, Utensils } from 'lucide-react';

export default function HeldOrdersDrawer() {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.cart.isHeldOrdersOpen);
  const heldOrders = useSelector(selectHeldOrders);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => dispatch(toggleHeldOrdersDrawer(false))}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fadeIn"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-200">
                <PauseCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Held Orders Queue</h2>
                <p className="text-xs text-slate-500 font-medium">{heldOrders.length} orders currently on hold</p>
              </div>
            </div>

            <button
              onClick={() => dispatch(toggleHeldOrdersDrawer(false))}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Held Orders List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {heldOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
                <PauseCircle className="w-16 h-16 mb-4 stroke-1 text-slate-300" />
                <p className="text-base font-bold text-slate-700">No orders on hold</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  When taking an order, click "Hold Order ⏸️" in checkout to save it for later and serve the next customer.
                </p>
              </div>
            ) : (
              heldOrders.map((order) => (
                <div
                  key={order.holdId}
                  className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200/90 space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                    <div>
                      <span className="px-2 py-0.5 bg-amber-200/80 text-amber-900 text-[10px] font-black rounded-md">
                        {order.holdId}
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-900 mt-1">
                        {order.customer?.name || 'Guest'} ({order.customer?.tableOrAddress})
                      </h4>
                    </div>
                    <span className="text-[11px] font-bold text-rose-600 bg-white px-2 py-1 rounded-lg border border-slate-200">
                      ₹{order.totalAmount}
                    </span>
                  </div>

                  {/* Items summary */}
                  <div className="space-y-1 text-xs text-slate-700">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>
                          <strong className="font-bold">{item.quantity}x</strong> {item.name}
                          {item.selectedSize && <span className="text-slate-500"> ({item.selectedSize})</span>}
                        </span>
                        <span className="font-semibold text-slate-900">₹{item.unitPrice * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Held Timestamp */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{new Date(order.heldAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => dispatch(deleteHeldOrder(order.holdId))}
                        className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                        title="Discard held order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => dispatch(resumeHeldOrder(order.holdId))}
                        className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow-xs transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Resume & Edit</span>
                      </button>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500 font-medium">
            Resuming an order restores its items to your active cart & checkout.
          </div>

        </div>
      </div>
    </div>
  );
}
