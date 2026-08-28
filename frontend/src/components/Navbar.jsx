import React from 'react';
import { 
  FileText, 
  PlusCircle, 
  Users, 
  Settings, 
  LayoutDashboard,
  Building2,
  Hammer,
  FileSignature
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onNewDocument }) {
  return (
    <header className="bg-slate-900 text-white shadow-md no-print border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            {/* Sleek Modern Logo Emblem */}
            <div className="bg-gradient-to-br from-sky-500 to-blue-700 text-white px-3 py-1.5 rounded-xl font-black text-xl tracking-tight shadow-md ring-1 ring-white/20 flex items-center justify-center">
              DK
            </div>
            <div>
              <h1 className="font-black text-xl text-white tracking-wide">
                DK Enterprise
              </h1>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'dashboard' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('documents')}
              className={`flex items-center px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'documents' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 mr-2" />
              Bills & Quotations
            </button>

            <button
              onClick={() => setActiveTab('letters')}
              className={`flex items-center px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'letters' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileSignature className="w-4 h-4 mr-2" />
              Company Letterpad
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`flex items-center px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'customers' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              Customers
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'settings' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4 mr-2" />
              Company Profile
            </button>
          </nav>

          {/* Quick Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNewDocument('LABOUR_BILL')}
              className="hidden lg:flex items-center px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-sm transition"
            >
              <Hammer className="w-4 h-4 mr-1" />
              Labour Bill
            </button>

            <button
              onClick={() => onNewDocument('QUOTATION')}
              className="hidden sm:flex items-center px-3 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition"
            >
              <PlusCircle className="w-4 h-4 mr-1 text-sky-400" />
              Quotation
            </button>

            <button
              onClick={() => onNewDocument('TAX_INVOICE')}
              className="flex items-center px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Tax Invoice
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
