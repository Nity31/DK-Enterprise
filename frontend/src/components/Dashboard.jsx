import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  IndianRupee, 
  Clock, 
  FileCheck2, 
  Users, 
  PlusCircle, 
  FileText, 
  Eye, 
  ArrowRight,
  TrendingUp,
  Calendar,
  Building2,
  Hammer,
  FileSignature
} from 'lucide-react';

export default function Dashboard({ setActiveTab, onNewDocument, onViewDocument }) {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    thisMonthRevenue: 0,
    thisYearRevenue: 0,
    unpaidAmount: 0,
    unpaidCount: 0,
    totalQuotations: 0,
    totalCustomers: 0,
    monthlyBreakdown: [],
    recentDocs: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  const currentMonthName = new Date().toLocaleString('en-US', { month: 'long' });
  const currentYearName = new Date().getFullYear();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-4">
          <img src="/dk_logo.png" alt="DK Enterprise Logo" className="h-12 w-auto object-contain drop-shadow" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-sky-600 text-white px-2.5 py-0.5 rounded-lg text-xs font-black">
                DK ENTERPRISE
              </span>
              <span className="text-xs text-sky-300 font-semibold">Financial & Billing Overview</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">Enterprise Billing Dashboard</h2>
            <p className="text-slate-300 text-xs mt-1">
              Track monthly/yearly earnings, tax invoices, labour bills, and official company letterheads.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNewDocument('LABOUR_BILL')}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
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
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            + Tax Invoice
          </button>
        </div>
      </div>

      {/* Main Earnings & Financial Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: THIS MONTH'S EARNINGS */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm flex items-center justify-between relative overflow-hidden">
          <div className="space-y-1">
            <p className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" /> {currentMonthName} Earnings
            </p>
            <h3 className="text-2xl font-black text-slate-900">{formatCurrency(stats.thisMonthRevenue)}</h3>
            <span className="text-[11px] text-slate-500 font-medium block">
              Paid in {currentMonthName}
            </span>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-2xl shadow-inner">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: THIS YEAR'S EARNINGS */}
        <div className="bg-white p-5 rounded-2xl border border-sky-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-extrabold text-sky-700 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-sky-600" /> Year {currentYearName} Earnings
            </p>
            <h3 className="text-2xl font-black text-slate-900">{formatCurrency(stats.thisYearRevenue)}</h3>
            <span className="text-[11px] text-slate-500 font-medium block">
              Total paid in {currentYearName}
            </span>
          </div>
          <div className="bg-sky-50 text-sky-600 p-3.5 rounded-2xl shadow-inner">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: ALL-TIME TOTAL REVENUE */}
        <div className="bg-white p-5 rounded-2xl border border-indigo-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-extrabold text-indigo-700 uppercase tracking-wider">
              All-Time Revenue
            </p>
            <h3 className="text-2xl font-black text-slate-900">{formatCurrency(stats.totalRevenue)}</h3>
            <span className="text-[11px] text-slate-500 font-medium block">
              Lifetime paid bills
            </span>
          </div>
          <div className="bg-indigo-50 text-indigo-600 p-3.5 rounded-2xl shadow-inner">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: PENDING RECEIVABLES */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-extrabold text-amber-700 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Receivables
            </p>
            <h3 className="text-2xl font-black text-amber-600">{formatCurrency(stats.unpaidAmount)}</h3>
            <span className="text-[11px] text-slate-500 font-semibold block">
              {stats.unpaidCount} unpaid invoice(s)
            </span>
          </div>
          <div className="bg-amber-50 text-amber-600 p-3.5 rounded-2xl shadow-inner">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => onNewDocument('TAX_INVOICE')}
          className="p-4 bg-white border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 rounded-2xl text-left transition group shadow-sm"
        >
          <PlusCircle className="w-5 h-5 text-sky-600 mb-2 group-hover:scale-110 transition" />
          <h4 className="font-bold text-slate-900 text-sm">Create Tax Bill</h4>
          <p className="text-xs text-slate-500">Generate GST tax invoice</p>
        </button>

        <button
          onClick={() => onNewDocument('LABOUR_BILL')}
          className="p-4 bg-white border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 rounded-2xl text-left transition group shadow-sm"
        >
          <Hammer className="w-5 h-5 text-amber-600 mb-2 group-hover:scale-110 transition" />
          <h4 className="font-bold text-slate-900 text-sm">Create Labour Bill</h4>
          <p className="text-xs text-slate-500">Service & labour charges</p>
        </button>

        <button
          onClick={() => onNewDocument('QUOTATION')}
          className="p-4 bg-white border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 rounded-2xl text-left transition group shadow-sm"
        >
          <FileText className="w-5 h-5 text-sky-600 mb-2 group-hover:scale-110 transition" />
          <h4 className="font-bold text-slate-900 text-sm">Create Quotation</h4>
          <p className="text-xs text-slate-500">Send estimate to client</p>
        </button>

        <button
          onClick={() => setActiveTab('letters')}
          className="p-4 bg-white border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 rounded-2xl text-left transition group shadow-sm"
        >
          <FileSignature className="w-5 h-5 text-purple-600 mb-2 group-hover:scale-110 transition" />
          <h4 className="font-bold text-slate-900 text-sm">Company Letterpad</h4>
          <p className="text-xs text-slate-500">Official business letters</p>
        </button>
      </div>

      {/* Recent Documents Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recent Bills & Quotations</h3>
            <p className="text-xs text-slate-500">Latest documents generated by DK Enterprise</p>
          </div>
          <button
            onClick={() => setActiveTab('documents')}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            View All Bills <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Document #</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.recentDocs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No documents created yet. Click "+ Tax Invoice" or "+ Labour Bill" above!
                  </td>
                </tr>
              ) : (
                stats.recentDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-semibold">
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
                    <td className="py-3.5 px-4 text-slate-500 text-xs">{doc.doc_date}</td>
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
                      <button
                        onClick={() => onViewDocument(doc.id)}
                        className="inline-flex items-center px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> View / Print
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
