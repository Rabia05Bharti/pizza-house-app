import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSuccessModalOpen, clearCurrentOrder } from '../redux/orderSlice';
import { CheckCircle2, ShieldCheck, Printer, UtensilsCrossed, X, Download, HardDrive, Zap } from 'lucide-react';
import { printThermalReceipt } from '../utils/thermalPrinter';

export default function PaymentSuccessModal() {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.order.isSuccessModalOpen);
  const confirmedOrder = useSelector((state) => state.order.confirmedOrder);

  if (!isOpen || !confirmedOrder) return null;

  const handleClose = () => {
    dispatch(setSuccessModalOpen(false));
    dispatch(clearCurrentOrder());
  };

  const handleDownloadReceipt = () => {
    const receiptText = `
========================================
           PIZZA HOUSE POS RECEIPT
          Contact: 7559752165
========================================
Order Number : #${confirmedOrder.orderNumber}
Date         : ${new Date(confirmedOrder.createdAt || Date.now()).toLocaleString()}
System ID    : ${localStorage.getItem('pizza_house_system_id') || 'System-1'}
----------------------------------------
CUSTOMER DETAILS:
Name     : ${confirmedOrder.customer?.name || 'Walk-in Customer'}
Phone    : ${confirmedOrder.customer?.phone || 'N/A'}
Table/Add: ${confirmedOrder.customer?.tableOrAddress || 'Counter'}
Type     : ${confirmedOrder.customer?.orderType || 'Dine-In'}
----------------------------------------
ORDERED ITEMS:
${confirmedOrder.items?.map(item => `- ${item.quantity}x ${item.name} ${item.selectedSize ? `(${item.selectedSize})` : ''} @ ₹${item.unitPrice} = ₹${item.totalItemPrice || (item.unitPrice * item.quantity)}`).join('\n')}
----------------------------------------
Payment Method : ${confirmedOrder.paymentDetails?.paymentMethod || confirmedOrder.paymentStatus || 'Cash / QR'}
Payment Status : ${confirmedOrder.paymentStatus || 'Confirmed'}
Transaction Ref: ${confirmedOrder.paymentDetails?.razorpayPaymentId || `PAY-${Date.now()}`}
GST & Taxes    : ₹0 (WYSWYP Included)
----------------------------------------
TOTAL PAID     : ₹${confirmedOrder.totalAmount}
========================================
      Thank you for ordering at Pizza House!
========================================
    `;

    const blob = new Blob([receiptText.trim()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt_${confirmedOrder.orderNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="print-receipt-wrapper" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto print:p-0 print:bg-white print:static">
      
      {/* Thermal Receipt Print Styles (Single 80mm Page Output) */}
      <style>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            height: auto !important;
            overflow: visible !important;
          }
          body > *:not(#print-receipt-wrapper) {
            display: none !important;
          }
          #print-receipt-wrapper {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 !important;
            padding: 8px !important;
            background: #fff !important;
            color: #000 !important;
            box-shadow: none !important;
            border: none !important;
          }
          #print-receipt-area {
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #fff !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div id="print-receipt-area" className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative text-slate-800 my-8">
        
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 no-print"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 no-print">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-black rounded-full border border-emerald-200 uppercase tracking-wide">
              {confirmedOrder.paymentStatus === 'Cash' ? 'Order Placed (Cash Payment)' : 'Payment Verified & Confirmed'}
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
              <span className="font-extrabold text-slate-900">{confirmedOrder.customer?.name || 'Walk-in Customer'}</span>
              <span className="text-slate-500 block text-[11px]">{confirmedOrder.customer?.phone || 'N/A'}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Location / Type</span>
              <span className="font-extrabold text-rose-600">{confirmedOrder.customer?.tableOrAddress || 'Counter'}</span>
              <span className="text-slate-500 block text-[11px]">{confirmedOrder.customer?.orderType || 'Dine-In'}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2">
            <span className="text-slate-400 text-[10px] uppercase font-extrabold block">Ordered Items</span>
            {confirmedOrder.items?.map((item, idx) => (
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

          {/* Transaction Ref */}
          <div className="pt-3 border-t border-slate-200 space-y-1.5 text-[11px]">
            <div className="flex justify-between text-slate-500">
              <span>Payment Method</span>
              <span className="font-mono text-slate-800 font-bold">
                {confirmedOrder.paymentDetails?.paymentMethod || confirmedOrder.paymentStatus || 'Cash / QR'}
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>GST & Tax Charges</span>
              <span className="font-bold text-emerald-600">₹0 (WYSWYP Included)</span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 pt-1">
              <span>Total Amount</span>
              <span className="text-rose-600 text-base">₹{confirmedOrder.totalAmount}</span>
            </div>
          </div>

        </div>

        {/* Buttons (Hidden during printing) */}
        <div className="mt-6 space-y-2.5 no-print">
          
          {/* Dedicated Champ / POS Thermal Print Button */}
          <button
            onClick={() => printThermalReceipt(confirmedOrder)}
            className="w-full flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-2xl font-black text-xs transition-all shadow-md shadow-slate-900/20"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Print Thermal Receipt (Champ POS)</span>
          </button>

          <button
            onClick={handleDownloadReceipt}
            className="w-full flex items-center justify-center space-x-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 py-3 rounded-2xl font-bold text-xs transition-all border border-emerald-200"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Save Text Receipt 💾</span>
          </button>

          <button
            onClick={handleClose}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-2xl font-extrabold text-xs shadow-md shadow-rose-600/20 transition-all"
          >
            Back to Customer Menu
          </button>
        </div>

      </div>
    </div>
  );
}
