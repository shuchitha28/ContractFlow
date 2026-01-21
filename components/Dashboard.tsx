
import React, { useState, useMemo } from 'react';
import { Contract, Blueprint, ContractStatus, FieldType } from '../types';
import { Toast, ToastProps } from './UI';

interface DashboardProps {
  contracts: Contract[];
  blueprints: Blueprint[];
  onViewContract: (c: Contract) => void;
  onNewContract: () => void;
  onNewBlueprint: () => void;
  onUpdateContract: (c: Contract) => void;
  searchQuery?: string;
}

const Dashboard: React.FC<DashboardProps> = ({
  contracts = [],
  blueprints = [],
  onViewContract,
  onNewContract,
  onNewBlueprint,
  onUpdateContract,
  searchQuery = ''
}) => {
  const [filter, setFilter] = useState<string>('ALL');
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'> | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<Contract | null>(null);
  const [revokeDone, setRevokeDone] = useState(false);

  const stats = [
    { label: 'Active', value: contracts.filter(c => c && [ContractStatus.CREATED, ContractStatus.APPROVED, ContractStatus.SENT].includes(c.status)).length, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Signature', value: contracts.filter(c => c && c.status === ContractStatus.SENT).length, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Completed', value: contracts.filter(c => c && (c.status === ContractStatus.SIGNED || c.status === ContractStatus.LOCKED)).length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const filteredContracts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return contracts.filter(c => {
      if (!c) return false;
      const matchesFilter = filter === 'ALL' || c.status === filter;
      const matchesSearch = !query || 
                           c.name.toLowerCase().includes(query) || 
                           c.blueprintName.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [contracts, filter, searchQuery]);

  const getStatusColor = (status: ContractStatus) => {
    switch (status) {
      case ContractStatus.CREATED: return 'bg-slate-100 text-slate-700';
      case ContractStatus.APPROVED: return 'bg-emerald-100 text-emerald-700';
      case ContractStatus.SENT: return 'bg-blue-100 text-blue-700';
      case ContractStatus.SIGNED: return 'bg-indigo-100 text-indigo-700';
      case ContractStatus.LOCKED: return 'bg-slate-900 text-white';
      case ContractStatus.REVOKED: return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getCreatedDate = (contract: Contract): string | null => {
    if ((contract as any).createdAt) {
      return new Date((contract as any).createdAt).toLocaleDateString();
    }
  
    const createdEvent = contract.history?.find(
      h => h.status === ContractStatus.CREATED
    );
  
    return createdEvent
      ? new Date(createdEvent.timestamp).toLocaleDateString()
      : null;
  };
  
  const hasRequiredSignature = (contract: Contract): boolean => {
    if (!contract || !contract.values) return false;
    const blueprint = blueprints.find(b => b.id === contract.blueprintId);
    if (!blueprint) return true;
    const sigFields = blueprint.fields.filter(f => f.type === FieldType.SIGNATURE);
    if (sigFields.length === 0) return true;
    return sigFields.every(f => !!contract.values[f.id]);
  };

  const handleRevoke = (contract: Contract) => {
    setRevokeTarget(contract);
    setRevokeDone(false);
  };  

  const getNextActionConfig = (contract: Contract) => {
    if (!contract || contract.status === ContractStatus.REVOKED || contract.status === ContractStatus.LOCKED) return null;
    const current = contract.status;
    switch (current) {
      case ContractStatus.CREATED: 
        return { label: 'Approve', next: ContractStatus.APPROVED, icon: 'fa-check-double', color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-600', disabled: false };
      case ContractStatus.APPROVED: 
        return { label: 'Send', next: ContractStatus.SENT, icon: 'fa-paper-plane', color: 'text-blue-600 bg-blue-50 hover:bg-blue-600', disabled: false };
      case ContractStatus.SENT: 
        const canSign = hasRequiredSignature(contract);
        return { 
          label: canSign ? 'Finalize' : 'Awaiting Sig.', 
          next: ContractStatus.SIGNED, 
          icon: canSign ? 'fa-file-signature' : 'fa-hourglass-half', 
          color: canSign ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-600' : 'text-slate-400 bg-slate-100 cursor-not-allowed opacity-60',
          disabled: !canSign
        };
      case ContractStatus.SIGNED: 
        return { label: 'Archive', next: ContractStatus.LOCKED, icon: 'fa-lock', color: 'text-slate-600 bg-slate-100 hover:bg-slate-800', disabled: false };
      default: 
        return null;
    }
  };

  const handleStatusTransition = (contract: Contract) => {
    const config = getNextActionConfig(contract);
  
    if (!config) return;
  
    if (config.disabled) {
      setToast({
        message: 'Required signatures are missing',
        type: 'warning',
      });
      return;
    }
  
    onUpdateContract({
      ...contract,
      status: config.next,
      history: [...(contract.history || []), { status: config.next, timestamp: Date.now() }]
    });
  
    setToast({
      message: `Contract "${contract.name}" moved to ${config.next}`,
      type: 'success',
    });
  };
  

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
        {toast && (
          <Toast
            {...toast}
            onClose={() => setToast(null)}
          />
        )}

      {revokeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setRevokeTarget(null)}
          />

          {/* Modal Card */}
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-rose-200 p-6 animate-in zoom-in-95 fade-in duration-200">
            {!revokeDone ? (
              <>
                <div className="flex items-start gap-4">
                  <i className="fas fa-triangle-exclamation text-rose-500 text-xl mt-1"></i>
                  <div>
                    <h3 className="text-sm font-black text-rose-700 uppercase tracking-widest">
                      Protocol Revocation
                    </h3>
                    <p className="text-sm text-slate-700 mt-2">
                      Are you sure you want to revoke
                      <span className="font-bold"> “{revokeTarget.name}”</span>?
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      This action is permanent and cannot be undone.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setRevokeTarget(null)}
                    className="px-4 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => {
                      onUpdateContract({
                        ...revokeTarget,
                        status: ContractStatus.REVOKED,
                        history: [
                          ...(revokeTarget.history || []),
                          { status: ContractStatus.REVOKED, timestamp: Date.now() },
                        ],
                      });
                      setRevokeDone(true);
                    }}
                    className="px-4 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-all"
                  >
                    Confirm Revoke
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <i className="fas fa-ban text-rose-600 text-xl"></i>
                <div className="flex-1">
                  <p className="text-sm font-bold text-rose-700">
                    Document revoked successfully.
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    The contract lifecycle has been permanently terminated.
                  </p>
                </div>
                <button
                  onClick={() => setRevokeTarget(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Contract Dashboard</h2>
          <p className="text-slate-500 text-sm">Monitor and manage your active legal protocols</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onNewBlueprint} className="px-5 py-2.5 text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 font-medium shadow-sm">
            <i className="fas fa-magic text-blue-500"></i> Builder
          </button>
          <button onClick={onNewContract} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md transition-all flex items-center gap-2 font-medium">
            <i className="fas fa-plus"></i> New Contract
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`
              relative p-6 rounded-2xl border border-slate-100
              ${stat.bg ?? 'bg-gradient-to-r from-blue-50 to-blue-100'}
              shadow-lg overflow-hidden
              cursor-pointer
              transform transition-all duration-500 ease-in-out
              hover:-translate-y-2 hover:scale-105 hover:shadow-2xl
            `}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 opacity-30 blur-2xl animate-gradient-x pointer-events-none"></div>

            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">{stat.label}</p>
            <p className={`text-3xl font-black mt-1 relative z-10 ${stat.color ?? 'text-blue-600'}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 uppercase text-xs tracking-widest">
            <i className="fas fa-list text-blue-500"></i> Registry
          </h3>
          <div className="flex flex-wrap gap-2">
             {['ALL', ...Object.values(ContractStatus)].map(s => (
               <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1 text-[10px] rounded-full font-black uppercase tracking-wider transition-all ${filter === s ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:text-blue-500'}`}>
                 {s}
               </button>
             ))}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-white bg-blue-600">
                <th className="px-6 py-4 font-bold border-b border-blue-700">Contract</th>
                <th className="px-6 py-4 font-bold border-b border-blue-700">Blueprint</th>
                <th className="px-6 py-4 font-bold border-b border-blue-700 text-center">Status</th>
                <th className="px-6 py-4 font-bold border-b border-blue-700 text-center">Created</th>
                <th className="px-6 py-4 font-bold border-b border-blue-700 text-right">Actions / View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredContracts.map((c) => {
                const action = getNextActionConfig(c);
                const canRevoke = [ContractStatus.CREATED, ContractStatus.APPROVED].includes(c.status);
                
                return (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 text-sm">{c.name}</p>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">{c.blueprintName}</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${getStatusColor(c.status)}`}
                      >
                        {c.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center text-xs text-slate-500 font-medium">
                      {getCreatedDate(c) || '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
              
                        {action && (
                          <button 
                            onClick={() => handleStatusTransition(c)}
                            disabled={action.disabled}
                            className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${action.color} ${!action.disabled ? 'hover:text-white' : ''}`}
                          >
                            <i className={`fas ${action.icon} mr-1.5`}></i> {action.label}
                          </button>
                        )}

                        {canRevoke && (
                          <button 
                            onClick={() => !revokeTarget && handleRevoke(c)}
                            disabled={!!revokeTarget}
                            className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all
                              ${revokeTarget 
                                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                : 'text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white'}
                            `}
                          >
                            Revoke
                        </button>
                        
                        )}

                        <button
                          onClick={() => {
                            onViewContract(c);
                            setToast({
                              message: `Opened contract "${c.name}"`,
                              type: 'info',
                            });
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredContracts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center text-slate-300">
                      <i className="fas fa-search text-3xl mb-4 opacity-50"></i>
                      <p className="font-bold uppercase tracking-widest text-[10px]">No matches found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
