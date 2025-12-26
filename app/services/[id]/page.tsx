'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { formatDate, formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ServiceDetailPage() {
  const params = useParams();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchService = useCallback(async () => {
    try {
      const response = await fetch(`/api/services/${params.id}`);
      const data = await response.json();
      if (response.ok) {
        setService(data.service);
      } else {
        toast.error('Failed to fetch service details');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchService();
    }
  }, [params.id, fetchService]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!service) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Service not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Service Details</h1>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Back
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Service Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Service Date</p>
                <p className="text-lg font-medium text-gray-900">{formatDate(service.service_date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Service Type</p>
                <p className="text-lg font-medium">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {service.service_type}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Labour Charge</p>
                <p className="text-lg font-medium text-gray-900">{formatCurrency(service.labour_charge)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Parts Charge</p>
                <p className="text-lg font-medium text-gray-900">{formatCurrency(service.parts_charge)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Amount Paid</p>
                <p className="text-lg font-medium text-green-600">{formatCurrency(service.amount_paid)}</p>
              </div>
              {service.next_due_date && (
                <div>
                  <p className="text-sm text-gray-500">Next Due Date</p>
                  <p className="text-lg font-medium text-gray-900">{formatDate(service.next_due_date)}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-lg font-medium text-gray-900">{service.user_id?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mobile</p>
                <p className="text-lg font-medium text-gray-900">{service.user_id?.mobile}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Vehicle Number</p>
                <p className="text-lg font-medium text-gray-900">{service.user_id?.vehicle_no}</p>
              </div>
            </div>
          </div>

          {service.feedback_text && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Feedback</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm text-gray-500">Rating:</p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-xl ${
                          star <= (service.feedback_rating || 0)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700">{service.feedback_text}</p>
              </div>
            </div>
          )}

          {service.complaint_flag && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-red-600">Complaint</h2>
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="text-gray-700">{service.complaint_description || 'No description provided'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

