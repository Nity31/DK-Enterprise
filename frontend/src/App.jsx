import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import DocumentList from './components/DocumentList';
import DocumentForm from './components/DocumentForm';
import DocumentPrint from './components/DocumentPrint';
import Letterpad from './components/Letterpad';
import EWayBillManager from './components/EWayBillManager';
import EWayBillPrint from './components/EWayBillPrint';
import CustomerManager from './components/CustomerManager';
import CompanySettings from './components/CompanySettings';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [selectedEwbId, setSelectedEwbId] = useState(null);
  const [preselectDocIdForEwb, setPreselectDocIdForEwb] = useState('');
  const [formType, setFormType] = useState('TAX_INVOICE');

  const handleNewDocument = (type = 'TAX_INVOICE') => {
    setSelectedDocId(null);
    setFormType(type);
    setActiveTab('document-form');
  };

  const handleEditDocument = (docId) => {
    setSelectedDocId(docId);
    setActiveTab('document-form');
  };

  const handleViewDocument = (docId) => {
    setSelectedDocId(docId);
    setActiveTab('document-print');
  };

  const handleFormSaveSuccess = () => {
    setActiveTab('documents');
  };

  const handleConverted = (newDocId) => {
    setSelectedDocId(newDocId);
    setActiveTab('document-print');
  };

  const handleViewEWayBill = (ewbId) => {
    setSelectedEwbId(ewbId);
    setActiveTab('eway-bill-print');
  };

  const handleCreateEWayBillFromDoc = (docId) => {
    setPreselectDocIdForEwb(docId);
    setActiveTab('eway-bills');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewDocument={handleNewDocument}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            setActiveTab={setActiveTab}
            onNewDocument={handleNewDocument}
            onViewDocument={handleViewDocument}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentList
            onNewDocument={handleNewDocument}
            onEditDocument={handleEditDocument}
            onViewDocument={handleViewDocument}
          />
        )}

        {activeTab === 'document-form' && (
          <DocumentForm
            editDocId={selectedDocId}
            initialType={formType}
            onSaveSuccess={handleFormSaveSuccess}
            onCancel={() => setActiveTab('documents')}
          />
        )}

        {activeTab === 'document-print' && (
          <DocumentPrint
            docId={selectedDocId}
            onBack={() => setActiveTab('documents')}
            onEdit={handleEditDocument}
            onConverted={handleConverted}
            onCreateEWayBill={handleCreateEWayBillFromDoc}
          />
        )}

        {activeTab === 'eway-bills' && (
          <EWayBillManager
            onViewEWayBill={handleViewEWayBill}
            onNewEWayBillForDocId={preselectDocIdForEwb}
          />
        )}

        {activeTab === 'eway-bill-print' && (
          <EWayBillPrint
            ewbId={selectedEwbId}
            onBack={() => setActiveTab('eway-bills')}
          />
        )}

        {activeTab === 'letters' && <Letterpad />}

        {activeTab === 'customers' && <CustomerManager />}

        {activeTab === 'settings' && <CompanySettings />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 no-print text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 font-semibold">
          DK Enterprise - Billing, E-Way Bill & Letterpad System &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
