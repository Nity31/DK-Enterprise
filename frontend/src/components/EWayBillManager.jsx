import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Truck, 
  Plus, 
  Search, 
  Printer, 
  Download, 
  Trash2, 
  X, 
  FileText,
  Building2,
  MapPin,
  Calendar,
  CheckCircle2
} from 'lucide-react';

export default function EWayBillManager({ onViewEWayBill, onNewEWayBillForDocId }) {
  const [ewayBills, setEWayBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(onNewEWayBillForDocId || '');

  // Form Fields
  const [ewbNum, setEwbNum] = useState('');
  const [supplyType, setSupplyType] = useState('Outward');
  const [subSupplyType, setSubSupplyType] = useState('Supply');
  const [transporterId, setTransporterId] = useState('');
  const [transporterName, setTransporterName] = useState('');
  const [transportMode, setTransportMode] = useState('Road');
  const [distanceKm, setDistanceKm] = useState(100);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Regular');
  const [lrNumber, setLrNumber] = useState('');
  const [lrDate, setLrDate] = useState(new Date().toISOString().split('T')[0]);
  const [fromPincode, setFromPincode] = useState('382330');
  const [toPincode, setToPincode] = useState('380001');

  useEffect(() => {
    fetchEWayBills();
    fetchEligibleInvoices();
  }, []);

  useEffect(() => {
    if (onNewEWayBillForDocId) {
      handleOpenCreateModal(onNewEWayBillForDocId);
    }
  }, [onNewEWayBillForDocId]);

  const fetchEWayBills = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/eway-bills');
      setEWayBills(res.data);
    } catch (err) {
      console.error('Failed to fetch E-Way Bills:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEligibleInvoices = async () => {
    try {
      const res = await axios.get('/api/documents');
      // Filter Tax Invoices & Labour Bills
      const eligible = res.data.filter(d => d.doc_type === 'TAX_INVOICE' || d.doc_type === 'LABOUR_BILL');
      setInvoices(eligible);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenCreateModal = async (docIdToPreselect = '') => {
    setSelectedDocId(docIdToPreselect);
    setTransporterId('');
    setTransporterName('');
    setVehicleNumber('');
    setDistanceKm(100);
    setLrNumber('');
    setFromPincode('382330');
    setToPincode('380001');

    try {
      const numRes = await axios.get('/api/eway-bills/next-number');
      setEwbNum(numRes.data.eway_bill_number);
    } catch (e) {
      setEwbNum(`EWB-${new Date().getFullYear()}-1001`);
    }

    if (docIdToPreselect) {
      handleDocSelectChange(docIdToPreselect);
    }

    setShowModal(true);
  };

  const handleDocSelectChange = async (docId) => {
    setSelectedDocId(docId);
    if (!docId) return;
    try {
      const docRes = await axios.get(`/api/documents/${docId}`);
      const doc = docRes.data;
      if (doc.company && doc.company.address) {
        // extract pincode if present
        const match = doc.company.address.match(/\d{6}/);
        if (match) setFromPincode(match[0]);
      }
      if (doc.customer_address) {
        const match = doc.customer_address.match(/\d{6}/);
        if (match) setToPincode(match[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveEWayBill = async (e) => {
    e.preventDefault();
    if (!selectedDocId) {
      alert('Please select an Invoice / Labour Bill');
      return;
    }
    if (!vehicleNumber) {
      alert('Vehicle Number is required');
      return;
    }

    try {
      const doc = invoices.find(d => d.id === parseInt(selectedDocId, 10));
      const payload = {
        eway_bill_number: ewbNum,
        doc_id: parseInt(selectedDocId, 10),
        supply_type: supplyType,
        sub_supply_type: subSupplyType,
        doc_type: doc ? doc.doc_type : 'Tax Invoice',
        doc_number: doc ? doc.doc_number : '',
        doc_date: doc ? doc.doc_date : new Date().toISOString().split('T')[0],
        transporter_id: transporterId,
        transporter_name: transporterName,
        transport_mode: transportMode,
        distance_km: parseInt(distanceKm, 10) || 0,
        vehicle_number: vehicleNumber,
        vehicle_type: vehicleType,
        lr_rr_number: lrNumber,
        lr_rr_date: lrDate,
        from_pincode: fromPincode,
        to_pincode: toPincode,
        total_value: doc ? doc.total_amount : 0
      };

      const res = await axios.post('/api/eway-bills', payload);
      setShowModal(false);
      fetchEWayBills();
      onViewEWayBill(res.data.id);
    } catch (err) {
      alert('Failed to generate E-Way Bill: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id, num) => {
    if (window.confirm(`Are you sure you want to delete E-Way Bill ${num}?`)) {
      try {
        await axios.delete(`/api/eway-bills/${id}`);
        fetchEWayBills();
      } catch (err) {
        alert('Failed to delete E-Way Bill: ' + err.message);
      }
    }
  };

  const handleExportJson = (id, ewbNumber) => {
    window.open(`/api/eway-bills/${id}/json`, '_blank');
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const filtered = ewayBills.filter(e =>
    e.eway_bill_number.toLowerCase().includes(search.toLowerCase()) ||
    e.doc_number.toLowerCase().includes(search.toLowerCase()) ||
    (e.customer_name && e.customer_name.toLowerCase().includes(search.toLowerCase())) ||
    (e.vehicle_number && e.vehicle_number.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-sky-600" /> GST E-Way Bill Manager
          </h2>
          <p className="text-xs text-slate-500">Generate, print transport slips, and export GST portal JSON bulk upload files.</p>
        </div>
        <button
          onClick={() => handleOpenCreateModal('')}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" /> + Generate E-Way Bill
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative">
          <input
            type="text"
            placeholder="Search E-Way Bill #, Invoice #, Vehicle #, Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-xs rounded-xl pl-9 pr-4 py-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* E-Way Bills Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-2"></div>
            Loading E-Way Bills...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No E-Way Bills generated yet</h3>
            <p className="text-xs text-slate-500 mt-1">Click "+ Generate E-Way Bill" to create your first GST transportation slip.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">E-Way Bill #</th>
                  <th className="py-3.5 px-4">Doc #</th>
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4">Vehicle #</th>
                  <th className="py-3.5 px-4">Transporter</th>
                  <th className="py-3.5 px-4 text-center">Distance</th>
                  <th className="py-3.5 px-4 text-right">Value (₹)</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-700">{e.eway_bill_number}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">{e.doc_number}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{e.customer_name}</td>
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block my-2">
                      {e.vehicle_number}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">{e.transporter_name || 'Self / Local Transport'}</td>
                    <td className="py-3.5 px-4 text-center text-xs font-semibold text-slate-700">{e.distance_km} KM</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">{formatCurrency(e.total_value)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* Print Transport Slip */}
                        <button
                          onClick={() => onViewEWayBill(e.id)}
                          className="p-1.5 bg-slate-100 hover:bg-sky-100 hover:text-sky-700 text-slate-600 rounded-lg transition"
                          title="Print E-Way Slip"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Export GST Portal JSON */}
                        <button
                          onClick={() => handleExportJson(e.id, e.eway_bill_number)}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition"
                          title="Download GST Portal Bulk JSON File"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(e.id, e.eway_bill_number)}
                          className="p-1.5 bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-600 rounded-lg transition"
                          title="Delete E-Way Bill"
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

      {/* Generate E-Way Bill Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Truck className="w-5 h-5 text-sky-600" /> Generate New GST E-Way Bill
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEWayBill} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">E-Way Bill Number *</label>
                  <input
                    type="text"
                    required
                    value={ewbNum}
                    onChange={(e) => setEwbNum(e.target.value)}
                    className="w-full border border-slate-300 font-mono font-bold rounded-xl p-2.5 text-xs text-sky-700 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Tax Invoice / Labour Bill *</label>
                  <select
                    value={selectedDocId}
                    onChange={(e) => handleDocSelectChange(e.target.value)}
                    className="w-full border border-slate-300 font-bold rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    required
                  >
                    <option value="">-- Select Bill / Invoice --</option>
                    {invoices.map(inv => (
                      <option key={inv.id} value={inv.id}>
                        {inv.doc_number} ({inv.customer_name} - ₹{inv.total_amount})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vehicle Number *</label>
                  <input
                    type="text"
                    required
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full border border-slate-300 font-mono font-bold text-slate-900 uppercase rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    placeholder="e.g. GJ-01-XX-9988"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Approx Distance (in KM) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(e.target.value)}
                    className="w-full border border-slate-300 font-bold rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    placeholder="150"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Transporter Name</label>
                  <input
                    type="text"
                    value={transporterName}
                    onChange={(e) => setTransporterName(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    placeholder="e.g. VRL Logistics Ltd"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Transporter GSTIN / ID</label>
                  <input
                    type="text"
                    value={transporterId}
                    onChange={(e) => setTransporterId(e.target.value)}
                    className="w-full border border-slate-300 font-mono uppercase rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    placeholder="27AAACT1234T1Z2"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Transport Mode</label>
                  <select
                    value={transportMode}
                    onChange={(e) => setTransportMode(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="Road">Road</option>
                    <option value="Rail">Rail</option>
                    <option value="Air">Air</option>
                    <option value="Ship">Ship</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">LR / GR Document No</label>
                  <input
                    type="text"
                    value={lrNumber}
                    onChange={(e) => setLrNumber(e.target.value)}
                    className="w-full border border-slate-300 font-mono rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    placeholder="LR-987123"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dispatch From Pincode</label>
                  <input
                    type="text"
                    value={fromPincode}
                    onChange={(e) => setFromPincode(e.target.value)}
                    className="w-full border border-slate-300 font-mono rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    placeholder="382330"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ship To Pincode</label>
                  <input
                    type="text"
                    value={toPincode}
                    onChange={(e) => setToPincode(e.target.value)}
                    className="w-full border border-slate-300 font-mono rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    placeholder="411019"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Generate E-Way Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
