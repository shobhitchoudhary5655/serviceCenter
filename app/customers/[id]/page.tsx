'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CustomerDetailPage() {
  const params = useParams();
  const [customer, setCustomer] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomer = useCallback(async () => {
    try {
      const response = await fetch(`/api/users/${params.id}`);
      const data = await response.json();
      if (response.ok) {
        setCustomer(data.user);
      } else {
        toast.error('Failed to fetch customer details');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  const fetchServices = useCallback(async () => {
    try {
      const response = await fetch(`/api/services?user_id=${params.id}&limit=100`);
      const data = await response.json();
      if (response.ok) {
        setServices(data.services || []);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchCustomer();
      fetchServices();
    }
  }, [params.id, fetchCustomer, fetchServices]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!customer) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Customer not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Customer Details</h1>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Back
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="text-lg font-medium text-gray-900">{customer.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Mobile</p>
              <p className="text-lg font-medium text-gray-900">{customer.mobile}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Vehicle Number</p>
              <p className="text-lg font-medium text-gray-900">{customer.vehicle_no}</p>
            </div>
            {customer.email && (
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-lg font-medium text-gray-900">{customer.email}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Source</p>
              <p className="text-lg font-medium">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  customer.source === 'excel' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {customer.source}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Joined Date</p>
              <p className="text-lg font-medium text-gray-900">{formatDate(customer.created_at)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Service History</h2>
          {services.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No services found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {service.service_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{service.amount_paid?.toLocaleString('en-IN')}
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
          )}
        </div>
      </div>
    </Layout>
  );
}

