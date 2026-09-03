import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Printer, 
  ArrowLeft, 
  Edit3, 
  RefreshCw, 
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
      {/* Top Action Bar (Hidden during printing) */}
      <div className="no-print bg-slate-900 text-white p-5 rounded-2xl shadow-lg space-y-4 max-w-4xl mx-auto">
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
                📄 Official Bill Book Format (Red Border)
              </button>
              <button
                onClick={() => setUseLetterheadMode(true)}
                className={`px-3 py-1 rounded-md font-bold transition ${
                  useLetterheadMode ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                📜 Pre-Printed Letter Pad Blank
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

      {/* Printable Sheet - Replicating original paper bill book layout from user photo */}
      <div className="print-area bg-white p-6 rounded-xl border-2 border-red-700 shadow-xl max-w-4xl mx-auto text-slate-900 font-sans">
        
        {useLetterheadMode ? (
          <div 
            style={{ height: `${headerMarginTop}px` }} 
            className="w-full flex items-center justify-center border-b border-dashed border-red-300 no-print"
          >
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-md border border-amber-200">
              📜 Pre-printed Letterhead Top Blank Space ({headerMarginTop}px)
            </span>
          </div>
        ) : (
          /* Header Layout - Original Paper Bill Book Header */
          <div className="border-b-2 border-red-700 pb-3 mb-3">
            <div className="grid grid-cols-12 items-start gap-2">
              {/* Left Column: Official Transparent Original Logo */}
              <div className="col-span-3 flex items-center justify-start">
                <img 
                  src="/dk_logo.png" 
                  alt="DK Enterprise Logo" 
                  className="max-h-24 w-auto object-contain"
                />
              </div>

              {/* Center Column: TAX INVOICE + DK ENTERPRISE + GSTIN */}
              <div className="col-span-5 text-center flex flex-col items-center">
                <div className="border-2 border-red-700 rounded-md px-3 py-0.5 mb-1 inline-block">
                  <span className="text-xs font-black text-red-800 tracking-wider uppercase">
                    {doc.doc_type === 'TAX_INVOICE' && 'TAX INVOICE'}
                    {doc.doc_type === 'LABOUR_BILL' && 'TAX INVOICE (LABOUR BILL)'}
                    {doc.doc_type === 'QUOTATION' && 'QUOTATION / PRICE ESTIMATE'}
                  </span>
                </div>
                <h1 className="text-3xl font-black text-[#0C2B59] tracking-tight font-serif uppercase">
                  DK ENTERPRISE
                </h1>
                <p className="text-xs font-black text-slate-900 tracking-wide mt-0.5">
                  GSTIN : <span className="font-mono font-bold text-red-800">{company.gstin || '24CWDPP5055P1Z0'}</span>
                </p>
              </div>

              {/* Right Column: Phone, Tagline, Address, Email */}
              <div className="col-span-4 text-right text-[11px] font-semibold text-slate-800 leading-tight space-y-0.5">
                <p className="font-bold text-red-800">(M) {company.phone || '9925802443'}</p>
                <p className="font-bold text-[#0C2B59]">{company.tagline || 'Sales and Service Hydraulic Spare'}</p>
                <p className="text-[10px] text-slate-700 whitespace-pre-line leading-tight">
                  {company.address || 'C-506, Pratishtha Sky, B/h Ashirwad Avenue, Opp. Shailby Hospital, Hari Darshan Cross Road, Naroda, Ahmedabad-382330'}
                </p>
                <p className="text-[10px] text-slate-700">E-mail : {company.email || 'patel.kv75@gmail.com'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Customer & Document Info Red Bordered Grid */}
        <div className="border-2 border-red-700 rounded text-xs mb-3">
          <div className="grid grid-cols-12 divide-x-2 divide-red-700">
            {/* Customer Details Box */}
            <div className="col-span-8 p-2.5 space-y-1">
              <div className="flex items-start">
                <span className="font-bold text-red-800 w-24 flex-shrink-0">Name :</span>
                <span className="font-bold text-slate-900">{doc.customer_name}</span>
              </div>
              <div className="flex items-start">
                <span className="font-bold text-red-800 w-24 flex-shrink-0">Add. :</span>
                <span className="text-slate-800 whitespace-pre-line">{doc.customer_address}</span>
              </div>
              <div className="flex items-center">
                <span className="font-bold text-red-800 w-24 flex-shrink-0">PARTY GST :</span>
                <span className="font-mono font-bold text-slate-900">{doc.customer_gstin || '-'}</span>
              </div>
              <div className="flex items-center">
                <span className="font-bold text-red-800 w-24 flex-shrink-0">Mo. :</span>
                <span className="font-mono text-slate-900">{doc.customer_phone || '-'}</span>
              </div>
            </div>

            {/* Document Reference Box */}
            <div className="col-span-4 p-2.5 space-y-1 divide-y divide-red-200">
              <div className="flex justify-between items-center pb-1">
                <span className="font-bold text-red-800">Date :</span>
                <span className="font-mono font-bold text-slate-900">{doc.doc_date}</span>
              </div>
              <div className="flex justify-between items-center pt-1 pb-1">
                <span className="font-bold text-red-800">Invoice No. :</span>
                <span className="font-mono font-bold text-slate-900">{doc.doc_number}</span>
              </div>
              <div className="flex justify-between items-center pt-1 pb-1">
                <span className="font-bold text-red-800">Challan No. :</span>
                <span className="font-mono text-slate-800">-</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="font-bold text-red-800">P.O. No. :</span>
                <span className="font-mono text-slate-800">-</span>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items Table with Red Borders */}
        <div className="border-2 border-red-700 rounded overflow-hidden mb-3">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-red-50 text-red-900 font-bold uppercase text-[11px] border-b-2 border-red-700">
              <tr>
                <th className="py-2 px-2.5 w-10 text-center border-r-2 border-red-700">No.</th>
                <th className="py-2 px-3 border-r-2 border-red-700">Description of Goods / Services</th>
                <th className="py-2 px-2.5 w-20 text-center border-r-2 border-red-700">HSN Code</th>
                <th className="py-2 px-2.5 w-24 text-center border-r-2 border-red-700">Quantity</th>
                <th className="py-2 px-2.5 w-24 text-right border-r-2 border-red-700">Rate</th>
                <th className="py-2 px-3 w-28 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-200">
              {doc.items && doc.items.map((it, idx) => (
                <tr key={idx} className="hover:bg-red-50/20">
                  <td className="py-2.5 px-2.5 text-center font-bold text-red-800 border-r-2 border-red-700">{idx + 1}</td>
                  <td className="py-2.5 px-3 border-r-2 border-red-700 font-semibold text-slate-900 whitespace-pre-line">
                    {it.description}
                  </td>
                  <td className="py-2.5 px-2.5 border-r-2 border-red-700 text-center font-mono text-slate-700">
                    {it.hsn_sac || '-'}
                  </td>
                  <td className="py-2.5 px-2.5 border-r-2 border-red-700 text-center font-bold text-slate-900">
                    {it.qty} {it.unit}
                  </td>
                  <td className="py-2.5 px-2.5 border-r-2 border-red-700 text-right font-mono">
                    {it.rate.toFixed(2)}/-
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    {it.taxable_amount.toFixed(2)}/-
                  </td>
                </tr>
              ))}
              {/* Padding rows to maintain classic bill book height */}
              {Array.from({ length: Math.max(0, 4 - (doc.items?.length || 0)) }).map((_, i) => (
                <tr key={`empty-${i}`}>
                  <td className="py-3 border-r-2 border-red-700">&nbsp;</td>
                  <td className="py-3 border-r-2 border-red-700">&nbsp;</td>
                  <td className="py-3 border-r-2 border-red-700">&nbsp;</td>
                  <td className="py-3 border-r-2 border-red-700">&nbsp;</td>
                  <td className="py-3 border-r-2 border-red-700">&nbsp;</td>
                  <td className="py-3">&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Tax Table */}
        <div className="grid grid-cols-12 gap-3 mb-3 text-xs">
          <div className="col-span-7 flex flex-col justify-between space-y-2">
            <div className="p-2.5 border-2 border-red-700 rounded bg-red-50/30">
              <span className="font-bold text-red-800 text-[11px] block">Amount in Words :</span>
              <span className="font-bold text-slate-900 italic">{numToWords(doc.total_amount)}</span>
            </div>

            {doc.notes && (
              <div className="p-2 border border-red-300 rounded text-[11px]">
                <span className="font-bold text-red-800 block">Work / Job Notes:</span>
                <span className="text-slate-800 whitespace-pre-line">{doc.notes}</span>
              </div>
            )}
          </div>

          <div className="col-span-5 border-2 border-red-700 rounded divide-y divide-red-200">
            <div className="flex justify-between p-2 font-bold text-slate-900">
              <span className="text-red-800">Total :</span>
              <span className="font-mono">{formatCurrency(doc.subtotal)}/-</span>
            </div>

            <div className="flex justify-between p-2 text-slate-700">
              <span>Courier & Other Charges :</span>
              <span className="font-mono">0.00/-</span>
            </div>

            {!doc.is_igst ? (
              <>
                <div className="flex justify-between p-2 text-slate-800">
                  <span className="font-semibold text-red-800">SGST 9% :</span>
                  <span className="font-mono font-semibold">{formatCurrency(doc.sgst_total)}/-</span>
                </div>
                <div className="flex justify-between p-2 text-slate-800">
                  <span className="font-semibold text-red-800">CGST 9% :</span>
                  <span className="font-mono font-semibold">{formatCurrency(doc.cgst_total)}/-</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between p-2 text-slate-800">
                <span className="font-semibold text-red-800">IGST 18% :</span>
                <span className="font-mono font-semibold">{formatCurrency(doc.igst_total)}/-</span>
              </div>
            )}

            <div className="flex justify-between p-2 bg-red-50 text-red-950 font-black text-sm border-t-2 border-red-700">
              <span>TOTAL :</span>
              <span className="font-mono text-base">{formatCurrency(doc.total_amount)}/-</span>
            </div>
          </div>
        </div>

        {/* Footer Terms & Authorized Signature */}
        <div className="border-t-2 border-red-700 pt-3 text-[10px]">
          <div className="grid grid-cols-12 items-end gap-2">
            {/* Terms List */}
            <div className="col-span-8 space-y-0.5 text-slate-800 font-medium">
              <span className="font-bold text-red-800 block text-xs">Terms:</span>
              <p>1. Complain Any Should Be Issued Within A Week Time From The Date of Receipt of Goods,</p>
              <p>2. Goods once Sold will not be Taken Back Or Exchange.</p>
              <p>3. Subject to Ahmedabad Jurisdiction</p>
              <p className="font-bold">E.&O.E.</p>
            </div>

            {/* Authorized Signature Box */}
            <div className="col-span-4 text-right font-bold space-y-8">
              <p className="text-slate-900">For : {company.name || 'DK ENTERPRISE'}</p>
              <div className="text-center inline-block">
                <div className="border-t-2 border-red-700 pt-1 px-4 text-red-900 text-xs uppercase font-extrabold">
                  Autho Signature
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
