import { useState, useEffect } from 'react';
import api from '../api/api';
import { Plus, Trash2, Users, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import Pagination from '../components/Pagination';
import { motion } from 'motion/react';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '' });
  const [isLoading, setIsLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteCustomer, setDeleteCustomer] = useState(null);
  const [filters, setFilters] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const page = parseInt(params.get('page')) || 1;
    return { name: '', email: '', skip: Math.max(0, (page - 1) * 10), limit: 10 };
  });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const currentPage = Math.floor(filters.skip / filters.limit) + 1;
    const url = new URL(window.location);
    url.searchParams.set('page', currentPage);
    window.history.replaceState(null, '', url);
  }, [filters.skip, filters.limit]);

  useEffect(() => {
    const timer = setTimeout(() => loadCustomers(), 300);
    return () => clearTimeout(timer);
  }, [filters]);

  const loadCustomers = () => {
    setIsLoading(true);
    const params = { skip: filters.skip, limit: filters.limit };
    if (filters.name) params.name = filters.name;
    if (filters.email) params.email = filters.email;
    api.get('/customers', { params }).then(res => {
      setCustomers(res.data.items);
      setTotal(res.data.total);
    }).catch(() => toast.error("Failed to load customers"))
      .finally(() => setIsLoading(false));
  };

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100/60">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search Name..."
              value={filters.name}
              onChange={e => setFilters({...filters, name: e.target.value, skip: 0})}
              className="pl-9 pr-4 py-2 w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none transition-all"
            />
          </div>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search Email..."
              value={filters.email}
              onChange={e => setFilters({...filters, email: e.target.value, skip: 0})}
              className="pl-9 pr-4 py-2 w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none transition-all"
            />
          </div>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsFormOpen(true)} 
          className="flex items-center py-2.5 px-4 rounded-xl shadow-sm shadow-[#432DD7]/20 text-sm font-semibold text-white bg-[#432DD7] hover:bg-[#3422AD] transition-all"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add New Customer
        </motion.button>
      </div>

      <Modal isOpen={isFormOpen} onClose={resetForm} title="Add New Customer">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <input required type="text" placeholder="John Doe" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="block w-full rounded-xl border-gray-200 bg-white shadow-sm p-2.5 border focus:border-[#432DD7] focus:ring-2 focus:ring-[#432DD7]/20 transition-all outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <input required type="email" placeholder="john@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="block w-full rounded-xl border-gray-200 bg-white shadow-sm p-2.5 border focus:border-[#432DD7] focus:ring-2 focus:ring-[#432DD7]/20 transition-all outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
            <input required type="text" placeholder="+1 (555) 000-0000" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="block w-full rounded-xl border-gray-200 bg-white shadow-sm p-2.5 border focus:border-[#432DD7] focus:ring-2 focus:ring-[#432DD7]/20 transition-all outline-none" />
          </div>
          
          <div className="flex justify-end gap-3 pt-6">
            <button type="button" onClick={resetForm} className="py-2.5 px-4 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button type="submit" className="py-2.5 px-6 rounded-xl shadow-sm shadow-[#432DD7]/20 text-sm font-semibold text-white bg-[#432DD7] hover:bg-[#3422AD] transition-all outline-none">
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
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-[#432DD7] border-t-transparent rounded-full animate-spin mb-3"></div>
                      <p>Loading customers...</p>
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No customers found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                customers.map((customer, index) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination total={total} skip={filters.skip} limit={filters.limit} onPageChange={(newSkip) => setFilters({...filters, skip: newSkip})} />
      </motion.div>
    </div>
  );
}
