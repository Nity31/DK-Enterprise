import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Wrench,
  Tag
} from 'lucide-react';

export default function ItemCatalog() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [hsnSac, setHsnSac] = useState('');
  const [unit, setUnit] = useState('Nos');
  const [unitPrice, setUnitPrice] = useState(0);
  const [gstRate, setGstRate] = useState(18);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/items');
      setItems(res.data);
    } catch (err) {
      console.error('Failed to fetch items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditId(null);
    setName('');
    setHsnSac('');
    setUnit('Nos');
    setUnitPrice(0);
    setGstRate(18);
    setShowModal(true);
  };

  const handleOpenEdit = (it) => {
    setEditId(it.id);
    setName(it.name);
    setHsnSac(it.hsn_sac || '');
    setUnit(it.unit || 'Nos');
    setUnitPrice(it.unit_price || 0);
    setGstRate(it.gst_rate || 18);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`/api/items/${editId}`, {
          name,
          hsn_sac: hsnSac,
          unit,
          unit_price: parseFloat(unitPrice),
          gst_rate: parseFloat(gstRate)
        });
      } else {
        await axios.post('/api/items', {
          name,
          hsn_sac: hsnSac,
          unit,
          unit_price: parseFloat(unitPrice),
          gst_rate: parseFloat(gstRate)
        });
      }
      setShowModal(false);
      fetchItems();
    } catch (err) {
      alert('Failed to save item: ' + err.message);
    }
  };

  const handleDelete = async (id, itemName) => {
    if (window.confirm(`Delete catalog item "${itemName}"?`)) {
      try {
        await axios.delete(`/api/items/${id}`);
        fetchItems();
      } catch (err) {
        alert('Failed to delete item: ' + err.message);
      }
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val || 0);
  };

  const filteredItems = items.filter(it =>
    it.name.toLowerCase().includes(search.toLowerCase()) ||
    (it.hsn_sac && it.hsn_sac.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Hydraulic Parts & Service Catalog</h2>
          <p className="text-xs text-slate-500">Save pre-defined hydraulic machinery parts, prices, HSN/SAC codes, and GST rates.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" /> + Add Item / Service
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by part name or HSN/SAC code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-xs rounded-xl pl-9 pr-4 py-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-2"></div>
            Loading catalog...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No catalog items found</h3>
            <p className="text-xs text-slate-500 mt-1">Click "+ Add Item / Service" to build your pricing master.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-xs border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Description / Part Name</th>
                  <th className="py-3.5 px-4">HSN / SAC</th>
                  <th className="py-3.5 px-4">Unit</th>
                  <th className="py-3.5 px-4 text-right">Standard Rate (₹)</th>
                  <th className="py-3.5 px-4 text-center">GST Rate %</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((it) => (
                  <tr key={it.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{it.name}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600 font-semibold">{it.hsn_sac || '-'}</td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-500">{it.unit}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">{formatCurrency(it.unit_price)}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-sky-700">{it.gst_rate}%</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleOpenEdit(it)}
                          className="p-1.5 bg-slate-100 hover:bg-amber-100 hover:text-amber-700 text-slate-600 rounded-lg transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(it.id, it.name)}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
              {editId ? 'Edit Catalog Item' : 'Add New Catalog Item'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Part / Service Description *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  placeholder="e.g. Hydraulic Cylinder 80mm x 500mm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">HSN / SAC Code</label>
                <input
                  type="text"
                  value={hsnSac}
                  onChange={(e) => setHsnSac(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  placeholder="84122100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Measurement Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="Nos">Nos</option>
                    <option value="Sets">Sets</option>
                    <option value="Mtrs">Mtrs</option>
                    <option value="Hours">Hours</option>
                    <option value="Job">Job</option>
                    <option value="Drum">Drum</option>
                    <option value="Kg">Kg</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">GST Rate %</label>
                  <select
                    value={gstRate}
                    onChange={(e) => setGstRate(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Standard Rate (₹)</label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
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
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
