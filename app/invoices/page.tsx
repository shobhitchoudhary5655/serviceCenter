'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { FileText, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [formData, setFormData] = useState({
    discount_amount: '0',
    gst_rate: '18',
    is_interstate: false,
  });

  useEffect(() => {
    fetchInvoices();
    fetchServices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices');
      const data = await response.json();
      if (response.ok) {
        setInvoices(data.invoices || []);
      }
    } catch (error) {
      toast.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const [servicesResponse, invoicesResponse] = await Promise.all([
        fetch('/api/services?limit=1000'),
        fetch('/api/invoices'),
      ]);
      
      const servicesData = await servicesResponse.json();
      const invoicesData = await invoicesResponse.json();
      
      if (servicesResponse.ok && invoicesResponse.ok) {
        // Filter services without invoices
        const allServices = servicesData.services || [];
        const invoicedServiceIds = (invoicesData.invoices || []).map((inv: any) => inv.service_id?._id || inv.service_id);
        setServices(allServices.filter((s: any) => !invoicedServiceIds.includes(s._id)));
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) {
      toast.error('Please select a service');
      return;
    }

    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: selectedService,
          discount_amount: parseFloat(formData.discount_amount) || 0,
          gst_rate: parseFloat(formData.gst_rate) || 18,
          is_interstate: formData.is_interstate,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Invoice created successfully');
        setShowModal(false);
        setSelectedService('');
        setFormData({ discount_amount: '0', gst_rate: '18', is_interstate: false });
        fetchInvoices();
        fetchServices();
      } else {
        toast.error(data.error || 'Failed to create invoice');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleSendInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/send`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Invoice sent successfully via WhatsApp');
        fetchInvoices();
      } else {
        toast.error(data.message || 'Failed to send invoice');
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
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <FileText size={20} />
            Create Invoice
          </button>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Final Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoice_no}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.service_id?.user_id?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(invoice.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(invoice.final_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {invoice.sent_on_whatsapp ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          Sent
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {!invoice.sent_on_whatsapp && (
                        <button
                          onClick={() => handleSendInvoice(invoice._id)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        >
                          <Send size={16} />
                          Send
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Invoice Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Create Invoice</h2>
              <form onSubmit={handleCreateInvoice} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service *
                  </label>
                  <select
                    required
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="">Select Service</option>
                    {services.map((service) => (
                      <option key={service._id} value={service._id}>
                        {service.user_id?.name} - {service.service_type} - ₹{service.amount_paid}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discount_amount}
                    onChange={(e) => setFormData({ ...formData, discount_amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
                    placeholder="Enter discount amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GST Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.gst_rate}
                    onChange={(e) => setFormData({ ...formData, gst_rate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
                    placeholder="Default: 18"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_interstate"
                    checked={formData.is_interstate}
                    onChange={(e) => setFormData({ ...formData, is_interstate: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_interstate" className="ml-2 block text-sm text-gray-700">
                    Interstate (IGST)
                  </label>
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Invoice
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

