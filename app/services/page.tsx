'use client';

import { useEffect, useState, useCallback } from 'react';
import Layout from '@/components/Layout';
import { Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [stock, setStock] = useState<any[]>([]);
  const [productPrices, setProductPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    service_date: new Date().toISOString().split('T')[0],
    service_types: [] as string[], // Multiple service types
    service_prices: {} as Record<string, string>, // Price for each service type
    labour_charge: '',
    amount_paid: '',
    next_due_date: '',
    products_used: [] as any[],
    // Service-specific details - all products work like tyres now
    tyres: [] as Array<{ name: string; price: string; quantity: string }>,
    oils: [] as Array<{ name: string; price: string; quantity: string }>,
    batteries: [] as Array<{ name: string; price: string; quantity: string }>,
    filters: [] as Array<{ name: string; price: string; quantity: string }>,
    brake_pads: [] as Array<{ name: string; price: string; quantity: string }>,
    other_products: [] as Array<{ name: string; price: string; quantity: string; product_type: string }>,
    // Services without products (manual price entry)
    service_prices_manual: {} as Record<string, string>,
  });

  const fetchServices = useCallback(async () => {
    try {
      const response = await fetch('/api/services');
      const data = await response.json();
      if (response.ok) {
        setServices(data.services || []);
      }
    } catch (error) {
      toast.error('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await fetch('/api/users?limit=1000');
      const data = await response.json();
      if (response.ok) {
        setCustomers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  }, []);

  const fetchStock = useCallback(async () => {
    try {
      const response = await fetch('/api/stock?limit=1000');
      const data = await response.json();
      if (response.ok) {
        setStock(data.stocks || []);
      }
    } catch (error) {
      console.error('Failed to fetch stock:', error);
    }
  }, []);

  const fetchProductPrices = useCallback(async () => {
    try {
      // Only fetch active product prices for service creation
      const response = await fetch('/api/product-prices?is_active=true');
      const data = await response.json();
      if (response.ok) {
        // Filter to only active products (double check)
        const activeProducts = (data.productPrices || []).filter((p: any) => p.is_active === true);
        setProductPrices(activeProducts);
      }
    } catch (error) {
      console.error('Failed to fetch product prices:', error);
    }
  }, []);

  useEffect(() => {
    fetchServices();
    fetchCustomers();
    fetchStock();
    fetchProductPrices();
  }, [fetchServices, fetchCustomers, fetchStock, fetchProductPrices]);


  // Calculate total amount automatically
  const calculateTotal = useCallback(() => {
    const labour = parseFloat(formData.labour_charge) || 0;
    
    // Helper function to calculate total for any product array
    const calculateProductTotal = (products: Array<{ price: string; quantity: string }>) => {
      return products.reduce((sum, product) => {
        const unitPrice = parseFloat(product.price) || 0;
        const quantity = parseFloat(product.quantity || '1');
        return sum + (unitPrice * quantity);
      }, 0);
    };
    
    // Sum all product types with quantities
    const tyresTotal = calculateProductTotal(formData.tyres);
    const oilsTotal = calculateProductTotal(formData.oils);
    const batteriesTotal = calculateProductTotal(formData.batteries);
    const filtersTotal = calculateProductTotal(formData.filters);
    const brakePadsTotal = calculateProductTotal(formData.brake_pads);
    const otherProductsTotal = calculateProductTotal(formData.other_products);
    
    // Sum manual service prices (for services without products)
    const manualServicesTotal = Object.values(formData.service_prices_manual).reduce(
      (sum, price) => sum + (parseFloat(price) || 0),
      0
    );
    
    return labour + tyresTotal + oilsTotal + batteriesTotal + filtersTotal + brakePadsTotal + otherProductsTotal + manualServicesTotal;
  }, [
    formData.labour_charge,
    formData.tyres,
    formData.oils,
    formData.batteries,
    formData.filters,
    formData.brake_pads,
    formData.other_products,
    formData.service_prices_manual,
  ]);

  // Update total when relevant fields change
  useEffect(() => {
    const total = calculateTotal();
    if (total > 0) {
      setFormData(prev => ({ ...prev, amount_paid: total.toString() }));
    }
  }, [calculateTotal]);

  const handleServiceTypeToggle = (serviceType: string) => {
    setFormData(prev => {
      const isSelected = prev.service_types.includes(serviceType);
      const newTypes = isSelected
        ? prev.service_types.filter(t => t !== serviceType)
        : [...prev.service_types, serviceType];
      
      // Create new service prices object
      const newServicePrices = { ...prev.service_prices };
      
      // Reset related product arrays when service type is removed
      const productArrayMap: Record<string, keyof typeof prev> = {
        tyre_change: 'tyres',
        oil_change: 'oils',
        battery_change: 'batteries',
        filter_change: 'filters',
        brake_pad_change: 'brake_pads',
      };
      
      if (isSelected) {
        // Removing service type - clear associated product array
        const arrayKey = productArrayMap[serviceType];
        if (arrayKey) {
          (prev as any)[arrayKey] = [];
        }
      }
      // When adding service type, don't auto-populate - let user add products manually
      
      return {
        ...prev,
        service_types: newTypes,
        service_prices: newServicePrices,
      };
    });
  };

  const updateServicePrice = (serviceType: string, price: string) => {
    setFormData(prev => ({
      ...prev,
      service_prices: {
        ...prev.service_prices,
        [serviceType]: price,
      },
    }));
  };

  // Generic functions for all product types
  const addProduct = (productType: 'tyres' | 'oils' | 'batteries' | 'filters' | 'brake_pads' | 'other_products', product_type?: string) => {
    setFormData(prev => {
      const newProduct = productType === 'other_products' 
        ? { name: '', price: '', quantity: '1', product_type: product_type || '' }
        : { name: '', price: '', quantity: '1' };
      
      return {
        ...prev,
        [productType]: [...(prev[productType] as any[]), newProduct],
      };
    });
  };

  const updateProduct = (productType: 'tyres' | 'oils' | 'batteries' | 'filters' | 'brake_pads' | 'other_products', index: number, field: 'name' | 'price' | 'quantity' | 'product_type', value: string) => {
    setFormData(prev => ({
      ...prev,
      [productType]: (prev[productType] as any[]).map((product, i) => 
        i === index ? { ...product, [field]: value } : product
      ),
    }));
  };

  const removeProduct = (productType: 'tyres' | 'oils' | 'batteries' | 'filters' | 'brake_pads' | 'other_products', index: number) => {
    setFormData(prev => ({
      ...prev,
      [productType]: (prev[productType] as any[]).filter((_, i) => i !== index),
    }));
  };

  // Legacy functions for backward compatibility
  const addTyre = () => addProduct('tyres');
  const updateTyre = (index: number, field: 'name' | 'price' | 'quantity', value: string) => updateProduct('tyres', index, field, value);
  const removeTyre = (index: number) => removeProduct('tyres', index);

  const resetForm = () => {
    setFormData({
      user_id: '',
      service_date: new Date().toISOString().split('T')[0],
      service_types: [],
      service_prices: {},
      labour_charge: '',
      amount_paid: '',
      next_due_date: '',
      products_used: [],
      tyres: [],
      oils: [],
      batteries: [],
      filters: [],
      brake_pads: [],
      other_products: [],
      service_prices_manual: {},
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.service_types.length === 0) {
      toast.error('Please select at least one service type');
      return;
    }
    
    try {
      // Calculate total parts charge - use same logic as calculateTotal but exclude labour
      const calculateProductTotal = (products: Array<{ price: string; quantity: string }>) => {
        return products.reduce((sum, product) => {
          const unitPrice = parseFloat(product.price) || 0;
          const quantity = parseFloat(product.quantity || '1');
          return sum + (unitPrice * quantity);
        }, 0);
      };

      const tyresTotal = calculateProductTotal(formData.tyres);
      const oilsTotal = calculateProductTotal(formData.oils);
      const batteriesTotal = calculateProductTotal(formData.batteries);
      const filtersTotal = calculateProductTotal(formData.filters);
      const brakePadsTotal = calculateProductTotal(formData.brake_pads);
      const otherProductsTotal = calculateProductTotal(formData.other_products);
      const manualServicesTotal = Object.values(formData.service_prices_manual).reduce(
        (sum, price) => sum + (parseFloat(price) || 0),
        0
      );

      const totalParts = tyresTotal + oilsTotal + batteriesTotal + filtersTotal + brakePadsTotal + otherProductsTotal + manualServicesTotal;
      
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: formData.user_id,
          service_date: formData.service_date,
          service_type: formData.service_types.join(', '), // Combine multiple types
          labour_charge: parseFloat(formData.labour_charge) || 0,
          parts_charge: totalParts,
          amount_paid: calculateTotal(),
          next_due_date: formData.next_due_date || undefined,
          products_used: formData.products_used,
          // Store service details as metadata
          service_details: {
            service_types: formData.service_types,
            tyres: formData.tyres.filter(t => t.name && t.price),
            oils: formData.oils.filter(o => o.name && o.price),
            batteries: formData.batteries.filter(b => b.name && b.price),
            filters: formData.filters.filter(f => f.name && f.price),
            brake_pads: formData.brake_pads.filter(bp => bp.name && bp.price),
            other_products: formData.other_products.filter(op => op.name && op.price),
            manual_services: formData.service_prices_manual,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Service added successfully');
        setShowModal(false);
        // Reset form only after successful save
        resetForm();
        fetchServices();
      } else {
        toast.error(data.error || 'Failed to add service');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const addStockProduct = () => {
    setFormData({
      ...formData,
      products_used: [...formData.products_used, { stock_id: '', quantity_used: '' }],
    });
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
          <h1 className="text-3xl font-bold text-gray-900">Services</h1>
          <button
            onClick={() => {
              // Always reset form to fresh state when opening modal
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus size={20} />
            Add Service
          </button>
        </div>

        {/* Services Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Due</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.map((service) => (
                  <tr key={service._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(service.service_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service.user_id?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {service.service_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(service.amount_paid)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service.next_due_date ? formatDate(service.next_due_date) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/services/${service._id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Service Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Add New Service</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer *
                    </label>
                    <select
                      required
                      value={formData.user_id}
                      onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    >
                      <option value="">Select Customer</option>
                      {customers.map((customer) => (
                        <option key={customer._id} value={customer._id}>
                          {customer.name} - {customer.vehicle_no}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.service_date}
                      onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                </div>

                {/* Service Types - Multiple Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Types * (Select multiple)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { value: 'washing', label: 'Washing' },
                      { value: 'oil_change', label: 'Oil Change' },
                      { value: 'tyre_change', label: 'Tyre Change' },
                      { value: 'brake_pad_change', label: 'Brake Pad Change' },
                      { value: 'repair', label: 'Repair' },
                      { value: 'ac_work', label: 'AC Work' },
                      { value: 'headlight', label: 'Headlight' },
                      { value: 'battery_change', label: 'Battery Change' },
                      { value: 'filter_change', label: 'Filter Change' },
                      { value: 'wheel_alignment', label: 'Wheel Alignment' },
                      { value: 'engine_service', label: 'Engine Service' },
                      { value: 'other', label: 'Other' },
                    ].map((service) => (
                      <label
                        key={service.value}
                        className="flex items-center space-x-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={formData.service_types.includes(service.value)}
                          onChange={() => handleServiceTypeToggle(service.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{service.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Service Price Fields - Show price input for each selected service */}
                {formData.service_types.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Service Prices *
                    </label>
                    {formData.service_types.map((serviceType) => {
                      // Get service label
                      const serviceLabels: Record<string, string> = {
                        washing: 'Washing',
                        oil_change: 'Oil Change',
                        tyre_change: 'Tyre Change',
                        brake_pad_change: 'Brake Pad Change',
                        repair: 'Repair',
                        ac_work: 'AC Work',
                        headlight: 'Headlight',
                        battery_change: 'Battery Change',
                        filter_change: 'Filter Change',
                        wheel_alignment: 'Wheel Alignment',
                        engine_service: 'Engine Service',
                        other: 'Other',
                      };

                      // Map service types to product types and form data keys
                      const serviceProductMap: Record<string, { productType: string; formKey: 'tyres' | 'oils' | 'batteries' | 'filters' | 'brake_pads' | 'other_products'; label: string }> = {
                        oil_change: { productType: 'oil', formKey: 'oils', label: 'Oil' },
                        tyre_change: { productType: 'tyre', formKey: 'tyres', label: 'Tyre' },
                        battery_change: { productType: 'battery', formKey: 'batteries', label: 'Battery' },
                        filter_change: { productType: 'filter', formKey: 'filters', label: 'Filter' },
                        brake_pad_change: { productType: 'brake_pad', formKey: 'brake_pads', label: 'Brake Pad' },
                      };

                      // Check if this service type uses product selection (like tyres)
                      const productConfig = serviceProductMap[serviceType];
                      
                      if (productConfig) {
                        const products = productPrices.filter(p => p.product_type === productConfig.productType && p.is_active);
                        const productArray = formData[productConfig.formKey] as Array<{ name: string; price: string; quantity: string }>;

                        const handleProductSelect = (index: number, productName: string) => {
                          const selectedProduct = products.find(p => p.product_name === productName);
                          updateProduct(productConfig.formKey, index, 'name', productName);
                          if (selectedProduct) {
                            updateProduct(productConfig.formKey, index, 'price', selectedProduct.price.toString());
                            if (!productArray[index]?.quantity) {
                              updateProduct(productConfig.formKey, index, 'quantity', '1');
                            }
                          }
                        };

                        const handleProductQuantityChange = (index: number, quantity: string) => {
                          updateProduct(productConfig.formKey, index, 'quantity', quantity);
                        };

                        return (
                          <div key={serviceType} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="block text-sm font-medium text-gray-700">
                                {serviceLabels[serviceType]} Details
                              </label>
                              <button
                                type="button"
                                onClick={() => addProduct(productConfig.formKey)}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                              >
                                + Add {productConfig.label}
                              </button>
                            </div>
                            {productArray.map((product, index) => {
                              const selectedProduct = products.find(p => p.product_name === product.name);
                              const unitPrice = selectedProduct ? selectedProduct.price : parseFloat(product.price) || 0;
                              const quantity = parseFloat(product.quantity || '1');
                              const totalPrice = unitPrice * quantity;

                              return (
                                <div key={index} className="space-y-2">
                                  <div className="grid grid-cols-4 gap-3">
                                    <select
                                      required
                                      value={product.name}
                                      onChange={(e) => handleProductSelect(index, e.target.value)}
                                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
                                    >
                                      <option value="">Select {productConfig.label}</option>
                                      {products.map((productItem) => (
                                        <option key={productItem._id} value={productItem.product_name}>
                                          {productItem.product_name} {productItem.brand ? `(${productItem.brand})` : ''} - {formatCurrency(productItem.price)}/unit
                                        </option>
                                      ))}
                                    </select>
                                    <input
                                      type="number"
                                      required
                                      min="1"
                                      step="1"
                                      value={product.quantity || '1'}
                                      onChange={(e) => handleProductQuantityChange(index, e.target.value)}
                                      placeholder="Quantity"
                                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 bg-white placeholder-gray-400"
                                    />
                                    <input
                                      type="number"
                                      required
                                      step="0.01"
                                      readOnly
                                      value={totalPrice.toFixed(2)}
                                      placeholder="Total Price"
                                      className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-semibold cursor-not-allowed"
                                      title="Price = Unit Price × Quantity"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeProduct(productConfig.formKey, index)}
                                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                  {product.name && selectedProduct && (
                                    <p className="text-xs text-gray-500 ml-1">
                                      {formatCurrency(selectedProduct.price)} × {quantity} = {formatCurrency(totalPrice)}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                            {productArray.length === 0 && (
                              <p className="text-sm text-gray-500 italic">Click &quot;+ Add {productConfig.label}&quot; to add {productConfig.label.toLowerCase()} details</p>
                            )}
                          </div>
                        );
                      }

                      // Services without product dropdowns - manual price entry
                      // (washing, repair, ac_work, headlight, wheel_alignment, engine_service, other)
                      return (
                        <div key={serviceType}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {serviceLabels[serviceType]} Price *
                          </label>
                          <input
                            type="number"
                            required
                            step="0.01"
                            value={formData.service_prices_manual[serviceType] || ''}
                            onChange={(e) => {
                              setFormData(prev => ({
                                ...prev,
                                service_prices_manual: {
                                  ...prev.service_prices_manual,
                                  [serviceType]: e.target.value,
                                },
                              }));
                            }}
                            placeholder={`Enter ${serviceLabels[serviceType]} price`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
                          />
                        </div>
                      );

                    })}
                  </div>
                )}

                {/* Labour Charge - Single Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Labour Charge
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.labour_charge}
                    onChange={(e) => setFormData({ ...formData, labour_charge: e.target.value })}
                    placeholder="e.g., 500"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
                  />
                </div>

                {/* Total Amount (Auto-calculated) */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Amount  *
                  </label>
                  <input
                    type="number"
                    readOnly
                    value={calculateTotal()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 font-semibold"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {/* Total = All Service Prices + Tyre Charges + Labour Charge */}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Next Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.next_due_date}
                    onChange={(e) => setFormData({ ...formData, next_due_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      // Reset form on cancel - clear all data
                      resetForm();
                      setShowModal(false);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Service
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

