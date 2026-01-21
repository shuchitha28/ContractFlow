import React, { useState, useEffect, useCallback } from 'react';
import { ViewType, Blueprint, Contract, ContractStatus, FieldType } from './types';
import Dashboard from './components/Dashboard';
import BlueprintBuilder from './components/BlueprintBuilder';
import ContractForm from './components/ContractForm';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

const MOCK_BLUEPRINTS: Blueprint[] = [
  {
    id: 'bp-1',
    name: 'Standard NDA',
    createdAt: Date.now() - 10000000,
    fields: [
      { id: 'f1', type: FieldType.TEXT, label: 'Company Name', x: 50, y: 50 },
      { id: 'f2', type: FieldType.DATE, label: 'Effective Date', x: 50, y: 150 },
      { id: 'f3', type: FieldType.SIGNATURE, label: 'Authorized Signature', x: 50, y: 300 }
    ]
  },
  {
    id: 'bp-2',
    name: 'Employment Offer',
    createdAt: Date.now() - 5000000,
    fields: [
      { id: 'f4', type: FieldType.TEXT, label: 'Candidate Name', x: 50, y: 50 },
      { id: 'f5', type: FieldType.TEXT, label: 'Job Title', x: 50, y: 120 },
      { id: 'f6', type: FieldType.TEXT, label: 'Annual Salary', x: 50, y: 190 },
      { id: 'f7', type: FieldType.DATE, label: 'Start Date', x: 50, y: 260 },
      { id: 'f8', type: FieldType.SIGNATURE, label: 'Candidate Signature', x: 50, y: 400 }
    ]
  },
  {
    id: 'bp-3',
    name: 'Vendor Agreement',
    createdAt: Date.now() - 8000000,
    fields: [
      { id: 'f9', type: FieldType.TEXT, label: 'Vendor Name', x: 50, y: 50 },
      { id: 'f10', type: FieldType.TEXT, label: 'Contract Duration', x: 50, y: 120 },
      { id: 'f11', type: FieldType.TEXT, label: 'Total Contract Value', x: 50, y: 190 },
      { id: 'f12', type: FieldType.SIGNATURE, label: 'Vendor Signature', x: 50, y: 350 }
    ]
  },
  {
    id: 'bp-4',
    name: 'Consulting Agreement',
    createdAt: Date.now() - 12000000,
    fields: [
      { id: 'f13', type: FieldType.TEXT, label: 'Client Name', x: 50, y: 50 },
      { id: 'f14', type: FieldType.TEXT, label: 'Service Description', x: 50, y: 120 },
      { id: 'f15', type: FieldType.TEXT, label: 'Monthly Fee', x: 50, y: 190 },
      { id: 'f16', type: FieldType.DATE, label: 'Start Date', x: 50, y: 260 },
      { id: 'f17', type: FieldType.DATE, label: 'End Date', x: 50, y: 330 },
      { id: 'f18', type: FieldType.SIGNATURE, label: 'Consultant Signature', x: 50, y: 450 }
    ]
  },
  {
    id: 'bp-5',
    name: 'Master Services Agreement',
    createdAt: Date.now() - 20000000,
    fields: [
      { id: 'f19', type: FieldType.TEXT, label: 'Client Legal Name', x: 50, y: 50 },
      { id: 'f20', type: FieldType.TEXT, label: 'Service Territory', x: 50, y: 120 },
      { id: 'f21', type: FieldType.DATE, label: 'Agreement Start Date', x: 50, y: 190 },
      { id: 'f22', type: FieldType.DATE, label: 'Agreement End Date', x: 50, y: 260 },
      { id: 'f23', type: FieldType.SIGNATURE, label: 'Authorized Signatory', x: 50, y: 400 }
    ]
  }
];


