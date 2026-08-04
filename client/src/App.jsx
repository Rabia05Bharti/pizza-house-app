import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loadMenuData, loadCategoriesData } from './redux/menuSlice';
import Header from './components/Header';
import CategoryBar from './components/CategoryBar';
import FoodCard from './components/FoodCard';
import CartDrawer from './components/CartDrawer';
import HeldOrdersDrawer from './components/HeldOrdersDrawer';
import CheckoutModal from './components/CheckoutModal';
import PaymentSuccessModal from './components/PaymentSuccessModal';
import AdminDashboard from './components/AdminDashboard';
import { Dumbbell, ShieldCheck, Sparkles, Utensils, Phone } from 'lucide-react';

export default function App() {
  const dispatch = useDispatch();
  const [currentView, setCurrentView] = useState('menu'); // 'menu' | 'admin'

  const { items: allMenuItems, selectedCategory, searchQuery, loading, error } = useSelector((state) => state.menu);

  useEffect(() => {
    dispatch(loadCategoriesData());
    dispatch(loadMenuData({ category: 'All', search: '' }));
  }, [dispatch]);

  // Instantaneous client-side filtering (0ms latency!)
  const menuItems = useMemo(() => {
    if (!Array.isArray(allMenuItems)) return [];
    return allMenuItems.filter(item => {
      if (!item) return false;
      const matchCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchSearch = !searchQuery || 
        (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [allMenuItems, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Header */}
      <Header currentView={currentView} setCurrentView={setCurrentView} />

      {currentView === 'menu' ? (
        <main className="flex-1 pb-16">
          
          {/* Category Bar Navigation */}
          <CategoryBar />

          {/* Hero Banner / Highlight Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-rose-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
              
              <div className="space-y-3 z-10 max-w-xl text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <div className="flex items-center space-x-1 text-xs font-extrabold text-emerald-400 uppercase tracking-widest bg-slate-800/80 px-3 py-1 rounded-full border border-emerald-500/30">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>WYSWYP Pricing Standard</span>
                  </div>
                  <a href="tel:7559752165" className="flex items-center space-x-1 text-xs font-extrabold text-rose-300 bg-rose-950/80 px-3 py-1 rounded-full border border-rose-500/40 hover:underline">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call: 7559752165</span>
                  </a>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                  Hot & Fresh Pizzas, <br />
                  <span className="text-emerald-400">Gym Guyz</span> High-Protein Smoothies!
                </h2>
                <p className="text-sm text-slate-300 font-medium">
                  What you see is what you pay. Order online or call us at <strong className="text-rose-400">7559752165</strong>.
                </p>
              </div>

              {/* Gym & Quality Callout Cards */}
              <div className="flex flex-wrap sm:flex-nowrap gap-3 z-10">
                <div className="bg-emerald-950/60 backdrop-blur-md border border-emerald-500/40 p-4 rounded-2xl flex items-center space-x-3 text-white">
                  <Dumbbell className="w-8 h-8 text-emerald-400" />
                  <div>
                    <span className="text-xs font-bold text-emerald-300 block uppercase">Gym Guyz</span>
                    <span className="text-sm font-extrabold">Smoothies & Sandwiches</span>
                  </div>
                </div>

                <div className="bg-rose-950/60 backdrop-blur-md border border-rose-500/40 p-4 rounded-2xl flex items-center space-x-3 text-white">
                  <Sparkles className="w-8 h-8 text-rose-400" />
                  <div>
                    <span className="text-xs font-bold text-rose-300 block uppercase">Razorpay</span>
                    <span className="text-sm font-extrabold">Instant Secure Pay</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Food Grid Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>{selectedCategory === 'All' ? 'Full Pizza House Menu' : selectedCategory}</span>
                  {selectedCategory === 'Gym Guyz' && (
                    <span className="text-xs font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-300">
                      Priority Health Section
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Showing {menuItems.length} freshly prepared items
                </p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div key={n} className="bg-white rounded-3xl p-4 border border-slate-200 animate-pulse h-80 flex flex-col justify-between">
                    <div className="bg-slate-200 h-40 rounded-2xl w-full" />
                    <div className="space-y-2 mt-4">
                      <div className="bg-slate-200 h-5 rounded-md w-3/4" />
                      <div className="bg-slate-200 h-4 rounded-md w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-3xl text-center">
                <p className="font-bold">{error}</p>
                <button
                  onClick={() => dispatch(loadMenuData({ category: selectedCategory, search: searchQuery }))}
                  className="mt-3 bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Retry Loading Menu
                </button>
              </div>
            ) : menuItems.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400">
                <Utensils className="w-12 h-12 mx-auto mb-3 stroke-1 text-slate-300" />
                <p className="text-base font-bold text-slate-700">No menu items found</p>
                <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or category filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {menuItems.map((item) => (
                  <FoodCard key={item._id || item.name} item={item} />
                ))}
              </div>
            )}

          </div>

          {/* Cart Drawer */}
          <CartDrawer />

          {/* Held Orders Queue Drawer */}
          <HeldOrdersDrawer />

          {/* Checkout Modal */}
          <CheckoutModal />

          {/* Payment Success Modal */}
          <PaymentSuccessModal />

        </main>
      ) : (
        <AdminDashboard />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} Pizza House. All rights reserved. • Contact: 7559752165</p>
        </div>
      </footer>

    </div>
  );
}
