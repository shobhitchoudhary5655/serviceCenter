'use client';

import { useEffect, useState, useCallback } from 'react';
import Layout from '@/components/Layout';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/utils';

export default function ProductPricesPage() {
  const [productPrices, setProductPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all_status');
  const [formData, setFormData] = useState({
    product_name: '',
    product_type: 'tyre',
    brand: '',
    price: '',
    unit: 'per piece',
    is_active: true,
  });

  const fetchProductPrices = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') {
        params.append('product_type', filterType);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      // Filter by status if selected
      if (filterStatus === 'active') {
        params.append('is_active', 'true');
      } else if (filterStatus === 'inactive') {
        params.append('is_active', 'false');
      }
      // If 'all_status', don't add is_active filter - show both

      const response = await fetch(`/api/product-prices?${params.toString()}`);
      const data = await response.json();
      if (response.ok) {
        setProductPrices(data.productPrices || []);
      }
    } catch (error) {
      toast.error('Failed to fetch product prices');
    } finally {
      setLoading(false);
    }
  }, [filterType, searchTerm, filterStatus]);

  useEffect(() => {
    fetchProductPrices();
  }, [fetchProductPrices]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId 
        ? `/api/product-prices/${editingId}`
        : '/api/product-prices';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(editingId ? 'Product price updated' : 'Product price added');
        setShowModal(false);
        resetForm();
        fetchProductPrices();
      } else {
        toast.error(data.error || 'Failed to save product price');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleEdit = (productPrice: any) => {
    setEditingId(productPrice._id);
    setFormData({
      product_name: productPrice.product_name,
      product_type: productPrice.product_type,
      brand: productPrice.brand || '',
      price: productPrice.price.toString(),
      unit: productPrice.unit || 'per piece',
      is_active: productPrice.is_active,
    });
    setShowModal(true);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/product-prices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Product price ${!currentStatus ? 'activated' : 'deactivated'}`);
        fetchProductPrices();
      } else {
        toast.error(data.error || 'Failed to update product price');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this product price? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/product-prices/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Product price deleted');
        fetchProductPrices();
      } else {
        toast.error(data.error || 'Failed to delete product price');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const resetForm = () => {
    setFormData({
      product_name: '',
      product_type: 'tyre',
      brand: '',
      price: '',
      unit: 'per piece',
      is_active: true,
    });
    setEditingId(null);
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  const productTypeLabels: Record<string, string> = {
    tyre: 'Tyre',
    oil: 'Oil',
    battery: 'Battery',
    filter: 'Filter',
    brake_pad: 'Brake Pad',
    other: 'Other',
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
          <h1 className="text-3xl font-bold text-gray-900">Product Prices</h1>
          <button
            onClick={openModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus size={20} />
            Add Product Price
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by product name or brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="all">All Types</option>
              <option value="tyre">Tyre</option>
              <option value="oil">Oil</option>
              <option value="battery">Battery</option>
              <option value="filter">Filter</option>
              <option value="brake_pad">Brake Pad</option>
              <option value="other">Other</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="all_status">All Status (Active + Inactive)</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Product Prices Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productPrices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No product prices found. Click &quot;Add Product Price&quot; to create one.
                    </td>
                  </tr>
                ) : (
                  productPrices.map((productPrice) => (
                    <tr key={productPrice._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {productPrice.product_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {productTypeLabels[productPrice.product_type] || productPrice.product_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {productPrice.brand || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(productPrice.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {productPrice.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {productPrice.is_active ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(productPrice)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleToggleActive(productPrice._id, productPrice.is_active)}
                            className={`${productPrice.is_active ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                            title={productPrice.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {/* {productPrice.is_active ? 'Deactivate' : 'Activate'} */}
                          </button>
                          <button
                            onClick={() => handleDelete(productPrice._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete permanently"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full">
              <h2 className="text-xl font-bold mb-4">
                {editingId ? 'Edit Product Price' : 'Add Product Price'}
              </h2>
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
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Type *
                  </label>
                  <select
                    required
                    value={formData.product_type}
                    onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="tyre">Tyre</option>
                    <option value="oil">Oil</option>
                    <option value="battery">Battery</option>
                    <option value="filter">Filter</option>
                    <option value="brake_pad">Brake Pad</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price *
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="e.g., per piece, per liter"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, is_active: true })}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        formData.is_active
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, is_active: false })}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        !formData.is_active
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Inactive
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.is_active
                      ? '✓ This product will be available in the Add Service page'
                      : '✗ This product will NOT appear in the Add Service page'}
                  </p>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingId ? 'Update' : 'Add'} Product Price
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

