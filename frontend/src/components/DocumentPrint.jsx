import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Printer, 
  ArrowLeft, 
  Edit3, 
  RefreshCw, 
  Building2, 
  Landmark, 
  Wrench,
  FileText,
  Sliders,
  Truck
} from 'lucide-react';

function numToWords(num) {
  if (!num) return 'Zero Rupees Only';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n) {
    if ((n = n.toString()).length > 9) return 'overflow';
    let n_arr = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n_arr) return '';
    let str = '';
    str += (n_arr[1] != 0) ? (a[Number(n_arr[1])] || b[n_arr[1][0]] + ' ' + a[n_arr[1][1]]) + 'Crore ' : '';
    str += (n_arr[2] != 0) ? (a[Number(n_arr[2])] || b[n_arr[2][0]] + ' ' + a[n_arr[2][1]]) + 'Lakh ' : '';
    str += (n_arr[3] != 0) ? (a[Number(n_arr[3])] || b[n_arr[3][0]] + ' ' + a[n_arr[3][1]]) + 'Thousand ' : '';
    str += (n_arr[4] != 0) ? (a[Number(n_arr[4])] || b[n_arr[4][0]] + ' ' + a[n_arr[4][1]]) + 'Hundred ' : '';
    str += (n_arr[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n_arr[5])] || b[n_arr[5][0]] + ' ' + a[n_arr[5][1]]) : '';
    return str;
  }

  const rounded = Math.floor(num);
  const words = inWords(rounded);
  return `Rupees ${words.trim()} Only`;
}

