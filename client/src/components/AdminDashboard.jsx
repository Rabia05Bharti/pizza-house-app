import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAdminOrders, updateOrderStatusThunk } from '../redux/orderSlice';
import { RefreshCw, CheckCircle, Clock, ChefHat, PackageCheck, AlertCircle, Phone, MapPin, IndianRupee } from 'lucide-react';

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.order.adminOrders);
  const [filterStatus, setFilterStatus] = useState('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchAdminOrders());
    // Auto-poll orders every 8 seconds for live kitchen updates
    const interval = setInterval(() => {
      dispatch(fetchAdminOrders());
    }, 8000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await dispatch(fetchAdminOrders());
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleStatusChange = (orderId, newStatus) => {
    dispatch(updateOrderStatusThunk({
      id: orderId,
      statusData: { orderStatus: newStatus }
    }));
  };

  // Metrics
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'Paid')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingCount = orders.filter(o => o.orderStatus === 'Received' || o.orderStatus === 'Preparing').length;
  const readyCount = orders.filter(o => o.orderStatus === 'Ready').length;

  const filteredOrders = filterStatus === 'All'
    ? orders
    : orders.filter(o => o.orderStatus === filterStatus);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Received': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Preparing': return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'Ready': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Delivered': return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'Cancelled': return 'bg-rose-100 text-rose-800 border-rose-300';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Admin Orders</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Live order tracking & kitchen workflow manager • Call: <strong className="text-rose-600 font-bold">7559752165</strong></p>
        </div>

        <button
          onClick={handleManualRefresh}
          className="flex items-center space-x-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 px-4 py-2.5 rounded-xl font-bold text-sm shadow-xs transition-all w-fit"
        >
          <RefreshCw className={`w-4 h-4 text-rose-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Live Queue</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Sales</span>
            <h4 className="text-2xl font-black text-slate-900 mt-1">₹{totalRevenue}</h4>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Queue</span>
            <h4 className="text-2xl font-black text-amber-600 mt-1">{pendingCount} orders</h4>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ChefHat className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ready for Pickup</span>
            <h4 className="text-2xl font-black text-emerald-600 mt-1">{readyCount} orders</h4>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <PackageCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
            <h4 className="text-2xl font-black text-slate-900 mt-1">{totalOrders}</h4>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-4 mb-6">
        {['All', 'Received', 'Preparing', 'Ready', 'Delivered', 'Cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              filterStatus === status
                ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Order Cards Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 stroke-1 text-slate-300" />
          <p className="text-base font-bold text-slate-700">No orders found</p>
          <p className="text-xs text-slate-400 mt-1">Orders placed by customers will appear here live.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
            >
              
              <div>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg">Order #{order.orderNumber}</h3>
                    <span className="text-xs font-semibold text-slate-400">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <span className={`px-3 py-1 text-xs font-extrabold rounded-full border ${getStatusBadgeClass(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </div>

                {/* Customer Details */}
                <div className="space-y-1.5 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
                  <div className="flex items-center justify-between text-slate-900 font-bold">
                    <span>{order.customer?.name}</span>
                    <span className="text-rose-600 font-extrabold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                      {order.customer?.tableOrAddress}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-500">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{order.customer?.phone}</span>
                    <span className="text-slate-300">•</span>
                    <span>{order.customer?.orderType}</span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2 mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ordered Items</span>
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs text-slate-800">
                      <div className="font-medium">
                        <span className="font-bold">{item.quantity}x</span> {item.name}
                        {item.selectedSize && <span className="text-slate-500 font-normal"> ({item.selectedSize})</span>}
                      </div>
                      <span className="font-bold text-slate-900">₹{item.totalItemPrice || (item.unitPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="border-t border-slate-100 pt-4 mt-2">
                
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-semibold text-slate-500">Payment Status</span>
                  <span className={`px-2.5 py-0.5 font-bold rounded-md ${
                    order.paymentStatus === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {order.paymentStatus} (Razorpay)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {order.orderStatus === 'Received' && (
                    <button
                      onClick={() => handleStatusChange(order._id, 'Preparing')}
                      className="col-span-2 bg-sky-600 hover:bg-sky-700 text-white py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      Mark Preparing
                    </button>
                  )}

                  {order.orderStatus === 'Preparing' && (
                    <button
                      onClick={() => handleStatusChange(order._id, 'Ready')}
                      className="col-span-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      Mark Order Ready
                    </button>
                  )}

                  {order.orderStatus === 'Ready' && (
                    <button
                      onClick={() => handleStatusChange(order._id, 'Delivered')}
                      className="col-span-2 bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      Mark Delivered
                    </button>
                  )}

                  {order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && (
                    <button
                      onClick={() => handleStatusChange(order._id, 'Cancelled')}
                      className="col-span-2 text-rose-600 hover:bg-rose-50 border border-rose-200 py-1.5 rounded-xl text-xs font-semibold transition-all mt-1"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
