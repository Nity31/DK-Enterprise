import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Building2, 
  Landmark, 
  FileText, 
  Save, 
  CheckCircle2,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

export default function CompanySettings() {
  const [formData, setFormData] = useState({
    name: 'DK Enterprise',
    tagline: 'Hydraulic Machinery, Spare Parts & Servicing Specialists',
    gstin: '',
    address: '',
    phone: '',
    email: '',
    bank_name: '',
    account_no: '',
    ifsc_code: '',
    upi_id: '',
    terms_conditions: ''
  });
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchCompanyInfo();
  }, []);

  const fetchCompanyInfo = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/company');
      if (res.data) setFormData(res.data);
    } catch (err) {
      console.error('Failed to load company info:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    try {
      setLoading(true);
      await axios.put('/api/company', formData);
      setSuccessMsg('DK Enterprise Profile and Bank Details updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert('Failed to update company settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.name) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">DK Enterprise Profile & Bank Details</h2>
          <p className="text-xs text-slate-500">Configure your company header, GSTIN, Bank details for payment, and terms.</p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition shadow-md flex items-center gap-1.5"
        >
          <Save className="w-4 h-4" /> Save Profile
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Business Basic Details */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-sky-600" /> Business Identity & GSTIN
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Company / Business Name *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
              placeholder="e.g. DK Enterprise"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Business Tagline / Subtitle</label>
            <input
              type="text"
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              placeholder="e.g. Hydraulic Machinery, Spare Parts & Servicing Specialists"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Your GSTIN Number *</label>
            <input
              type="text"
              name="gstin"
              required
              value={formData.gstin}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono uppercase font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
              placeholder="27AAACD9988E1Z4"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Contact Phone Numbers</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              placeholder="+91 98200 99887"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Official Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              placeholder="contact@dkenterprise.in"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Business Address</label>
            <textarea
              rows="2"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              placeholder="Plot No., Industrial Area, MIDC, City - Pincode"
            />
          </div>
        </div>
      </div>

      {/* Bank Account Payment Details */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
          <Landmark className="w-4 h-4 text-sky-600" /> Bank Payment Details (Printed on Invoices & Quotations)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Bank Name</label>
            <input
              type="text"
              name="bank_name"
              value={formData.bank_name}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              placeholder="HDFC Bank"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Bank Account Number</label>
            <input
              type="text"
              name="account_no"
              value={formData.account_no}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
              placeholder="50200012345678"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">IFSC Code</label>
            <input
              type="text"
              name="ifsc_code"
              value={formData.ifsc_code}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono uppercase font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
              placeholder="HDFC0001234"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">UPI ID (Optional)</label>
            <input
              type="text"
              name="upi_id"
              value={formData.upi_id}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
              placeholder="dkenterprise@hdfcbank"
            />
          </div>
        </div>
      </div>

      {/* Default Terms & Conditions */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-sky-600" /> Default Terms & Conditions
        </h3>

        <div className="text-xs">
          <textarea
            rows="5"
            name="terms_conditions"
            value={formData.terms_conditions}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-xl p-3 text-xs font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
            placeholder="1. Goods once sold will not be taken back..."
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold rounded-xl transition shadow-lg flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Save DK Enterprise Profile
        </button>
      </div>
    </form>
  );
}
