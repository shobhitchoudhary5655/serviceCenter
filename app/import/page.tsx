'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import { Upload, Download, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/import/excel', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Successfully imported ${data.imported} customers`);
        setResult(data);
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        toast.error(data.error || 'Failed to import file');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Create a simple CSV template
    const template = 'name,mobile,vehicle_no,email\nJohn Doe,9876543210,ABC1234,john@example.com\nJane Smith,9876543211,XYZ5678,jane@example.com';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customer_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Import Customers from Excel</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Upload Excel File</h2>
            <p className="text-gray-600 mb-4">
              Upload an Excel file (.xlsx, .xls) or CSV file with customer data.
              Required columns: name, mobile, vehicle_no (optional: email)
            </p>
            <button
              onClick={downloadTemplate}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
            >
              <Download size={20} />
              Download Template
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      Excel or CSV file
                    </p>
                  </div>
                  <input
                    id="file-input"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              {file && (
                <p className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                  <FileSpreadsheet size={16} />
                  {file.name}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!file || loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Importing...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Import Customers
                </>
              )}
            </button>
          </form>

          {result && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Import Result</h3>
              <p className="text-blue-800">Successfully imported: {result.imported} customers</p>
              {result.errors && result.errors.length > 0 && (
                <div className="mt-4">
                  <p className="font-semibold text-red-900 mb-2">Errors:</p>
                  <ul className="list-disc list-inside text-red-800 space-y-1">
                    {result.errors.slice(0, 10).map((error: string, index: number) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                  {result.errors.length > 10 && (
                    <p className="text-sm text-red-800 mt-2">
                      ... and {result.errors.length - 10} more errors
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Download the template file above to see the correct format</li>
            <li>Required columns: name, mobile, vehicle_no</li>
            <li>Optional column: email</li>
            <li>Mobile numbers must be unique</li>
            <li>Supported formats: .xlsx, .xls, .csv</li>
            <li>Duplicate mobile numbers will be skipped</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}

