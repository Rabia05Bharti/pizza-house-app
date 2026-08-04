import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSuccessModalOpen, clearCurrentOrder } from '../redux/orderSlice';
import { CheckCircle2, ShieldCheck, Printer, UtensilsCrossed, X } from 'lucide-react';

export default function PaymentSuccessModal() {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.order.isSuccessModalOpen);
  const confirmedOrder = useSelector((state) => state.order.confirmedOrder);

  if (!isOpen || !confirmedOrder) return null;

  const handleClose = () => {
    dispatch(setSuccessModalOpen(false));
    dispatch(clearCurrentOrder());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative text-slate-800 my-8">
        
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-black rounded-full border border-emerald-200 uppercase tracking-wide">
              Payment Verified & Order Confirmed
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-2">Order #{confirmedOrder.orderNumber}</h3>
            <p className="text-xs text-slate-500 font-medium">Sent to kitchen for live preparation</p>
          </div>
        </div>

        {/* Petpooja Receipt Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4 text-xs font-medium">
          
          <div className="flex justify-between border-b border-slate-200 pb-3">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Customer</span>
              <span className="font-extrabold text-slate-900">{confirmedOrder.customer.name}</span>
              <span className="text-slate-500 block text-[11px]">{confirmedOrder.customer.phone}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Location / Type</span>
              <span className="font-extrabold text-rose-600">{confirmedOrder.customer.tableOrAddress}</span>
              <span className="text-slate-500 block text-[11px]">{confirmedOrder.customer.orderType}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2">
            <span className="text-slate-400 text-[10px] uppercase font-extrabold block">Ordered Items</span>
            {confirmedOrder.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-slate-800">
                <div>
                  <span className="font-bold">{item.name}</span>
                  {item.selectedSize && <span className="text-slate-500 text-[11px]"> ({item.selectedSize})</span>}
                  <span className="text-slate-400 text-[11px] block">Qty: {item.quantity} x ₹{item.unitPrice}</span>
                </div>
                <span className="font-black text-slate-900">₹{item.totalItemPrice || (item.unitPrice * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Razorpay Transaction ID */}
          <div className="pt-3 border-t border-slate-200 space-y-1.5 text-[11px]">
            <div className="flex justify-between text-slate-500">
              <span>Razorpay Txn ID</span>
              <span className="font-mono text-slate-800 font-bold">
                {confirmedOrder.paymentDetails?.razorpayPaymentId || `pay_rzp_${Date.now()}`}
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>GST & Tax Charges</span>
              <span className="font-bold text-emerald-600">₹0 (WYSWYP Included)</span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 pt-1">
              <span>Total Paid</span>
              <span className="text-rose-600 text-base">₹{confirmedOrder.totalAmount}</span>
            </div>
          </div>

        </div>

        {/* Buttons */}
        <div className="mt-6 flex space-x-3">
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 rounded-2xl font-bold text-xs transition-all border border-slate-200"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={handleClose}
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-2xl font-extrabold text-xs shadow-md shadow-rose-600/20 transition-all"
          >
            Back to Menu
          </button>
        </div>

      </div>
    </div>
  );
}
