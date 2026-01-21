import React, { useState, useEffect, useRef } from 'react';
import { Blueprint, Contract, ContractStatus, FieldType } from '../types';
import { GlassCard, StatusBadge, SectionHeader, WorkflowTimeline, Toast, ToastProps } from './UI';

interface ContractFormProps {
  blueprints: Blueprint[];
  existingContract?: Contract;
  onSave: (contract: Contract) => void;
  onCancel: () => void;
  readOnly?: boolean;
}

const ContractForm: React.FC<ContractFormProps> = ({
  blueprints = [],
  existingContract,
  onSave,
  onCancel,
  readOnly = false
}) => {
  const [selectedBp, setSelectedBp] = useState<Blueprint | null>(null);
  const [contractName, setContractName] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'> | null>(null);
  const [activeSigningField, setActiveSigningField] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize from existing contract
  useEffect(() => {
    if (existingContract) {
      setContractName(existingContract.name || '');
      setFieldValues(existingContract.values ? { ...existingContract.values } : {});
      const bp = blueprints.find(b => b.id === existingContract.blueprintId);
      if (bp) setSelectedBp(bp);
    }
  }, [existingContract, blueprints]);

  const handleBpSelect = (id: string) => {
    const bp = blueprints.find(b => b.id === id);
    if (bp) {
      setSelectedBp(bp);
      const initial: Record<string, any> = {};
      bp.fields.forEach(f => initial[f.id] = f.type === FieldType.CHECKBOX ? false : '');
      setFieldValues(initial);
    }
  };

  const handleFieldChange = (id: string, value: any) => {
    setFieldValues(prev => ({ ...prev, [id]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeSigningField) {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFieldValues(prev => ({ ...prev, [activeSigningField]: result }));
        setToast({ message: "Signature captured. Click 'Update Record' to save.", type: 'success' });
        setIsProcessing(false);
      };
      reader.onerror = () => {
        setToast({ message: "Error reading signature file.", type: 'error' });
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const areAllEditableFieldsFilled = () => {
    if (!selectedBp) return false;
  
    return selectedBp.fields.every(field => {
      
      if (isFieldDisabled(field.type)) return true;
  
      const value = fieldValues[field.id];
  
      switch (field.type) {
        case FieldType.TEXT:
        case FieldType.DATE:
          return typeof value === 'string' && value.trim().length > 0;
  
        case FieldType.CHECKBOX:
          return value === true;
  
        default:
          return true;
      }
    });
  };
  
  const handleSave = () => {
    if (!selectedBp || !contractName.trim()) {
      setToast({ message: "A title and blueprint are required.", type: 'warning' });
      return;
    }

    if (!areAllEditableFieldsFilled()) {
      setToast({
        message: "Please complete all required fields before creating the contract.",
        type: 'warning'
      });
      return;
    }

    try {
      const contract: Contract = {
        id: existingContract?.id || crypto.randomUUID(),
        blueprintId: selectedBp.id,
        blueprintName: selectedBp.name,
        name: contractName,
        status: existingContract?.status || ContractStatus.CREATED,
        values: { ...fieldValues },
        createdAt: existingContract?.createdAt || Date.now(),
        history: existingContract?.history
          ? [...existingContract.history]
          : [{ status: ContractStatus.CREATED, timestamp: Date.now() }]
      };

      onSave(contract);
      setToast({ message: existingContract ? "Contract updated successfully." : "Contract created successfully.", type: 'success' });
    } catch (err) {
      setToast({ message: "Failed to save contract.", type: 'error' });
    }
  };

  const isFieldDisabled = (type: FieldType) => {
    if (!existingContract) return false;
    if ([ContractStatus.REVOKED, ContractStatus.LOCKED].includes(existingContract.status)) return true;
    if (readOnly && existingContract.status !== ContractStatus.SENT) return true;
    if ([ContractStatus.SENT, ContractStatus.SIGNED].includes(existingContract.status) && type !== FieldType.SIGNATURE ) {return true;}
    if (type === FieldType.SIGNATURE && ![ContractStatus.SENT, ContractStatus.SIGNED].includes(existingContract.status)) {return true;}
    return false;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={onCancel} className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all shadow-sm">
            <i className="fas fa-chevron-left"></i>
          </button>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {existingContract ? existingContract.name : 'Draft Contract'}
            </h2>
            <div className="mt-2 flex items-center gap-3">
              <StatusBadge status={existingContract?.status || ContractStatus.CREATED} />
            </div>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isProcessing}
          className="px-10 py-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 disabled:opacity-50"
        >
          {isProcessing ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-save"></i>}
          {existingContract ? 'Update Record' : 'Create Record'}
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <GlassCard className="p-8">
            <SectionHeader title="Metadata" />
            <div className="space-y-6 mt-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Display Name</label>
                <input
                  disabled={!!existingContract && existingContract.status !== ContractStatus.CREATED}
                  type="text"
                  value={contractName}
                  onChange={(e) => setContractName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Template</label>
                <select
                  disabled={!!existingContract}
                  value={selectedBp?.id || ''}
                  onChange={(e) => handleBpSelect(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm font-bold focus:bg-white outline-none disabled:opacity-50 appearance-none"
                >
                  <option value="">Select Blueprint...</option>
                  {blueprints.map(bp => (
                    <option key={bp.id} value={bp.id}>{bp.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </GlassCard>

          {existingContract && (
            <GlassCard className="p-8">
              <SectionHeader title="Audit Log" />
              <WorkflowTimeline history={existingContract.history || []} />
            </GlassCard>
          )}
        </div>

        <div className="col-span-12 lg:col-span-8">
          {selectedBp ? (
            <GlassCard className="p-10 space-y-10">
              <SectionHeader title="Execution Fields" />
              <div className="space-y-8">
                {selectedBp.fields.map(field => (
                  <div key={field.id} className="group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 group-hover:text-blue-500 transition-colors">{field.label}</label>
                    
                    {field.type === FieldType.TEXT && (
                      <input
                        disabled={isFieldDisabled(FieldType.TEXT)}
                        type="text"
                        value={fieldValues[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-3 text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all disabled:opacity-50"
                      />
                    )}
                    {field.type === FieldType.DATE && (
                      <input
                        disabled={isFieldDisabled(FieldType.DATE)}
                        type="date"
                        value={fieldValues[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-3 text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all disabled:opacity-50"
                      />
                    )}
                    {field.type === FieldType.CHECKBOX && (
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          disabled={isFieldDisabled(FieldType.CHECKBOX)}
                          type="checkbox"
                          checked={!!fieldValues[field.id]}
                          onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                          className="w-5 h-5 rounded border-slate-300 text-blue-600 transition-all disabled:opacity-50"
                        />
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Verify requirements</span>
                      </label>
                    )}
                    {field.type === FieldType.SIGNATURE && (
                      <div
                        onClick={() => {
                          if (isFieldDisabled(FieldType.SIGNATURE)) return;
                          setActiveSigningField(field.id);
                          fileInputRef.current?.click();
                        }}
                        className={`border-2 border-dashed rounded-2xl p-6 transition-all flex flex-col items-center justify-center min-h-[160px] ${
                          !isFieldDisabled(FieldType.SIGNATURE)
                            ? 'hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer border-slate-200 bg-slate-50'
                            : 'bg-slate-50 border-slate-100 opacity-60'
                        }`}
                      >
                        {fieldValues[field.id] ? (
                          <div className="text-center">
                            <img src={fieldValues[field.id]} alt="Signature" className="max-h-24 mix-blend-multiply mb-3" />
                            {!isFieldDisabled(FieldType.SIGNATURE) && <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Update signature</p>}
                          </div>
                        ) : (
                          <div className="text-center">
                            <i className="fas fa-signature text-3xl text-slate-300 mb-2"></i>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              {isFieldDisabled(FieldType.SIGNATURE) ? 'Port Closed' : 'Secure e-Signature Port'}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-white text-slate-200 p-8 text-center">
              <i className="fas fa-file-invoice text-4xl mb-4 opacity-20"></i>
              <p className="font-black text-[10px] uppercase tracking-[0.2em]">Select a template to begin</p>
            </div>
          )}
        </div>
      </div>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
    </div>
  );
};

export default ContractForm;