const MOCK_CONTRACTS: Contract[] = [
  {
    id: 'ct-nda-001',
    name: 'NDA – Acme Corp',
    blueprintId: 'bp-1',
    blueprintName: 'Standard NDA',
    status: ContractStatus.CREATED,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    values: { f1: 'Acme Corporation', f2: '2025-01-15', f3: '' },
    history: [
      { status: ContractStatus.CREATED, timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3 }
    ]
  },
  {
    id: 'ct-offer-002',
    name: 'Employment Offer – Jane Doe',
    blueprintId: 'bp-2',
    blueprintName: 'Employment Offer',
    status: ContractStatus.SENT,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    values: {
      f4: 'Jane Doe',
      f5: 'Product Designer',
      f6: '$120,000',
      f7: '2025-02-01',
      f8: ''
    },
    history: [
      { status: ContractStatus.CREATED, timestamp: Date.now() - 1000 * 60 * 60 * 24 * 10 },
      { status: ContractStatus.SENT, timestamp: Date.now() - 1000 * 60 * 60 * 24 * 1 }
    ]
  },
  {
    id: 'ct-vendor-003',
    name: 'Vendor Agreement – Cloudify',
    blueprintId: 'bp-3',
    blueprintName: 'Vendor Agreement',
    status: ContractStatus.APPROVED,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    values: {
      f9: 'Cloudify Inc.',
      f10: '12 months',
      f11: '$45,000',
      f12: ''
    },
    history: [
      { status: ContractStatus.CREATED, timestamp: Date.now() - 1000 * 60 * 60 * 24 * 7 },
      { status: ContractStatus.APPROVED, timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5 }
    ]
  },
  {
    id: 'ct-consult-004',
    name: 'Consulting Agreement – Apex Labs',
    blueprintId: 'bp-4',
    blueprintName: 'Consulting Agreement',
    status: ContractStatus.SIGNED,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 21,
    values: {
      f13: 'Apex Labs',
      f14: 'Technology Consulting',
      f15: '$8,000 / month',
      f16: '2025-01-01',
      f17: '2025-06-30',
      f18: '/screenshots/Ryan-Signature.png'
    },
    history: [
      { status: ContractStatus.CREATED, timestamp: Date.now() - 1000 * 60 * 60 * 24 * 21 },
      { status: ContractStatus.APPROVED, timestamp: Date.now() - 1000 * 60 * 60 * 24 * 19 },
      { status: ContractStatus.SENT, timestamp: Date.now() - 1000 * 60 * 60 * 24 * 15 },
      { status: ContractStatus.SIGNED, timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2 }
    ]
  },
  {
    id: 'ct-msa-005',
    name: 'Master Services Agreement – NovaTech',
    blueprintId: 'bp-5',
    blueprintName: 'Master Services Agreement',
    status: ContractStatus.LOCKED,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 45,
    values: {
      f19: 'NovaTech LLC',
      f20: 'Global',
      f21: '2024-12-01',
      f22: '2026-12-01',
      f23: '/screenshots/Signature-PNG-Background.png'
    },
    history: [
      { status: ContractStatus.CREATED, timestamp: Date.now() - 1000 * 60 * 60 * 24 * 45 },
      { status: ContractStatus.APPROVED, timestamp: Date.now() - 1000 * 60 * 60 * 24 * 42 },
      { status: ContractStatus.SENT, timestamp: Date.now() - 1000 * 60 * 60 * 24 * 40 },
      { status: ContractStatus.SIGNED, timestamp: Date.now() - 1000 * 60 * 60 * 24 * 38 },
      { status: ContractStatus.LOCKED, timestamp: Date.now() - 1000 * 60 * 60 * 24 * 30 }
    ]
  },
  {
    id: 'ct-nda-006',
    name: 'NDA – Orion Ventures',
    blueprintId: 'bp-1',
    blueprintName: 'Standard NDA',
    status: ContractStatus.REVOKED,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    values: {
      f1: 'Orion Ventures',
      f2: '2025-01-20',
      f3: ''
    },
    history: [
      { status: ContractStatus.CREATED, timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5 },
      { status: ContractStatus.REVOKED, timestamp: Date.now() - 1000 * 60 * 60 * 24 * 1 }
    ]
  }
];


const load = <T,>(key: string, fallback: T): T => {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback;
  } catch {
    return fallback;
  }
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('DASHBOARD');
  const [blueprints, setBlueprints] = useState<Blueprint[]>(() =>
    load('blueprints', MOCK_BLUEPRINTS)
  );
  const [contracts, setContracts] = useState<Contract[]>(() =>
    load('contracts', MOCK_CONTRACTS)
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('blueprints', JSON.stringify(blueprints));
  }, [blueprints]);

  useEffect(() => {
    try {
      localStorage.setItem('contracts', JSON.stringify(contracts));
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        console.warn('Cannot save contracts: localStorage quota exceeded');
      } else {
        throw e;
      }
    }
  }, [contracts]);
  
  useEffect(() => {
    localStorage.removeItem('contracts'); // clear old data
    localStorage.setItem('contracts', JSON.stringify(contracts));
  }, []);
  
  const selectedItem = contracts.find(c => c.id === selectedId) || null;

  const addBlueprint = useCallback((bp: Blueprint) => {
    setBlueprints(prev => [...prev, bp]);
    setCurrentView('DASHBOARD');
  }, []);

  const addContract = useCallback((contract: Contract) => {
    setContracts(prev => {
      const newContracts = [...prev, contract];
      try {
        localStorage.setItem('contracts', JSON.stringify(newContracts));
      } catch (e) {
        console.warn('Cannot save contract: storage full');
      }
      return newContracts;
    });
    setCurrentView('DASHBOARD');
  }, []);
  
  const updateContract = useCallback((updated: Contract) => {
    setContracts(prev => prev.map(c => (c.id === updated.id ? updated : c)));
    setCurrentView('DASHBOARD');
    setSelectedId(null);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      <div className="flex-1 flex flex-col">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <main className="flex-1 overflow-y-auto p-6">
          {currentView === 'DASHBOARD' && (
            <Dashboard
              contracts={contracts}
              blueprints={blueprints}
              searchQuery={searchQuery}
              onViewContract={(c) => {
                setSelectedId(c.id);
                setCurrentView('VIEW_CONTRACT');
              }}
              onNewContract={() => setCurrentView('CREATE_CONTRACT')}
              onNewBlueprint={() => setCurrentView('CREATE_BLUEPRINT')}
              onUpdateContract={updateContract}
            />
          )}

          {currentView === 'CREATE_BLUEPRINT' && (
            <BlueprintBuilder onSave={addBlueprint} onCancel={() => setCurrentView('DASHBOARD')} />
          )}

          {currentView === 'CREATE_CONTRACT' && (
            <ContractForm
              blueprints={blueprints}
              onSave={addContract}
              onCancel={() => setCurrentView('DASHBOARD')}
            />
          )}

          {currentView === 'VIEW_CONTRACT' && selectedItem && (
            <ContractForm
              blueprints={blueprints}
              existingContract={selectedItem}
              onSave={updateContract}
              onCancel={() => setCurrentView('DASHBOARD')}
              readOnly={selectedItem.status === ContractStatus.LOCKED}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
