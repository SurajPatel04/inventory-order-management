import { useState, useEffect } from 'react';
import api from '../api/api';
import { Plus, Trash2, Edit2, PackageSearch } from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { motion } from 'motion/react';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', sku: '', price: '', quantity: '' });
  const [editingId, setEditingId] = useState(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState(null);

  useEffect(() => { loadProducts() }, []);

  const loadProducts = () => api.get('/products').then(res => setProducts(res.data)).catch(() => toast.error("Failed to load products"));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity) };
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        toast.success("Product updated successfully!");
      } else {
        await api.post('/products', payload);
        toast.success("Product created successfully!");
      }
      closeForm();
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error saving product');
    }
  };

  const confirmDelete = async () => {
    if(!deleteProduct) return;
    try {
      await api.delete(`/products/${deleteProduct.id}`);
      toast.success("Product deleted successfully!");
      setDeleteProduct(null);
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error deleting product');
      setDeleteProduct(null);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({ name: product.name, sku: product.sku, price: product.price, quantity: product.quantity });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setEditingId(null);
    setForm({ name: '', sku: '', price: '', quantity: '' });
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 w-full">
      <div className="flex justify-end">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsFormOpen(true)} 
          className="flex items-center py-2.5 px-4 rounded-xl shadow-sm shadow-blue-500/20 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add New Product
        </motion.button>
      </div>

      <Modal isOpen={isFormOpen} onClose={closeForm} title={editingId ? 'Update Product' : 'Add New Product'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name</label>
            <input required type="text" placeholder="e.g. Wireless Mouse" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="block w-full rounded-xl border-gray-200 bg-white shadow-sm p-2.5 border focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">SKU</label>
            <input required type="text" placeholder="e.g. WM-01" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} className="block w-full rounded-xl border-gray-200 bg-white shadow-sm p-2.5 border focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Price ($)</label>
              <input required type="number" placeholder="0.00" step="0.01" min="0" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="block w-full rounded-xl border-gray-200 bg-white shadow-sm p-2.5 border focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock Quantity</label>
              <input required type="number" placeholder="0" min="0" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="block w-full rounded-xl border-gray-200 bg-white shadow-sm p-2.5 border focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-6">
            <button type="button" onClick={closeForm} className="py-2.5 px-4 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button type="submit" className={`flex items-center py-2.5 px-6 rounded-xl shadow-sm text-sm font-semibold text-white transition-all outline-none ${editingId ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'}`}>
              {editingId ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal 
        isOpen={!!deleteProduct} 
        onClose={() => setDeleteProduct(null)} 
        onConfirm={confirmDelete} 
        itemName={deleteProduct?.name} 
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
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock Level</th>
                <th className="px-4 sm:px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product, index) => (
                <motion.tr 
                  key={product.id} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-blue-50/30 transition-colors group"
                >
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500"><code className="bg-gray-100 px-2 py-1 rounded text-gray-600">{product.sku}</code></td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">${product.price.toFixed(2)}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${product.quantity > 10 ? 'bg-green-100 text-green-700' : product.quantity > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                      {product.quantity} in stock
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-1 sm:gap-2">
                    <button onClick={() => handleEdit(product)} className="text-gray-400 hover:text-amber-600 p-2 rounded-lg hover:bg-amber-50 transition-all">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteProduct(product)} className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                    <PackageSearch className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No products found. Start by adding one above.</p>
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
