import { useState, useEffect } from 'react';
import api from '../api/api';
import { Package, Users, ShoppingCart, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'motion/react';

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, customers: 0, orders: 0, lowStock: 0 });

  useEffect(() => {
    Promise.all([api.get('/products'), api.get('/customers'), api.get('/orders')]).then(
      ([resProducts, resCustomers, resOrders]) => {
        const lowStockProducts = resProducts.data.filter(p => p.quantity < 5).length;
        setStats({
          products: resProducts.data.length,
          customers: resCustomers.data.length,
          orders: resOrders.data.length,
          lowStock: lowStockProducts,
        });
      }
    ).catch(() => toast.error("Failed to load dashboard data"));
  }, []);

  const cards = [
    { name: 'Total Products', value: stats.products, icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Total Customers', value: stats.customers, icon: Users, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Total Orders', value: stats.orders, icon: ShoppingCart, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Low Stock Items', value: stats.lowStock, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  return (
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
  );
}
