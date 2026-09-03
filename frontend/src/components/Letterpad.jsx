import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileSignature, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Printer, 
  ArrowLeft, 
  Building2, 
  Calendar,
  Sliders,
  Wrench,
  CheckCircle2
} from 'lucide-react';

export default function Letterpad() {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Mode: 'list', 'form', 'print'
  const [mode, setMode] = useState('list');
  const [selectedLetter, setSelectedLetter] = useState(null);

  // Form State
  const [editId, setEditId] = useState(null);
  const [refNumber, setRefNumber] = useState('');
  const [letterDate, setLetterDate] = useState(new Date().toISOString().split('T')[0]);
  const [recipientName, setRecipientName] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [signatoryName, setSignatoryName] = useState('Proprietor / Authorized Signatory');

  // Letterhead Print Options
  const [useLetterheadMode, setUseLetterheadMode] = useState(false);
  const [headerMarginTop, setHeaderMarginTop] = useState(180);

  useEffect(() => {
    fetchLetters();
  }, []);

  const fetchLetters = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/letters');
      setLetters(res.data);
    } catch (err) {
      console.error('Failed to fetch letters:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNew = async () => {
    setEditId(null);
    setRecipientName('');
    setRecipientAddress('');
    setSubject('');
    setBody('Dear Sir/Madam,\n\nWe are writing with reference to...');
    setSignatoryName('Proprietor / Authorized Signatory');
    try {
      const res = await axios.get('/api/letters/next-number');
      setRefNumber(res.data.ref_number);
    } catch (e) {
      setRefNumber(`DKE/LTR/${new Date().getFullYear()}/001`);
    }
    setMode('form');
  };

  const handleOpenEdit = (ltr) => {
    setEditId(ltr.id);
    setRefNumber(ltr.ref_number);
    setLetterDate(ltr.letter_date);
    setRecipientName(ltr.recipient_name);
    setRecipientAddress(ltr.recipient_address || '');
    setSubject(ltr.subject);
    setBody(ltr.body);
    setSignatoryName(ltr.signatory_name || 'Proprietor');
    setMode('form');
  };

  const handleOpenPrint = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/letters/${id}`);
      setSelectedLetter(res.data);
      setMode('print');
    } catch (err) {
      alert('Failed to load letter details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ref_number: refNumber,
        letter_date: letterDate,
        recipient_name: recipientName,
        recipient_address: recipientAddress,
        subject,
        body,
        signatory_name: signatoryName
      };

      if (editId) {
        await axios.put(`/api/letters/${editId}`, payload);
      } else {
        const res = await axios.post('/api/letters', payload);
        handleOpenPrint(res.data.id);
        fetchLetters();
        return;
      }

      fetchLetters();
      setMode('list');
    } catch (err) {
      alert('Failed to save letter: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id, refNum) => {
    if (window.confirm(`Delete letter ref ${refNum}?`)) {
      try {
        await axios.delete(`/api/letters/${id}`);
        fetchLetters();
      } catch (err) {
        alert('Failed to delete letter: ' + err.message);
      }
    }
  };

  const filteredLetters = letters.filter(l =>
    l.recipient_name.toLowerCase().includes(search.toLowerCase()) ||
    l.subject.toLowerCase().includes(search.toLowerCase()) ||
    l.ref_number.toLowerCase().includes(search.toLowerCase())
  );

  if (mode === 'form') {
    return (
      <form onSubmit={handleSave} className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {editId ? 'Edit Official Letter' : 'Create Company Letter / Notice'}
            </h2>
            <p className="text-xs text-slate-500">Draft official correspondence on DK Enterprise letterhead.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode('list')}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md"
            >
              Save & Preview Letterhead
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Ref Number *</label>
              <input
                type="text"
                required
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                className="w-full border border-slate-300 font-mono font-bold rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Letter Date *</label>
              <input
                type="date"
                required
                value={letterDate}
                onChange={(e) => setLetterDate(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Signatory Title</label>
              <input
                type="text"
                value={signatoryName}
                onChange={(e) => setSignatoryName(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="Proprietor / Director"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Recipient Name / Company *</label>
              <input
                type="text"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="e.g. Mahindra Infrastructure Ltd"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Recipient Address</label>
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="City, State"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block font-bold text-slate-700 mb-1">Subject Line *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="e.g. Work Completion & Warranty Certificate for Hydraulic Power Pack"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block font-bold text-slate-700 mb-1">Letter Body Content *</label>
              <textarea
                rows="10"
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-3 text-xs leading-relaxed focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="Write your letter content here..."
              />
            </div>
          </div>
        </div>
      </form>
    );
  }

  if (mode === 'print' && selectedLetter) {
    const company = selectedLetter.company || {};
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Print Control Bar */}
        <div className="no-print bg-slate-900 text-white p-5 rounded-2xl shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <button
              onClick={() => setMode('list')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Letters
            </button>

            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF Letterhead
            </button>
          </div>

          {/* Letterhead Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-amber-400">Paper Print Mode:</span>
              <div className="flex bg-slate-900 p-1 rounded-lg">
                <button
                  onClick={() => setUseLetterheadMode(false)}
                  className={`px-3 py-1 rounded-md font-bold transition ${
                    !useLetterheadMode ? 'bg-sky-600 text-white' : 'text-slate-400'
                  }`}
                >
                  🖨️ Digital Header (DK Enterprise)
                </button>
                <button
                  onClick={() => setUseLetterheadMode(true)}
                  className={`px-3 py-1 rounded-md font-bold transition ${
                    useLetterheadMode ? 'bg-amber-600 text-white' : 'text-slate-400'
                  }`}
                >
                  📜 Pre-Printed Letter Pad
                </button>
              </div>
            </div>

            {useLetterheadMode && (
              <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-lg border border-slate-700">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Top Space:</span>
                <select
                  value={headerMarginTop}
                  onChange={(e) => setHeaderMarginTop(Number(e.target.value))}
                  className="bg-slate-800 text-amber-300 font-bold px-2 py-0.5 rounded border border-slate-700"
                >
                  <option value={120}>1.5 in (120px)</option>
                  <option value={180}>2.2 in (180px)</option>
                  <option value={240}>2.8 in (240px)</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Printable A4 Letterhead */}
        <div className="print-area bg-white p-10 rounded-2xl border border-slate-300 shadow-xl text-slate-900 font-sans min-h-[900px]">
          {useLetterheadMode ? (
            <div style={{ height: `${headerMarginTop}px` }} className="w-full border-b border-dashed border-slate-300 no-print flex items-center justify-center">
              <span className="text-xs text-amber-600 font-bold bg-amber-50 px-3 py-1 rounded">
                📜 Pre-printed Letterhead Top Blank Space ({headerMarginTop}px)
              </span>
            </div>
          ) : (
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5 mb-6">
              <div className="flex items-start space-x-3">
                <img 
                  src="/dk_logo.png" 
                  alt="DK Enterprise Logo" 
                  className="h-12 w-auto object-contain"
                />
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                    {company.name || 'DK Enterprise'}
                  </h1>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">
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

          {/* Date & Ref */}
          <div className="flex justify-between items-center text-xs font-mono font-bold border-b border-slate-200 pb-3 mb-6">
            <span>Ref: {selectedLetter.ref_number}</span>
            <span>Date: {selectedLetter.letter_date}</span>
          </div>

          {/* Recipient */}
          <div className="mb-6 text-xs leading-relaxed">
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">TO:</p>
            <h3 className="text-sm font-bold text-slate-900">{selectedLetter.recipient_name}</h3>
            {selectedLetter.recipient_address && (
              <p className="text-slate-600 whitespace-pre-line">{selectedLetter.recipient_address}</p>
            )}
          </div>

          {/* Subject */}
          <div className="mb-6 bg-slate-50 p-3 rounded-lg border-l-4 border-slate-900 text-xs">
            <span className="font-bold text-slate-900 uppercase">SUBJECT: </span>
            <span className="font-bold text-slate-900 underline">{selectedLetter.subject}</span>
          </div>

          {/* Letter Body */}
          <div className="text-xs leading-relaxed text-slate-800 whitespace-pre-line min-h-[300px] mb-12">
            {selectedLetter.body}
          </div>

          {/* Signatory */}
          <div className="flex justify-between items-end border-t border-slate-200 pt-8 text-xs">
            <div>
              <p className="text-slate-400 text-[10px]">DK Enterprise Official Letterhead</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-900 mb-12">For DK Enterprise</p>
              <p className="border-t border-slate-400 pt-1 px-8 font-semibold text-slate-700">
                {selectedLetter.signatory_name || 'Authorized Signatory'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">DK Enterprise Official Letterpad</h2>
          <p className="text-xs text-slate-500">Draft, store, and print official letters, warranty certificates, and notices.</p>
        </div>
        <button
          onClick={handleOpenNew}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" /> + Create New Letter
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by recipient name, ref number, or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-xs rounded-xl pl-9 pr-4 py-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Letters List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-2"></div>
            Loading letters...
          </div>
        ) : filteredLetters.length === 0 ? (
          <div className="p-12 text-center">
            <FileSignature className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No letters created yet</h3>
            <p className="text-xs text-slate-500 mt-1">Click "+ Create New Letter" to issue official company correspondence.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Ref Number</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Recipient Name</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLetters.map((ltr) => (
                  <tr key={ltr.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{ltr.ref_number}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">{ltr.letter_date}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{ltr.recipient_name}</td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-700 max-w-xs truncate">{ltr.subject}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleOpenPrint(ltr.id)}
                          className="p-1.5 bg-slate-100 hover:bg-sky-100 hover:text-sky-700 text-slate-600 rounded-lg transition"
                          title="Print Letterhead"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(ltr)}
                          className="p-1.5 bg-slate-100 hover:bg-amber-100 hover:text-amber-700 text-slate-600 rounded-lg transition"
                          title="Edit Letter"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(ltr.id, ltr.ref_number)}
                          className="p-1.5 bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-600 rounded-lg transition"
                          title="Delete Letter"
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
