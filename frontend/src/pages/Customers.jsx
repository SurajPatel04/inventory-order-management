import { useState, useEffect } from 'react';
import api from '../api/api';
import { Plus, Trash2, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { motion } from 'motion/react';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '' });
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteCustomer, setDeleteCustomer] = useState(null);

  useEffect(() => { loadCustomers() }, []);

  const loadCustomers = () => api.get('/customers').then(res => setCustomers(res.data)).catch(() => toast.error("Failed to load customers"));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/customers', form);
      toast.success("Customer added successfully!");
      resetForm();
      loadCustomers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error creating customer');
    }
  };

  const confirmDelete = async () => {
    if(!deleteCustomer) return;
    try {
      await api.delete(`/customers/${deleteCustomer.id}`);
      toast.success("Customer deleted successfully!");
      setDeleteCustomer(null);
      loadCustomers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error deleting customer');
      setDeleteCustomer(null);
    }
  };

  const resetForm = () => {
    setForm({ full_name: '', email: '', phone: '' });
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 w-full">
      <div className="flex justify-end">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsFormOpen(true)} 
          className="flex items-center py-2.5 px-4 rounded-xl shadow-sm shadow-indigo-500/20 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add New Customer
        </motion.button>
      </div>

      <Modal isOpen={isFormOpen} onClose={resetForm} title="Add New Customer">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <input required type="text" placeholder="John Doe" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="block w-full rounded-xl border-gray-200 bg-white shadow-sm p-2.5 border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <input required type="email" placeholder="john@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="block w-full rounded-xl border-gray-200 bg-white shadow-sm p-2.5 border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
            <input required type="text" placeholder="+1 (555) 000-0000" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="block w-full rounded-xl border-gray-200 bg-white shadow-sm p-2.5 border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none" />
          </div>
          
          <div className="flex justify-end gap-3 pt-6">
            <button type="button" onClick={resetForm} className="py-2.5 px-4 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button type="submit" className="py-2.5 px-6 rounded-xl shadow-sm shadow-indigo-500/20 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all outline-none">
              Save Customer
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal 
        isOpen={!!deleteCustomer} 
        onClose={() => setDeleteCustomer(null)} 
        onConfirm={confirmDelete} 
        itemName={deleteCustomer?.full_name} 
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
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Info</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-4 sm:px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map((customer, index) => (
                <motion.tr 
                  key={customer.id} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-indigo-50/30 transition-colors group"
                >
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs mr-3">
                        {customer.full_name.charAt(0)}
                      </div>
                      <div className="text-sm font-medium text-gray-900">{customer.full_name}</div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.phone}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => setDeleteCustomer(customer)} className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No customers found.</p>
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
