import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAdminOrders, updateOrderStatusThunk } from '../redux/orderSlice';
import { RefreshCw, CheckCircle, Clock, ChefHat, PackageCheck, AlertCircle, Phone, MapPin, IndianRupee, Download, HardDrive, Settings, Printer, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.order.adminOrders);
  const [filterStatus, setFilterStatus] = useState('All');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [systemId, setSystemId] = useState(localStorage.getItem('pizza_house_system_id') || 'System-1');

  useEffect(() => {
    dispatch(fetchAdminOrders());
    // Auto-poll orders every 8 seconds for live kitchen updates
    const interval = setInterval(() => {
      dispatch(fetchAdminOrders());
    }, 8000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleSystemIdChange = (e) => {
    const val = e.target.value;
    setSystemId(val);
    localStorage.setItem('pizza_house_system_id', val);
  };

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

  // Delete single order from device storage & state
  const handleDeleteOrder = (orderToDelete) => {
    if (window.confirm(`Delete Order #${orderToDelete.orderNumber}?`)) {
      try {
        const currentSystemId = localStorage.getItem('pizza_house_system_id') || 'System-1';
        const systemOrders = JSON.parse(localStorage.getItem(`orders_${currentSystemId}`) || '[]');
        const updatedOrders = systemOrders.filter(o => o.orderNumber !== orderToDelete.orderNumber && o._id !== orderToDelete._id);
        localStorage.setItem(`orders_${currentSystemId}`, JSON.stringify(updatedOrders));
      } catch (e) {}
      dispatch(fetchAdminOrders());
    }
  };

  // Clear all local test orders from this device & reset to fresh brand new state
  const handleClearAllOrders = () => {
    if (window.confirm('Reset POS & clear all test orders to start fresh?')) {
      try {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('orders_')) {
            localStorage.removeItem(key);
          }
        });
        localStorage.setItem(`orders_${systemId}`, JSON.stringify([]));
      } catch (e) {}
      dispatch(fetchAdminOrders());
    }
  };

  // Download System Sales & Order Data as JSON
  const handleDownloadSystemDataJSON = () => {
    const systemOrders = JSON.parse(localStorage.getItem(`orders_${systemId}`) || '[]');
    const exportData = {
      systemId,
      exportedAt: new Date().toISOString(),
      totalLocalSavedOrders: systemOrders.length,
      allLiveOrdersCount: orders.length,
      localSystemOrders: systemOrders,
      allOrders: orders
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PizzaHouse_SalesData_${systemId}_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download System Sales Data as CSV
  const handleDownloadSystemDataCSV = () => {
    const systemOrders = JSON.parse(localStorage.getItem(`orders_${systemId}`) || '[]');
    const dataToExport = systemOrders.length > 0 ? systemOrders : orders;

    let csvContent = "OrderNumber,Date,CustomerName,Phone,TableOrAddress,OrderType,PaymentStatus,PaymentMethod,TotalAmount\n";
    dataToExport.forEach(o => {
      csvContent += `"${o.orderNumber}","${new Date(o.createdAt || o.savedAt || Date.now()).toLocaleString()}","${o.customer?.name || ''}","${o.customer?.phone || ''}","${o.customer?.tableOrAddress || ''}","${o.customer?.orderType || ''}","${o.paymentStatus || ''}","${o.paymentDetails?.paymentMethod || ''}",${o.totalAmount}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PizzaHouse_SalesReport_${systemId}_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Metrics
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'Paid' || o.paymentStatus === 'Cash')
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Kitchen POS</h1>
            <span className="bg-rose-100 text-rose-700 text-xs font-black px-2.5 py-0.5 rounded-md border border-rose-200">
              Live Order Stream
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time Petpooja kitchen display system & sales manager • Phone: 7559752165
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* System ID Isolated Configuration */}
          <div className="flex items-center space-x-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
            <HardDrive className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-600">Device ID:</span>
            <input
              type="text"
              value={systemId}
              onChange={handleSystemIdChange}
              placeholder="e.g. System-1"
              className="w-24 text-xs font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 outline-none"
              title="Change this system ID to keep isolated local data per device/counter"
            />
          </div>

          {/* Download System Data JSON */}
          <button
            onClick={handleDownloadSystemDataJSON}
            className="flex items-center space-x-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-2 rounded-xl text-xs font-bold transition-all"
            title="Download JSON data file for this system"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Download Data (.JSON)</span>
          </button>

          {/* Download CSV Report */}
          <button
            onClick={handleDownloadSystemDataCSV}
            className="flex items-center space-x-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 px-3 py-2 rounded-xl text-xs font-bold transition-all"
            title="Export CSV Sales Spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-sky-600" />
            <span>Export CSV</span>
          </button>

          {/* Clear Test Orders */}
          <button
            onClick={handleClearAllOrders}
            className="flex items-center space-x-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-2 rounded-xl text-xs font-bold transition-all"
            title="Clear test orders stored on this device"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Clear Queue</span>
          </button>

          <button
            onClick={handleManualRefresh}
            className="flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold transition-all shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-rose-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Orders</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{totalOrders}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <PackageCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">Active Kitchen Queue</span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">{pendingCount}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ChefHat className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">Ready to Serve</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">{readyCount}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block">Total Sales</span>
            <span className="text-2xl font-black text-rose-600 mt-1 block">₹{totalRevenue}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-4 mb-6 overflow-x-auto">
        {['All', 'Received', 'Preparing', 'Ready', 'Delivered', 'Cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              filterStatus === status
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {status} {status === 'All' ? `(${totalOrders})` : ''}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400">
          <ChefHat className="w-12 h-12 mx-auto mb-3 stroke-1 text-slate-300" />
          <p className="text-base font-bold text-slate-700">No orders in this queue</p>
          <p className="text-xs text-slate-400 mt-1">Orders placed by customers will appear here automatically.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <div
              key={order._id || order.orderNumber}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group"
            >
              
              {/* Card Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {order.customer?.orderType || 'Dine-In'}
                    </span>
                    <button
                      onClick={() => handleDeleteOrder(order)}
                      className="text-slate-300 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-all"
                      title="Delete this order"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mt-1">Order #{order.orderNumber}</h3>
                  <span className="text-[11px] text-slate-400 font-medium block">
                    {new Date(order.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Status Switcher Select */}
                <div className="text-right">
                  <select
                    value={order.orderStatus}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className={`text-xs font-black px-3 py-1.5 rounded-xl border outline-none cursor-pointer ${getStatusBadgeClass(order.orderStatus)}`}
                  >
                    <option value="Received">Received 🛎️</option>
                    <option value="Preparing">Preparing 👨‍🍳</option>
                    <option value="Ready">Ready 🔔</option>
                    <option value="Delivered">Delivered ✅</option>
                    <option value="Cancelled">Cancelled ❌</option>
                  </select>
                </div>
              </div>

              {/* Customer Details */}
              <div className="bg-slate-50 rounded-2xl p-3.5 space-y-1 text-xs">
                <div className="flex items-center justify-between font-extrabold text-slate-900">
                  <span>{order.customer?.name}</span>
                  <span className="text-rose-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{order.customer?.tableOrAddress}</span>
                  </span>
                </div>
                <div className="text-slate-500 font-medium flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>{order.customer?.phone}</span>
                </div>
              </div>

              {/* Order Items List */}
              <div className="space-y-2 flex-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Items ({order.items?.length || 0})
                </span>
                <div className="space-y-1.5 text-xs text-slate-800 max-h-36 overflow-y-auto pr-1">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50/60 p-2 rounded-xl border border-slate-100">
                      <span>
                        <strong className="font-extrabold text-slate-900">{item.quantity}x</strong> {item.name}
                        {item.selectedSize && <span className="text-slate-500 text-[11px]"> ({item.selectedSize})</span>}
                      </span>
                      <span className="font-bold text-slate-900">₹{item.totalItemPrice || (item.unitPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Payment Status</span>
                  <span className={`text-xs font-black ${order.paymentStatus === 'Paid' || order.paymentStatus === 'Cash' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {order.paymentStatus === 'Cash' ? 'Cash / Counter Pay' : order.paymentStatus || 'Paid'}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Total WYSWYP</span>
                  <span className="text-lg font-black text-rose-600">₹{order.totalAmount}</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