export default function DocumentPrint({ docId, onBack, onEdit, onConverted, onCreateEWayBill }) {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  const [useLetterheadMode, setUseLetterheadMode] = useState(false);
  const [headerMarginTop, setHeaderMarginTop] = useState(180);

  useEffect(() => {
    fetchDocDetails();
  }, [docId]);

  const fetchDocDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/documents/${docId}`);
      setDoc(res.data);
    } catch (err) {
      alert('Failed to load document: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleConvert = async () => {
    const choice = window.prompt(
      `Convert Quotation ${doc.doc_number}:\nType "1" for Tax Invoice\nType "2" for Labour Bill`,
      "1"
    );
    if (!choice) return;

    const targetType = choice === "2" ? "LABOUR_BILL" : "TAX_INVOICE";
    try {
      const res = await axios.post(`/api/documents/${doc.id}/convert`, { target_type: targetType });
      alert(`Successfully converted! Generated: ${res.data.newInvoiceNumber}`);
      onConverted(res.data.newDocId);
    } catch (err) {
      alert('Failed to convert quotation: ' + err.message);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val || 0);
  };

  if (loading || !doc) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  const company = doc.company || {};

  return (
    <div className="space-y-6">
      {/* Top Action & Letterhead Options Control Bar (Hidden during printing) */}
      <div className="no-print bg-slate-900 text-white p-5 rounded-2xl shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <button
            onClick={onBack}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to List
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {doc.doc_type !== 'QUOTATION' && (
              <button
                onClick={() => onCreateEWayBill(doc.id)}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                <Truck className="w-4 h-4" /> Create E-Way Bill
              </button>
            )}

            {doc.doc_type === 'QUOTATION' && doc.status !== 'Converted' && (
              <button
                onClick={handleConvert}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                <RefreshCw className="w-4 h-4" /> Convert to Invoice / Labour Bill
              </button>
            )}

            <button
              onClick={() => onEdit(doc.id)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
            >
              <Edit3 className="w-4 h-4" /> Edit
            </button>

            <button
              onClick={handlePrint}
              className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
          </div>
        </div>

        {/* Letterhead Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-sky-400 flex items-center gap-1">
              <FileText className="w-4 h-4" /> Paper Print Mode:
            </span>
            <div className="flex bg-slate-900 p-1 rounded-lg">
              <button
                onClick={() => setUseLetterheadMode(false)}
                className={`px-3 py-1 rounded-md font-bold transition ${
                  !useLetterheadMode ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                🖨️ Digital Header (Plain Paper)
              </button>
              <button
                onClick={() => setUseLetterheadMode(true)}
                className={`px-3 py-1 rounded-md font-bold transition ${
                  useLetterheadMode ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                📜 Pre-Printed Letter Pad
              </button>
            </div>
          </div>

          {useLetterheadMode && (
            <div className="flex items-center gap-3 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300 font-medium">Top Space:</span>
              <select
                value={headerMarginTop}
                onChange={(e) => setHeaderMarginTop(Number(e.target.value))}
                className="bg-slate-800 text-amber-300 font-bold px-2 py-0.5 rounded border border-slate-700 focus:outline-none"
              >
                <option value={120}>Small (1.5 in / 120px)</option>
                <option value={180}>Medium (2.2 in / 180px)</option>
                <option value={240}>Large (2.8 in / 240px)</option>
                <option value={300}>Extra Large (3.5 in / 300px)</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Printable Sheet (A4 format) */}
      <div className="print-area bg-white p-8 rounded-2xl border border-slate-300 shadow-xl max-w-4xl mx-auto text-slate-900 font-sans">
        
        {useLetterheadMode ? (
          <div 
            style={{ height: `${headerMarginTop}px` }} 
            className="w-full flex items-center justify-center border-b border-dashed border-slate-300 no-print"
          >
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-md border border-amber-200">
              📜 Pre-printed Letterhead Top Blank Space ({headerMarginTop}px) - Will print content below your physical letter pad header
            </span>
          </div>
        ) : (
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
            <div className="flex items-start space-x-3">
              <div className="bg-gradient-to-br from-sky-500 to-blue-700 text-white px-3.5 py-2 rounded-xl font-black text-2xl tracking-tight shadow-md">
                DK
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                  {company.name || 'DK Enterprise'}
                </h1>
                <p className="text-xs font-medium text-slate-600 mt-0.5">
                  {company.tagline || 'Hydraulic Machinery, Spare Parts & Servicing Specialists'}
                </p>
                <p className="text-xs text-slate-600 mt-1 max-w-md">
                  {company.address}
                </p>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">
                  Phone: {company.phone} | Email: {company.email}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-lg text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">GSTIN NUMBER</span>
                <span className="text-sm font-mono font-bold text-slate-900">{company.gstin}</span>
              </div>
            </div>
          </div>
        )}

        {/* Document Title Banner */}
        <div className="my-5 bg-slate-900 text-white py-2 px-4 rounded-lg flex items-center justify-between">
          <h2 className="text-lg font-black tracking-wider uppercase">
            {doc.doc_type === 'TAX_INVOICE' && 'TAX INVOICE'}
            {doc.doc_type === 'LABOUR_BILL' && 'TAX INVOICE - LABOUR & SERVICES BILL'}
            {doc.doc_type === 'QUOTATION' && 'QUOTATION / PRICE ESTIMATE'}
          </h2>
          <span className="text-xs font-mono font-semibold bg-slate-800 px-3 py-1 rounded">
            {doc.doc_type === 'TAX_INVOICE' && `INVOICE #: ${doc.doc_number}`}
            {doc.doc_type === 'LABOUR_BILL' && `LABOUR BILL #: ${doc.doc_number}`}
            {doc.doc_type === 'QUOTATION' && `QUOTATION #: ${doc.doc_number}`}
          </span>
        </div>

        {/* Billed To & Document Details Box */}
        <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6 text-xs">
          <div>
            <h3 className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">
              BILLED TO / CUSTOMER:
            </h3>
            <h4 className="text-sm font-bold text-slate-900">{doc.customer_name}</h4>
            {doc.customer_gstin && (
              <p className="font-mono font-bold text-slate-700 mt-0.5">
                GSTIN: <span className="text-slate-900">{doc.customer_gstin}</span>
              </p>
            )}
            <p className="text-slate-600 mt-1 whitespace-pre-line">{doc.customer_address}</p>
            {doc.customer_phone && <p className="text-slate-600 mt-0.5">Ph: {doc.customer_phone}</p>}
          </div>

          <div className="space-y-1.5 text-right font-medium">
            <div className="flex justify-between">
              <span className="text-slate-500">Date:</span>
              <span className="font-bold font-mono">{doc.doc_date}</span>
            </div>
            {doc.valid_till_date && (
              <div className="flex justify-between">
                <span className="text-slate-500">
                  {doc.doc_type === 'QUOTATION' ? 'Valid Till:' : 'Due Date:'}
                </span>
                <span className="font-bold font-mono">{doc.valid_till_date}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Tax Scheme:</span>
              <span className="font-bold">{doc.is_igst ? 'IGST (Inter-state)' : 'CGST + SGST (Intra-state)'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="font-bold uppercase text-slate-900">{doc.status}</span>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="border border-slate-300 rounded-xl overflow-hidden mb-6">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-bold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3 w-8 border-r border-slate-700">#</th>
                <th className="py-2.5 px-3 border-r border-slate-700">
                  {doc.doc_type === 'LABOUR_BILL' ? 'Description of Labour Work / Repair Service' : 'Description of Goods / Services'}
                </th>
                <th className="py-2.5 px-3 w-20 border-r border-slate-700 text-center">HSN/SAC</th>
                <th className="py-2.5 px-3 w-16 border-r border-slate-700 text-center">Qty</th>
                <th className="py-2.5 px-3 w-16 border-r border-slate-700 text-center">Unit</th>
                <th className="py-2.5 px-3 w-24 border-r border-slate-700 text-right">Rate (₹)</th>
                <th className="py-2.5 px-3 w-24 border-r border-slate-700 text-right">Taxable (₹)</th>
                <th className="py-2.5 px-3 w-14 border-r border-slate-700 text-center">GST</th>
                <th className="py-2.5 px-3 w-24 text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {doc.items && doc.items.map((it, idx) => (
                <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                  <td className="py-3 px-3 border-r border-slate-200 text-center font-semibold">{idx + 1}</td>
                  <td className="py-3 px-3 border-r border-slate-200 font-semibold text-slate-900 whitespace-pre-line">
                    {it.description}
                  </td>
                  <td className="py-3 px-3 border-r border-slate-200 text-center font-mono font-medium text-slate-600">
                    {it.hsn_sac || '-'}
                  </td>
                  <td className="py-3 px-3 border-r border-slate-200 text-center font-bold text-slate-900">{it.qty}</td>
                  <td className="py-3 px-3 border-r border-slate-200 text-center text-slate-600">{it.unit}</td>
                  <td className="py-3 px-3 border-r border-slate-200 text-right font-mono">{it.rate.toFixed(2)}</td>
                  <td className="py-3 px-3 border-r border-slate-200 text-right font-mono font-semibold">{it.taxable_amount.toFixed(2)}</td>
                  <td className="py-3 px-3 border-r border-slate-200 text-center font-bold">{it.gst_rate}%</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">{it.total_amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Summary & Amount in Words */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          <div className="col-span-7 space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">AMOUNT IN WORDS</span>
              <p className="font-bold text-slate-900 italic mt-0.5">{numToWords(doc.total_amount)}</p>
            </div>

            {doc.notes && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">WORK / JOB NOTES</span>
                <p className="text-slate-700 mt-0.5 whitespace-pre-line">{doc.notes}</p>
              </div>
            )}
          </div>

          <div className="col-span-5 text-xs border border-slate-300 rounded-xl overflow-hidden">
            <div className="flex justify-between p-2.5 border-b border-slate-200 bg-slate-50">
              <span className="font-semibold text-slate-600">Subtotal (Taxable):</span>
              <span className="font-mono font-bold">{formatCurrency(doc.subtotal)}</span>
            </div>

            {!doc.is_igst ? (
              <>
                <div className="flex justify-between p-2.5 border-b border-slate-200">
                  <span className="text-slate-600">CGST Amount:</span>
                  <span className="font-mono font-semibold">{formatCurrency(doc.cgst_total)}</span>
                </div>
                <div className="flex justify-between p-2.5 border-b border-slate-200">
                  <span className="text-slate-600">SGST Amount:</span>
                  <span className="font-mono font-semibold">{formatCurrency(doc.sgst_total)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between p-2.5 border-b border-slate-200">
                <span className="text-slate-600">IGST Amount:</span>
                <span className="font-mono font-semibold">{formatCurrency(doc.igst_total)}</span>
              </div>
            )}

            {doc.discount > 0 && (
              <div className="flex justify-between p-2.5 border-b border-slate-200 text-rose-600 font-semibold">
                <span>Discount:</span>
                <span className="font-mono">- {formatCurrency(doc.discount)}</span>
              </div>
            )}

            <div className="flex justify-between p-3 bg-slate-900 text-white font-bold text-sm">
              <span>Grand Total:</span>
              <span className="font-mono text-base">{formatCurrency(doc.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Bank Details & Terms Footer */}
        <div className="grid grid-cols-2 gap-6 border-t-2 border-slate-900 pt-5 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wider mb-2">
              <Landmark className="w-4 h-4 text-sky-600" /> Bank Payment Details
            </h4>
            <div className="space-y-1 font-mono text-[11px] text-slate-700">
              <p><span className="text-slate-500">Bank Name:</span> <strong>{company.bank_name || 'KOTAK MAHINDRA BANK'}</strong></p>
              <p><span className="text-slate-500">Account No:</span> <strong>{company.account_no || '5448285750'}</strong></p>
              <p><span className="text-slate-500">IFSC Code:</span> <strong>{company.ifsc_code || 'KKBK0000159'}</strong></p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Terms & Conditions</h4>
            <p className="text-[10px] text-slate-600 whitespace-pre-line leading-relaxed">
              {doc.terms || company.terms_conditions}
            </p>
          </div>
        </div>

        {/* Signature Box */}
        <div className="flex items-end justify-between border-t border-slate-200 mt-8 pt-8 text-xs">
          <div>
            <p className="text-slate-500 text-[10px]">E. & O. E.</p>
            <p className="text-slate-400 text-[10px]">Thank you for your business!</p>
          </div>

          <div className="text-center font-semibold">
            <p className="text-slate-900 font-bold mb-12">For {company.name || 'DK Enterprise'}</p>
            <div className="border-t border-slate-400 pt-1 px-8 text-slate-600 text-[11px]">
              Authorized Signatory
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
