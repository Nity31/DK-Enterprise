import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, 
  Search, 
  PlusCircle, 
  Eye, 
  Edit3, 
  Trash2, 
  RefreshCw,
  Hammer
} from 'lucide-react';

export default function DocumentList({ onNewDocument, onEditDocument, onViewDocument }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [docTypeFilter, setDocTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, [docTypeFilter, statusFilter]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (docTypeFilter) params.doc_type = docTypeFilter;
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;

      const res = await axios.get('/api/documents', { params });
      setDocuments(res.data);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDocuments();
  };

  const handleDelete = async (id, docNumber) => {
    if (window.confirm(`Are you sure you want to delete ${docNumber}?`)) {
      try {
        await axios.delete(`/api/documents/${id}`);
        fetchDocuments();
      } catch (err) {
        alert('Failed to delete document: ' + err.message);
      }
    }
  };

  const handleConvert = async (id, docNumber) => {
    const choice = window.prompt(
      `Convert Quotation ${docNumber}:\nType "1" for Tax Invoice\nType "2" for Labour Bill`,
      "1"
    );
    if (!choice) return;

    const targetType = choice === "2" ? "LABOUR_BILL" : "TAX_INVOICE";
    try {
      const res = await axios.post(`/api/documents/${id}/convert`, { target_type: targetType });
      alert(`Successfully converted! Generated: ${res.data.newInvoiceNumber}`);
      onViewDocument(res.data.newDocId);
    } catch (err) {
      alert('Failed to convert quotation: ' + err.message);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Bills, Quotations & Labour Charges</h2>
          <p className="text-xs text-slate-500">View, search, edit, convert, and print all customer tax invoices, labour bills, and estimates.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNewDocument('LABOUR_BILL')}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Hammer className="w-4 h-4" />
            + Labour Bill
          </button>
          <button
            onClick={() => onNewDocument('QUOTATION')}
            className="px-3.5 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 text-sky-400" />
            + Quotation
          </button>
          <button
            onClick={() => onNewDocument('TAX_INVOICE')}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            + Tax Invoice
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Document Type Tabs */}
        <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-lg w-full lg:w-auto gap-1">
          <button
            onClick={() => setDocTypeFilter('')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
              docTypeFilter === '' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Docs
          </button>
          <button
            onClick={() => setDocTypeFilter('TAX_INVOICE')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
              docTypeFilter === 'TAX_INVOICE' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tax Invoices
          </button>
          <button
            onClick={() => setDocTypeFilter('LABOUR_BILL')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
              docTypeFilter === 'LABOUR_BILL' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Labour Bills
          </button>
          <button
            onClick={() => setDocTypeFilter('QUOTATION')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
              docTypeFilter === 'QUOTATION' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Quotations
          </button>
        </div>

        {/* Status Filter & Search */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-700 text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Pending">Pending</option>
            <option value="Converted">Converted</option>
          </select>

          <form onSubmit={handleSearchSubmit} className="relative flex-1 lg:w-64">
            <input
              type="text"
              placeholder="Search Doc #, GSTIN, Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-xs rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
          </form>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-2"></div>
            Loading documents...
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No documents found</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Doc #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Customer GSTIN</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Total Amount</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      {doc.doc_type === 'TAX_INVOICE' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          TAX INVOICE
                        </span>
                      )}
                      {doc.doc_type === 'LABOUR_BILL' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                          LABOUR BILL
                        </span>
                      )}
                      {doc.doc_type === 'QUOTATION' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
                          QUOTATION
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{doc.doc_number}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{doc.customer_name}</td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-500">{doc.customer_gstin || '-'}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">{doc.doc_date}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">{formatCurrency(doc.total_amount)}</td>
                    <td className="py-3.5 px-4 text-center">
                      {doc.status === 'Paid' && (
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-500 text-white">Paid</span>
                      )}
                      {doc.status === 'Unpaid' && (
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-500 text-white">Unpaid</span>
                      )}
                      {doc.status === 'Pending' && (
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-sky-500 text-white">Pending</span>
                      )}
                      {doc.status === 'Converted' && (
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-purple-600 text-white">Converted</span>
                      )}
                      {doc.status === 'Cancelled' && (
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-400 text-white">Cancelled</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* View / Print */}
                        <button
                          onClick={() => onViewDocument(doc.id)}
                          title="View / Print Document"
                          className="p-1.5 bg-slate-100 hover:bg-sky-100 hover:text-sky-700 text-slate-600 rounded-lg transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Convert Quotation */}
                        {doc.doc_type === 'QUOTATION' && doc.status !== 'Converted' && (
                          <button
                            onClick={() => handleConvert(doc.id, doc.doc_number)}
                            title="Convert into Invoice or Labour Bill"
                            className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}

                        {/* Edit */}
                        <button
                          onClick={() => onEditDocument(doc.id)}
                          title="Edit Document"
                          className="p-1.5 bg-slate-100 hover:bg-amber-100 hover:text-amber-700 text-slate-600 rounded-lg transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(doc.id, doc.doc_number)}
                          title="Delete Document"
                          className="p-1.5 bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-600 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
