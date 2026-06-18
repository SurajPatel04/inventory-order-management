import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Package, Users, ShoppingCart, LayoutDashboard, Menu, X } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Orders', href: '/orders', icon: ShoppingCart },
  ];

  return (
    <div className="h-screen bg-gray-50 flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 z-20 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">Inventory<span className="text-blue-600">Pro</span></h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md text-gray-600 hover:bg-gray-100">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-800/40 z-30 md:hidden backdrop-blur-sm" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col shadow-2xl md:shadow-sm transition-transform duration-300 ease-in-out`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 hidden md:flex shrink-0">
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">Inventory<span className="text-blue-600">Pro</span></h1>
        </div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 md:hidden shrink-0">
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">Menu</h1>
          <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-md text-gray-600 hover:bg-gray-100">
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const active = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 transition-colors ${active ? 'text-blue-600' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full max-w-full">
        <header className="hidden md:flex h-16 bg-white border-b border-gray-100 items-center px-8 z-10 shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">
            {navigation.find(n => n.href === location.pathname)?.name || 'Dashboard'}
          </h2>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-8 bg-gray-50/50">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
