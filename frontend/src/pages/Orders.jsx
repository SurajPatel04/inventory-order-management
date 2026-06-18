import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Plus, Trash2, ShoppingBag, Eye, ChevronUp } from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { motion, AnimatePresence } from 'motion/react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  const [expandedId, setExpandedId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteOrder, setDeleteOrder] = useState(null);
  
  const [form, setForm] = useState({ customer_id: '', product_id: '', quantity: 1 });

  useEffect(() => { loadData() }, []);

  const loadData = () => {
    api.get('/orders').then(res => setOrders(res.data)).catch(() => toast.error("Failed to load orders"));
    api.get('/products').then(res => setProducts(res.data)).catch(console.error);
    api.get('/customers').then(res => setCustomers(res.data)).catch(console.error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_id || !form.product_id) return;
    
    try {
      const payload = {
        customer_id: parseInt(form.customer_id),
        items: [{ product_id: parseInt(form.product_id), quantity: parseInt(form.quantity) }]
      };
      await api.post('/orders', payload);
      toast.success("Order placed successfully!");
      resetForm();
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error creating order');
    }
  };

  const confirmDelete = async () => {
    if(!deleteOrder) return;
    try {
      await api.delete(`/orders/${deleteOrder.id}`);
      toast.success("Order deleted successfully!");
      setDeleteOrder(null);
      loadData();
    } catch(err) {
      toast.error(err.response?.data?.detail || 'Error deleting order');
      setDeleteOrder(null);
    }
  };

  const resetForm = () => {
    setForm({ customer_id: '', product_id: '', quantity: 1 });
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 w-full">
      <div className="flex justify-end">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsFormOpen(true)} 
          className="flex items-center py-2.5 px-4 rounded-xl shadow-sm shadow-emerald-500/20 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Place New Order
        </motion.button>
      </div>

      <Modal isOpen={isFormOpen} onClose={resetForm} title="Create New Order">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Customer</label>
            <select required value={form.customer_id} onChange={e => setForm({...form, customer_id: e.target.value})} className="block w-full rounded-xl border-gray-200 bg-white shadow-sm p-2.5 border focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none appearance-none">
              <option value="">Select Customer</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Product</label>
            <select required value={form.product_id} onChange={e => setForm({...form, product_id: e.target.value})} className="block w-full rounded-xl border-gray-200 bg-white shadow-sm p-2.5 border focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none appearance-none">
              <option value="">Select Product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (${p.price} - {p.quantity} left)</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantity</label>
            <input required type="number" min="1" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="block w-full rounded-xl border-gray-200 bg-white shadow-sm p-2.5 border focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none" />
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button type="button" onClick={resetForm} className="py-2.5 px-4 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button type="submit" className="py-2.5 px-6 rounded-xl shadow-sm shadow-emerald-500/20 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all outline-none">
              Submit Order
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal 
        isOpen={!!deleteOrder} 
        onClose={() => setDeleteOrder(null)} 
        onConfirm={confirmDelete} 
        itemName={`Order #${deleteOrder?.id}`} 
      />

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100/60 overflow-hidden w-full"
      >
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Value</th>
                <th className="px-4 sm:px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order, index) => {
                const customer = customers.find(c => c.id === order.customer_id);
                const isExpanded = expandedId === order.id;
                
                return (
                <React.Fragment key={order.id}>
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-emerald-50/30 transition-colors group cursor-pointer" 
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  >
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <span className="text-gray-400 mr-1">#</span>{order.id}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700">{customer ? customer.full_name : `ID: ${order.customer_id}`}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">
                        {order.status || 'Confirmed'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">${order.total_amount.toFixed(2)}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-1 sm:gap-2">
                      <button onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : order.id); }} className="text-gray-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-all">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteOrder(order); }} className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                  <AnimatePresence>
                    {isExpanded && (
                      <tr className="bg-gray-50/50">
                        <td colSpan="5" className="p-0 border-b-0">
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 sm:px-6 py-4 text-sm overflow-x-auto">
                              <p className="font-semibold text-gray-700 mb-2">Order Items:</p>
                              <ul className="space-y-1 min-w-[300px]">
                                {order.items?.map(item => {
                                  const p = products.find(prod => prod.id === item.product_id);
                                  return (
                                    <li key={item.id} className="text-gray-600 flex justify-between bg-white p-2 rounded border border-gray-100">
                                      <span>{p ? p.name : `Product #${item.product_id}`} (Qty: {item.quantity})</span>
                                      <span className="font-medium ml-4">${item.subtotal.toFixed(2)}</span>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              )})}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No orders yet. Start selling!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
