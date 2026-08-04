import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCartItems, selectCartTotal, clearCart } from '../redux/cartSlice';
import { setCheckoutOpen, setConfirmedOrder, setSuccessModalOpen, submitOrder } from '../redux/orderSlice';
import { createRazorpayOrderApi, verifyPaymentApi } from '../services/api';
import { X, CreditCard, ShieldCheck, Utensils, ShoppingBag, Truck, Lock, QrCode, Copy, Check, ExternalLink } from 'lucide-react';

export default function CheckoutModal() {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.order.isCheckoutOpen);
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    tableOrAddress: 'Table 4',
    orderType: 'Dine-In'
  });

  const [paymentMethod, setPaymentMethod] = useState('UPI_QR'); // 'UPI_QR' | 'RAZORPAY'
  const [utrNumber, setUtrNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const upiId = 'dynamohacker09@oksbi';
  const upiName = 'Sarpanchz';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=${upiName}&am=${cartTotal}&cu=INR`)}`;
  const upiDeepLink = `upi://pay?pa=${upiId}&pn=${upiName}&am=${cartTotal}&cu=INR`;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePayAndOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name || !formData.phone || !formData.tableOrAddress) {
      setErrorMsg('Please fill in your Name, Phone Number, and Table/Address.');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create Order Payload
      const orderPayload = {
        customer: formData,
        items: cartItems.map(item => ({
          menuItemId: item.menuItemId,
          name: item.name,
          category: item.category,
          selectedSize: item.selectedSize,
          extraToppings: item.extraToppings,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          totalItemPrice: item.unitPrice * item.quantity
        })),
        totalAmount: cartTotal
      };

      if (paymentMethod === 'UPI_QR') {
        // Direct UPI QR Payment Submission
        const orderResult = await dispatch(submitOrder(orderPayload)).unwrap();
        
        dispatch(clearCart());
        dispatch(setCheckoutOpen(false));
        dispatch(setConfirmedOrder({
          ...orderResult,
          paymentStatus: 'Paid',
          paymentDetails: {
            paymentMethod: `UPI QR (${upiId})`,
            razorpayPaymentId: utrNumber ? `UTR-${utrNumber}` : `UPI-${Date.now()}`
          }
        }));
        dispatch(setSuccessModalOpen(true));
        setIsProcessing(false);
        return;
      }

      // 2. Razorpay Flow
      const orderResult = await dispatch(submitOrder(orderPayload)).unwrap();
      const dbOrderId = orderResult._id;

      const razorpayData = await createRazorpayOrderApi({
        amount: cartTotal,
        orderId: dbOrderId
      });

      const options = {
        key: razorpayData.key,
        amount: razorpayData.order.amount,
        currency: 'INR',
        name: 'Pizza House',
        description: `Order #${orderResult.orderNumber} Payment`,
        image: 'https://img.icons8.com/emoji/96/pizza-emoji.png',
        order_id: razorpayData.order.id,
        prefill: {
          name: formData.name,
          contact: formData.phone
        },
        theme: {
          color: '#E11D48'
        },
        handler: async function (response) {
          try {
            await verifyPaymentApi({
              razorpay_order_id: response.razorpay_order_id || razorpayData.order.id,
              razorpay_payment_id: response.razorpay_payment_id || `pay_sim_${Date.now()}`,
              razorpay_signature: response.razorpay_signature || 'simulated_signature',
              orderId: dbOrderId
            });

            dispatch(clearCart());
            dispatch(setCheckoutOpen(false));
            dispatch(setConfirmedOrder({
              ...orderResult,
              paymentStatus: 'Paid',
              paymentDetails: {
                paymentMethod: 'Razorpay Gateway',
                razorpayPaymentId: response.razorpay_payment_id || `pay_sim_${Date.now()}`
              }
            }));
            dispatch(setSuccessModalOpen(true));
          } catch (err) {
            setErrorMsg('Payment verification failed. Please contact counter.');
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      if (window.Razorpay && !razorpayData.isMock) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        setTimeout(() => {
          options.handler({
            razorpay_order_id: razorpayData.order.id,
            razorpay_payment_id: `pay_test_${Date.now()}`,
            razorpay_signature: 'sandbox_test_sig'
          });
        }, 1200);
      }

    } catch (err) {
      setErrorMsg(err || 'Failed to process checkout. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      {/* Modal Dialog Card with Max Height & Internal Scroll */}
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 relative max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Fixed Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Checkout</h3>
              <p className="text-xs text-slate-500 font-medium">Complete details & scan QR to pay</p>
            </div>
          </div>

          <button
            onClick={() => dispatch(setCheckoutOpen(false))}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-2xl font-semibold">
              {errorMsg}
            </div>
          )}

          <form id="checkout-form" onSubmit={handlePayAndOrder} className="space-y-4">
            
            {/* Order Type Toggle */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Order Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { type: 'Dine-In', icon: Utensils },
                  { type: 'Takeaway', icon: ShoppingBag },
                  { type: 'Delivery', icon: Truck }
                ].map(({ type, icon: Icon }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, orderType: type })}
                    className={`py-2 px-2.5 rounded-xl border flex items-center justify-center space-x-1.5 text-xs font-bold transition-all ${
                      formData.orderType === type
                        ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-500/20'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{type}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Name & Phone Input Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="10-digit phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none"
                />
              </div>
            </div>

            {/* Table / Delivery Address */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                {formData.orderType === 'Dine-In' ? 'Table Number *' : 'Delivery Address / Pickup Note *'}
              </label>
              <input
                type="text"
                name="tableOrAddress"
                required
                placeholder={formData.orderType === 'Dine-In' ? 'e.g. Table 4' : 'Street address / landmarks'}
                value={formData.tableOrAddress}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none"
              />
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI_QR')}
                  className={`p-2.5 rounded-xl border flex items-center space-x-2 text-xs font-bold transition-all ${
                    paymentMethod === 'UPI_QR'
                      ? 'bg-rose-50 border-rose-600 text-rose-700 ring-2 ring-rose-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-rose-600 shrink-0" />
                  <div className="text-left leading-tight min-w-0">
                    <span className="block font-black truncate">Scan UPI QR</span>
                    <span className="text-[10px] text-slate-500 font-normal">GPay / PhonePe / Paytm</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('RAZORPAY')}
                  className={`p-2.5 rounded-xl border flex items-center space-x-2 text-xs font-bold transition-all ${
                    paymentMethod === 'RAZORPAY'
                      ? 'bg-rose-50 border-rose-600 text-rose-700 ring-2 ring-rose-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-rose-600 shrink-0" />
                  <div className="text-left leading-tight min-w-0">
                    <span className="block font-black truncate">Razorpay</span>
                    <span className="text-[10px] text-slate-500 font-normal">Cards / Netbanking</span>
                  </div>
                </button>
              </div>
            </div>

            {/* UPI QR Display Card (Optimized Responsive Layout) */}
            {paymentMethod === 'UPI_QR' && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center space-y-2.5">
                
                {/* Merchant Name */}
                <div className="flex items-center justify-center space-x-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 w-fit mx-auto shadow-2xs">
                  <span className="text-base">🦁</span>
                  <span className="font-extrabold text-slate-900 text-xs">{upiName}</span>
                </div>

                {/* Scannable QR Code Image */}
                <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs inline-block mx-auto">
                  <img
                    src={qrCodeUrl}
                    alt="Sarpanchz UPI QR Code"
                    className="w-44 h-44 sm:w-48 sm:h-48 mx-auto object-contain rounded-xl"
                  />
                  <p className="text-[11px] font-bold text-slate-600 mt-1.5">Scan to pay with any UPI app</p>
                </div>

                {/* Copy UPI ID Bar */}
                <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 max-w-xs mx-auto text-xs shadow-2xs">
                  <span className="font-mono text-slate-800 font-bold text-[11px] truncate">UPI ID: {upiId}</span>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="flex items-center space-x-1 text-rose-600 font-bold hover:text-rose-700 ml-2 shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Open UPI App Deep Link for Mobile */}
                <a
                  href={upiDeepLink}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline pt-0.5"
                >
                  <span>Open GPay / PhonePe App directly</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {/* Optional UTR Input */}
                <div className="pt-1">
                  <input
                    type="text"
                    placeholder="Enter 12-digit UTR / Ref No. (Optional)"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-rose-400"
                  />
                </div>

              </div>
            )}

            {/* WYSWYP Summary Callout */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-1.5 text-xs">
              <div className="flex items-center justify-between font-semibold text-slate-600">
                <span>Items Total ({cartItems.length})</span>
                <span className="font-bold text-slate-900">₹{cartTotal}</span>
              </div>
              <div className="flex items-center justify-between font-semibold text-emerald-600">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>GST & Taxes</span>
                </span>
                <span className="font-bold">₹0 (Included)</span>
              </div>
              <div className="flex items-center justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-200">
                <span>Total Payable</span>
                <span className="text-rose-600 text-base">₹{cartTotal}</span>
              </div>
            </div>

          </form>
        </div>

        {/* Modal Fixed Footer Action */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 shrink-0">
          <button
            type="submit"
            form="checkout-form"
            disabled={isProcessing}
            className="w-full flex items-center justify-center space-x-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white py-3.5 rounded-2xl font-black text-sm shadow-md shadow-rose-600/25 transition-all"
          >
            <Lock className="w-4 h-4" />
            <span>
              {isProcessing
                ? 'Processing Order...'
                : paymentMethod === 'UPI_QR'
                ? `Paid ₹${cartTotal} via QR? Submit Order`
                : `Pay ₹${cartTotal} via Razorpay`}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}
