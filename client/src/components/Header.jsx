import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleCartDrawer, selectCartItemCount, selectCartTotal } from '../redux/cartSlice';
import { setSearchQuery } from '../redux/menuSlice';
import InstallAppButton from './InstallAppButton';
import { ShoppingBag, Search, ShieldCheck, Phone, UtensilsCrossed } from 'lucide-react';

export default function Header({ currentView, setCurrentView }) {
  const dispatch = useDispatch();
  const itemCount = useSelector(selectCartItemCount);
  const cartTotal = useSelector(selectCartTotal);
  const searchQuery = useSelector((state) => state.menu.searchQuery);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('menu')}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <UtensilsCrossed className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
                PIZZA <span className="text-rose-600">HOUSE</span>
              </h1>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <a href="tel:7559752165" className="flex items-center gap-1 text-rose-600 font-bold hover:underline">
                  <Phone className="w-3.5 h-3.5" />
                  <span>7559752165</span>
                </a>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">WYSWYP Pricing</span>
              </div>
            </div>
          </div>

          {/* Search Bar (Menu View) */}
          {currentView === 'menu' && (
            <div className="hidden md:flex items-center flex-1 max-w-md mx-8 relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search pizzas, gym smoothies, momos, pasta..."
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-slate-800 placeholder-slate-400 text-sm rounded-xl border border-transparent focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* Install Device App Button */}
            <InstallAppButton />

            {/* View Switcher (Text Only) */}
            <button
              onClick={() => setCurrentView(currentView === 'menu' ? 'admin' : 'menu')}
              className="text-sm font-bold text-slate-700 hover:text-rose-600 underline underline-offset-4 px-2 py-1 transition-colors"
            >
              {currentView === 'menu' ? 'Admin POS' : 'Customer Menu'}
            </button>

            {/* Cart Button */}
            {currentView === 'menu' && (
              <button
                onClick={() => dispatch(toggleCartDrawer(true))}
                className="relative flex items-center space-x-3 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-rose-500/25 transition-all"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 font-black text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                      {itemCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline border-l border-rose-500/60 pl-3">
                  ₹{cartTotal}
                </span>
              </button>
            )}
          </div>

        </div>

        {/* Mobile Search Bar */}
        {currentView === 'menu' && (
          <div className="md:hidden pb-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search food items & drinks..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 text-slate-800 placeholder-slate-400 text-sm rounded-xl border border-transparent focus:border-rose-400 focus:bg-white outline-none"
            />
          </div>
        )}

      </div>
    </header>
  );
}
