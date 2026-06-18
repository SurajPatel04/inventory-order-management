import { useState, useEffect } from 'react';
import api from '../api/api';
import { Package, Users, ShoppingCart, AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({ 
    products: 0, customers: 0, orders: 0, lowStock: 0,
    lowStockProducts: [], recentOrders: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats').then(res => {
      setStats({
        products: res.data.total_products,
        customers: res.data.total_customers,
        orders: res.data.total_orders,
        lowStock: res.data.low_stock_products.length,
        lowStockProducts: res.data.low_stock_products,
        recentOrders: res.data.recent_orders
      });
    }).catch(() => toast.error("Failed to load dashboard data"))
      .finally(() => setIsLoading(false));
  }, []);

  const cards = [
    { name: 'Total Products', value: stats.products, icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Total Customers', value: stats.customers, icon: Users, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Total Orders', value: stats.orders, icon: ShoppingCart, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Low Stock Items', value: stats.lowStock, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  const chartData = [
    { name: 'Products', value: stats.products, color: '#3b82f6' },
    { name: 'Customers', value: stats.customers, color: '#10b981' },
    { name: 'Orders', value: stats.orders, color: '#8b5cf6' }
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-[#432DD7] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium animate-pulse">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div 
              key={card.name} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100/60 p-6 flex items-center transition-shadow duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div className={`p-4 rounded-xl ${card.bg} mr-5`}>
                <Icon className={`h-7 w-7 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{card.name}</p>
                <p className="text-3xl font-bold text-gray-900 tracking-tight">{card.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Statistics Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100/60 p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Statistics</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} tick={{ fontSize: 13, fill: '#6b7280' }} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100/60 p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" /> 
            Low Stock Products
          </h2>
          {stats.lowStockProducts.length > 0 ? (
            <div className="overflow-x-auto h-[260px] scrollbar-thin">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-50/50 text-gray-500 uppercase font-semibold text-xs sticky top-0">
                  <tr>
                    <th className="px-4 py-2 rounded-l-lg">Product</th>
                    <th className="px-4 py-2">SKU</th>
                    <th className="px-4 py-2 rounded-r-lg text-right">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.lowStockProducts.map(p => (
                    <tr key={p.id}>
                      <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-[120px]">{p.name}</td>
                      <td className="px-4 py-3 text-gray-500">{p.sku}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="px-2 py-1 rounded-md bg-red-50 text-red-700 font-bold">{p.quantity}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-gray-500">All products are sufficiently stocked.</div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100/60 p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 text-blue-500 mr-2" /> 
            Recent Orders
          </h2>
          {stats.recentOrders.length > 0 ? (
            <div className="space-y-3">
              {stats.recentOrders.map(o => (
                <div key={o.id} className="flex justify-between items-center p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Order #{o.id}</p>
                    <p className="text-xs text-gray-500">{new Date(o.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">${o.total_amount.toFixed(2)}</p>
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                      o.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      o.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                      o.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      o.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-gray-500">No recent orders found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
