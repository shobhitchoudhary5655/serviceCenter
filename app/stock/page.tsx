'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Plus, Search, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StockPage() {
  const [stock, setStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    product_name: '',
    batch_no: '',
    quantity_in: '',
    unit_price: '',
    supplier: '',
    purchase_date: new Date().toISOString().split('T')[0],
    low_stock_threshold: '10',
  });

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      const response = await fetch('/api/stock?limit=1000');
      const data = await response.json();
      if (response.ok) {
        setStock(data.stocks || []);
      }
    } catch (error) {
      toast.error('Failed to fetch stock');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity_in: parseInt(formData.quantity_in),
          unit_price: parseFloat(formData.unit_price),
          low_stock_threshold: parseInt(formData.low_stock_threshold),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Stock added successfully');
        setShowModal(false);
        setFormData({
          product_name: '',
          batch_no: '',
          quantity_in: '',
          unit_price: '',
          supplier: '',
          purchase_date: new Date().toISOString().split('T')[0],
          low_stock_threshold: '10',
        });
        fetchStock();
      } else {
        toast.error(data.error || 'Failed to add stock');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus size={20} />
            Add Stock
          </button>
        </div>

        {/* Low Stock Alert */}
        {stock.some((s: any) => {
          const remaining = (s.remaining_quantity || s.quantity_in - s.quantity_used);
          return remaining <= (s.low_stock_threshold || 10);
        }) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-2">
            <AlertTriangle className="text-yellow-600" size={20} />
            <span className="text-yellow-800">
              Some items are running low on stock
            </span>
          </div>
        )}

        {/* Stock Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity Used</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remaining</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stock.map((item: any) => {
                  const remaining = item.remaining_quantity || (item.quantity_in - item.quantity_used);
                  const isLowStock = remaining <= (item.low_stock_threshold || 10);
                  return (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.product_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.batch_no}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity_in}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity_used}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        isLowStock ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {remaining}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{item.unit_price}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.supplier}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {item.is_defective ? (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                            Defective
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            In Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Stock Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Add New Stock</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
                    placeholder="Enter product name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Batch No *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.batch_no}
                      onChange={(e) => setFormData({ ...formData, batch_no: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
                      placeholder="Enter batch number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.quantity_in}
                      onChange={(e) => setFormData({ ...formData, quantity_in: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
                      placeholder="Enter quantity"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Price *
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={formData.unit_price}
                      onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
                      placeholder="Enter price"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Low Stock Threshold
                    </label>
                    <input
                      type="number"
                      value={formData.low_stock_threshold}
                      onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
                      placeholder="Default: 10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
                    placeholder="Enter supplier name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purchase Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Stock
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

