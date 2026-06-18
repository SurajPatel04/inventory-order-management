import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Plus, Trash2, ShoppingBag, ChevronDown, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import Select from '../components/Select';
import Pagination from '../components/Pagination';
import { motion, AnimatePresence } from 'motion/react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  const [expandedId, setExpandedId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteOrder, setDeleteOrder] = useState(null);
  const [filters, setFilters] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const page = parseInt(params.get('page')) || 1;
    return { customer_id: '', status: '', skip: Math.max(0, (page - 1) * 6), limit: 6 };
  });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const currentPage = Math.floor(filters.skip / filters.limit) + 1;
    const url = new URL(window.location);
    url.searchParams.set('page', currentPage);
    window.history.replaceState(null, '', url);
  }, [filters.skip, filters.limit]);
  
  const [form, setForm] = useState({ customer_id: '', product_id: '', quantity: 1 });

  useEffect(() => { loadData() }, [filters]);

  const loadData = () => {
    const params = { skip: filters.skip, limit: filters.limit };
    if (filters.customer_id) params.customer_id = filters.customer_id;
    if (filters.status) params.status = filters.status;
    api.get('/orders', { params }).then(res => {
      setOrders(res.data.items);
      setTotal(res.data.total);
    }).catch(() => toast.error("Failed to load orders"));
    api.get('/products').then(res => setProducts(res.data.items)).catch(console.error);
    api.get('/customers').then(res => setCustomers(res.data.items)).catch(console.error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_id || !form.product_id) {
      toast.error("Please select both a customer and a product.");
      return;
    }
    
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

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success("Status updated!");
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update status');
    }
  };

  const resetForm = () => {
    setForm({ customer_id: '', product_id: '', quantity: 1 });
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100/60">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Select 
            value={filters.customer_id} 
            onChange={val => setFilters({...filters, customer_id: val, skip: 0})}
            placeholder="All Customers"
            icon={Filter}
            options={customers.map(c => ({ value: c.id.toString(), label: c.full_name }))}
            className="sm:w-56"
          />
          <Select 
            value={filters.status} 
            onChange={val => setFilters({...filters, status: val, skip: 0})}
            placeholder="All Statuses"
            icon={Filter}
            options={[
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'pending', label: 'Pending' },
              { value: 'shipped', label: 'Shipped' },
              { value: 'delivered', label: 'Delivered' },
              { value: 'cancelled', label: 'Cancelled' }
            ]}
            className="sm:w-56"
          />
        </div>
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
            <Select 
              value={form.customer_id}
              onChange={val => setForm({...form, customer_id: val})}
              placeholder="Select Customer"
              options={customers.map(c => ({ value: c.id.toString(), label: c.full_name }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Product</label>
            <Select 
              value={form.product_id}
              onChange={val => setForm({...form, product_id: val})}
              placeholder="Select Product"
              options={products.map(p => ({ value: p.id.toString(), label: `${p.name} ($${p.price} - ${p.quantity} left)` }))}
            />
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
                      <Select 
                        variant="status"
                        value={order.status || 'confirmed'}
                        onChange={(newVal) => { if(newVal) updateOrderStatus(order.id, newVal); }}
                        placeholder="Status"
                        options={[
                          { value: 'pending', label: 'Pending' },
                          { value: 'confirmed', label: 'Confirmed' },
                          { value: 'shipped', label: 'Shipped' },
                          { value: 'delivered', label: 'Delivered' },
                          { value: 'cancelled', label: 'Cancelled' }
                        ]}
                        className="w-28"
                      />
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">${order.total_amount.toFixed(2)}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-1 sm:gap-2">
                      <button onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : order.id); }} className="text-gray-400 hover:text-emerald-600 p-2 rounded-lg hover:bg-emerald-50 transition-all">
                        <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-emerald-600' : ''}`} />
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
                            <div className="px-6 py-5">
                              <div className="flex justify-between items-center mb-3">
                                <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                                  <ShoppingBag className="w-4 h-4 mr-2 text-emerald-600" /> Order Details
                                </h4>
                                <span className="text-xs text-gray-500 font-medium bg-white px-2.5 py-1 rounded-md border border-gray-100 shadow-sm">
                                  {new Date(order.created_at).toLocaleString()}
                                </span>
                              </div>
                              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                                <table className="min-w-full divide-y divide-gray-100 text-sm">
                                  <thead className="bg-gray-50/50">
                                    <tr>
                                      <th className="px-4 py-2.5 text-left font-semibold text-gray-500 uppercase tracking-wider text-xs">Product</th>
                                      <th className="px-4 py-2.5 text-center font-semibold text-gray-500 uppercase tracking-wider text-xs">Qty</th>
                                      <th className="px-4 py-2.5 text-right font-semibold text-gray-500 uppercase tracking-wider text-xs">Unit Price</th>
                                      <th className="px-4 py-2.5 text-right font-semibold text-gray-500 uppercase tracking-wider text-xs">Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-50">
                                    {order.items?.map(item => {
                                      const p = products.find(prod => prod.id === item.product_id);
                                      return (
                                        <tr key={item.product_id} className="hover:bg-gray-50/30 transition-colors">
                                          <td className="px-4 py-3 text-gray-900 font-medium">{p ? p.name : `Product #${item.product_id}`}</td>
                                          <td className="px-4 py-3 text-center text-gray-600 font-medium">x{item.quantity}</td>
                                          <td className="px-4 py-3 text-right text-gray-500">${item.unit_price.toFixed(2)}</td>
                                          <td className="px-4 py-3 text-right font-semibold text-gray-900">${item.subtotal.toFixed(2)}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                  <tfoot className="bg-gray-50/80 border-t border-gray-100">
                                    <tr>
                                      <td colSpan="3" className="px-4 py-3 text-right font-bold text-gray-700 uppercase tracking-wider text-xs">Total Amount</td>
                                      <td className="px-4 py-3 text-right font-bold text-emerald-600 text-base">${order.total_amount.toFixed(2)}</td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
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
        <Pagination total={total} skip={filters.skip} limit={filters.limit} onPageChange={(newSkip) => setFilters({...filters, skip: newSkip})} />
      </motion.div>
    </div>
  );
}
