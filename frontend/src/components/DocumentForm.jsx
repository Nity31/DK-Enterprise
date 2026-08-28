import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Trash2, 
  Save, 
  X, 
  Calculator, 
  UserPlus, 
  AlertCircle,
  Hammer
} from 'lucide-react';

export default function DocumentForm({ editDocId, initialType = 'TAX_INVOICE', onSaveSuccess, onCancel }) {
  const [docType, setDocType] = useState(initialType);
  const [docNumber, setDocNumber] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [docDate, setDocDate] = useState(new Date().toISOString().split('T')[0]);
  const [validTillDate, setValidTillDate] = useState('');
  const [status, setStatus] = useState('Unpaid');
  const [isIgst, setIsIgst] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');

  // Line items
  const [items, setItems] = useState([
    { description: '', hsn_sac: docType === 'LABOUR_BILL' ? '998719' : '', qty: 1, unit: docType === 'LABOUR_BILL' ? 'Job' : 'Nos', rate: 0, gst_rate: 18 }
  ]);

  // Customer & Company state
  const [customers, setCustomers] = useState([]);
  const [companyInfo, setCompanyInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Quick Customer Modal
  const [showQuickCustomer, setShowQuickCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustGstin, setNewCustGstin] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');

  useEffect(() => {
    loadInitialData();
  }, [editDocId, docType]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [custRes, companyRes] = await Promise.all([
        axios.get('/api/customers'),
        axios.get('/api/company')
      ]);

      setCustomers(custRes.data);
      setCompanyInfo(companyRes.data);

      if (editDocId) {
        // Fetch document details for editing
        const docRes = await axios.get(`/api/documents/${editDocId}`);
        const doc = docRes.data;
        setDocType(doc.doc_type);
        setDocNumber(doc.doc_number);
        setCustomerId(doc.customer_id);
        setDocDate(doc.doc_date);
        setValidTillDate(doc.valid_till_date || '');
        setStatus(doc.status);
        setIsIgst(Boolean(doc.is_igst));
        setDiscount(doc.discount || 0);
        setNotes(doc.notes || '');
        setTerms(doc.terms || '');
        if (doc.items && doc.items.length > 0) {
          setItems(doc.items.map(it => ({
            description: it.description,
            hsn_sac: it.hsn_sac || '',
            qty: it.qty,
            unit: it.unit || 'Nos',
            rate: it.rate,
            gst_rate: it.gst_rate || 18
          })));
        }
      } else {
        // Generate Next Doc Number
        const numRes = await axios.get(`/api/documents/next-number?type=${docType}`);
        setDocNumber(numRes.data.doc_number);
        if (companyRes.data && companyRes.data.terms_conditions) {
          setTerms(companyRes.data.terms_conditions);
        }
      }
    } catch (err) {
      setError('Failed to load form data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDocTypeChange = async (type) => {
    setDocType(type);
    if (!editDocId) {
      try {
        const numRes = await axios.get(`/api/documents/next-number?type=${type}`);
        setDocNumber(numRes.data.doc_number);
        if (type === 'LABOUR_BILL' && items.length === 1 && !items[0].description) {
          setItems([{ description: '', hsn_sac: '998719', qty: 1, unit: 'Job', rate: 0, gst_rate: 18 }]);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Line item handlers
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItemRow = () => {
    const defaultSac = docType === 'LABOUR_BILL' ? '998719' : '';
    const defaultUnit = docType === 'LABOUR_BILL' ? 'Job' : 'Nos';
    setItems([...items, { description: '', hsn_sac: defaultSac, qty: 1, unit: defaultUnit, rate: 0, gst_rate: 18 }]);
  };

  const removeItemRow = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Quick Customer Create
  const handleCreateQuickCustomer = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/customers', {
        name: newCustName,
        gstin: newCustGstin,
        phone: newCustPhone,
        address: newCustAddress
      });
      setCustomers([...customers, res.data]);
      setCustomerId(res.data.id);
      setShowQuickCustomer(false);
      setNewCustName('');
      setNewCustGstin('');
      setNewCustPhone('');
      setNewCustAddress('');
    } catch (err) {
      alert('Failed to add customer: ' + (err.response?.data?.error || err.message));
    }
  };

  // Calculations
  const calculateTotals = () => {
    let subtotal = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    items.forEach(it => {
      const qty = parseFloat(it.qty) || 0;
      const rate = parseFloat(it.rate) || 0;
      const gstRate = parseFloat(it.gst_rate) || 0;
      const taxable = qty * rate;
      const gstAmt = taxable * (gstRate / 100);

      subtotal += taxable;
      if (isIgst) {
        igst += gstAmt;
      } else {
        cgst += gstAmt / 2;
        sgst += gstAmt / 2;
      }
    });

    const disc = parseFloat(discount) || 0;
    const taxTotal = isIgst ? igst : (cgst + sgst);
    const grandTotal = Math.round((subtotal + taxTotal - disc) * 100) / 100;

    return { subtotal, cgst, sgst, igst, taxTotal, grandTotal };
  };

  const totals = calculateTotals();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!customerId) {
      setError('Please select or add a Customer');
      return;
    }
    if (!docNumber) {
      setError('Document Number is required');
      return;
    }
    if (items.some(it => !it.description.trim())) {
      setError('All line items must have a description');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        doc_type: docType,
        doc_number: docNumber,
        customer_id: parseInt(customerId, 10),
        doc_date: docDate,
        valid_till_date: validTillDate || null,
        status: status,
        is_igst: isIgst ? 1 : 0,
        discount: parseFloat(discount) || 0,
        notes,
        terms,
        items
      };

      if (editDocId) {
        await axios.put(`/api/documents/${editDocId}`, payload);
      } else {
        await axios.post('/api/documents', payload);
      }

      onSaveSuccess();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val || 0);
  };

  if (loading && !customers.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {editDocId ? 'Edit Document' : docType === 'TAX_INVOICE' ? 'Create New Tax Invoice' : docType === 'LABOUR_BILL' ? 'Create New Labour Bill with GST' : 'Create New Quotation'}
          </h2>
          <p className="text-xs text-slate-500">
            DK Enterprise - {docType === 'LABOUR_BILL' ? 'Labour & Service Charges Bill with SAC Code 998719' : 'Hydraulic Machinery & Parts GST Invoice'}
          </p>
        </div>

        {/* Document Type Selector Toggle */}
        {!editDocId && (
          <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => handleDocTypeChange('TAX_INVOICE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                docType === 'TAX_INVOICE' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              TAX INVOICE
            </button>

            <button
              type="button"
              onClick={() => handleDocTypeChange('LABOUR_BILL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                docType === 'LABOUR_BILL' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              LABOUR BILL
            </button>

            <button
              type="button"
              onClick={() => handleDocTypeChange('QUOTATION')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                docType === 'QUOTATION' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              QUOTATION
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 text-sm font-medium">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Document Details Grid */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Customer Picker */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Customer / Client <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowQuickCustomer(true)}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" /> + Quick Add Customer
            </button>
          </div>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            required
          >
            <option value="">-- Select Customer --</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.gstin ? `(GST: ${c.gstin})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Document Number */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Doc Number <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={docNumber}
            onChange={(e) => setDocNumber(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-mono font-bold text-sm rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            required
          />
        </div>

        {/* Dates */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Document Date
          </label>
          <input
            type="date"
            value={docDate}
            onChange={(e) => setDocDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            {docType === 'QUOTATION' ? 'Quotation Valid Till' : 'Payment Due Date'}
          </label>
          <input
            type="date"
            value={validTillDate}
            onChange={(e) => setValidTillDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Payment / Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            {docType === 'QUOTATION' ? (
              <>
                <option value="Pending">Pending Approval</option>
                <option value="Accepted">Accepted</option>
                <option value="Converted">Converted</option>
                <option value="Cancelled">Cancelled</option>
              </>
            ) : (
              <>
                <option value="Unpaid">Unpaid</option>
                <option value="Paid">Paid</option>
                <option value="Cancelled">Cancelled</option>
              </>
            )}
          </select>
        </div>

        {/* GST Type Selection (Intra-state vs Inter-state) */}
        <div className="md:col-span-3 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">GST Tax Scheme</span>
            <span className="text-xs text-slate-500">Choose between Intra-state (CGST + SGST) or Inter-state (IGST).</span>
          </div>
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="radio"
                name="gstScheme"
                checked={!isIgst}
                onChange={() => setIsIgst(false)}
                className="w-4 h-4 text-sky-600 focus:ring-sky-500 mr-2"
              />
              CGST + SGST (Same State)
            </label>
            <label className="inline-flex items-center text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="radio"
                name="gstScheme"
                checked={isIgst}
                onChange={() => setIsIgst(true)}
                className="w-4 h-4 text-sky-600 focus:ring-sky-500 mr-2"
              />
              IGST (Other State)
            </label>
          </div>
        </div>
      </div>

      {/* Dynamic Line Items Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            {docType === 'LABOUR_BILL' ? 'Labour Charges & Servicing Items' : 'Hydraulic Line Items & Services'}
          </h3>
          <span className="text-xs text-slate-500">Enter item descriptions, quantities, rates, and GST %</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-8">#</th>
                <th className="py-2.5 px-3">Description of Goods / Labour Work</th>
                <th className="py-2.5 px-3 w-28">HSN/SAC</th>
                <th className="py-2.5 px-3 w-24">Qty</th>
                <th className="py-2.5 px-3 w-24">Unit</th>
                <th className="py-2.5 px-3 w-32">Rate (₹)</th>
                <th className="py-2.5 px-3 w-24">GST %</th>
                <th className="py-2.5 px-3 text-right w-32">Taxable (₹)</th>
                <th className="py-2.5 px-3 text-center w-12">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((it, idx) => {
                const qty = parseFloat(it.qty) || 0;
                const rate = parseFloat(it.rate) || 0;
                const taxable = qty * rate;

                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-500 text-center">{idx + 1}</td>
                    
                    {/* Description */}
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        placeholder={docType === 'LABOUR_BILL' ? 'e.g. Hydraulic Cylinder Servicing & Labour' : 'e.g. Double Acting Cylinder 80x500mm'}
                        value={it.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        required
                      />
                    </td>

                    {/* HSN/SAC */}
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        placeholder="84122100 / 998719"
                        value={it.hsn_sac}
                        onChange={(e) => handleItemChange(idx, 'hsn_sac', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-900 font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      />
                    </td>

                    {/* Qty */}
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        step="any"
                        min="0.01"
                        value={it.qty}
                        onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        required
                      />
                    </td>

                    {/* Unit */}
                    <td className="py-2.5 px-3">
                      <select
                        value={it.unit}
                        onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      >
                        <option value="Nos">Nos</option>
                        <option value="Job">Job</option>
                        <option value="Hours">Hours</option>
                        <option value="Days">Days</option>
                        <option value="Sets">Sets</option>
                        <option value="Mtrs">Mtrs</option>
                        <option value="Kg">Kg</option>
                      </select>
                    </td>

                    {/* Rate */}
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={it.rate}
                        onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        required
                      />
                    </td>

                    {/* GST Rate % */}
                    <td className="py-2.5 px-3">
                      <select
                        value={it.gst_rate}
                        onChange={(e) => handleItemChange(idx, 'gst_rate', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      >
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>
                    </td>

                    {/* Taxable Amount */}
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      ₹{taxable.toFixed(2)}
                    </td>

                    {/* Remove Row */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        disabled={items.length === 1}
                        className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={addItemRow}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 text-sky-600" />
          + Add Line Item
        </button>
      </div>

      {/* Summary Card & Terms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          {/* Notes */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Work Description / Job Notes
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Machine Model #, Site Location, Labour Work Details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-xs rounded-xl p-3 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Terms & Conditions */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Terms & Conditions
            </label>
            <textarea
              rows="4"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-xs rounded-xl p-3 focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Calculation Summary Box */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 border-b border-slate-800 pb-2 mb-4 flex items-center gap-2">
              <Calculator className="w-4 h-4" /> Bill Total Summary
            </h3>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Subtotal (Taxable):</span>
                <span className="font-semibold text-white">{formatCurrency(totals.subtotal)}</span>
              </div>

              {!isIgst ? (
                <>
                  <div className="flex justify-between">
                    <span>CGST Total:</span>
                    <span className="font-semibold text-white">{formatCurrency(totals.cgst)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SGST Total:</span>
                    <span className="font-semibold text-white">{formatCurrency(totals.sgst)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span>IGST Total:</span>
                  <span className="font-semibold text-white">{formatCurrency(totals.igst)}</span>
                </div>
              )}

              {/* Discount Input */}
              <div className="flex justify-between items-center py-1 border-t border-b border-slate-800">
                <span>Discount (₹):</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-24 bg-slate-800 border border-slate-700 text-right text-white font-bold text-xs rounded px-2 py-1 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              {/* Grand Total */}
              <div className="flex justify-between items-center pt-2 text-base font-bold text-white">
                <span className="text-amber-400">Grand Total:</span>
                <span className="text-xl text-emerald-400 font-mono">{formatCurrency(totals.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onCancel}
              className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition text-center"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-1/2 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              Save {docType === 'TAX_INVOICE' ? 'Bill' : docType === 'LABOUR_BILL' ? 'Labour Bill' : 'Quotation'}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Add Customer Modal */}
      {showQuickCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Quick Add New Customer</h3>
              <button onClick={() => setShowQuickCustomer(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer / Company Name *</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  placeholder="e.g. Royal Earthmovers Ltd"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={newCustGstin}
                  onChange={(e) => setNewCustGstin(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs uppercase font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  placeholder="27ABCDE1234F1ZH"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  placeholder="+91 98000 00000"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Address</label>
                <textarea
                  rows="2"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  placeholder="Full billing address..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowQuickCustomer(false)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateQuickCustomer}
                className="px-4 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-bold"
              >
                Save Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
