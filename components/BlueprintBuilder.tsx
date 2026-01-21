import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Blueprint, FieldType, FieldMetadata } from '../types';
import { GlassCard, SectionHeader, Toast } from './UI';

interface BlueprintBuilderProps {
  onSave: (bp: Blueprint) => void;
  onCancel: () => void;
  initialFields?: FieldMetadata[];
}

const BlueprintBuilder: React.FC<BlueprintBuilderProps> = ({onSave, onCancel,initialFields}) => {
  const [name, setName] = useState('');
  const [fields, setFields] = useState<FieldMetadata[]>(() => initialFields ?? []);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  useEffect(() => {
    if (initialFields) {
      setFields(initialFields);
    }
  }, [initialFields]);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const addField = (type: FieldType) => {
    const newField: FieldMetadata = {
      id: crypto.randomUUID(),
      type,
      label: `Field_${fields.length + 1}`,
      x: 50,
      y: fields.length * 80 + 50
    };
    setFields([...fields, newField]);
    setSelectedField(newField.id);
  };

  const updateField = (id: string, updates: Partial<FieldMetadata>) => {
    setFields(prev =>
      prev.map(f => (f.id === id ? { ...f, ...updates } : f))
    );
  };  

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
    if (selectedField === id) setSelectedField(null);
  };

  const handleMouseDown = (e: React.MouseEvent, field: FieldMetadata) => {
    e.stopPropagation();
    setDraggingId(field.id);
    setSelectedField(field.id);
    setDragOffset({ x: e.clientX - field.x, y: e.clientY - field.y });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggingId || !canvasRef.current) return;
  
    const rect = canvasRef.current.getBoundingClientRect();
    let newX = e.clientX - dragOffset.x;
    let newY = e.clientY - dragOffset.y;
  
    const snap = 10;
    newX = Math.round(newX / snap) * snap;
    newY = Math.round(newY / snap) * snap;
  
    newX = Math.max(0, Math.min(newX, rect.width - 240));
    newY = Math.max(0, Math.min(newY, 1200));
  
    updateField(draggingId, { x: newX, y: newY });
  }, [draggingId, dragOffset, updateField]);  

  const handleMouseUp = useCallback(() => {
    setDraggingId(null);
  }, []);
  
  useEffect(() => {
    if (draggingId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingId, dragOffset]);

  const handleDeploy = () => {
    const hasName = name.trim().length > 0;
    const hasSignature = fields.some(f => f.type === FieldType.SIGNATURE);
  
    if (!hasName && !hasSignature) {
      setToast({ message: 'Blueprint title and at least one E-Sign Port are required!', type: 'error' });
      return;
    }
  
    if (!hasName) {
      setToast({ message: 'Blueprint title is required!', type: 'error' });
      return;
    }
  
    if (!hasSignature) {
      setToast({ message: 'At least one E-Sign Port is required!', type: 'error' });
      return;
    }
  
    onSave({
      id: crypto.randomUUID(),
      name,
      fields,
      createdAt: Date.now()
    });

    setToast({ message: 'Blueprint deployed successfully!', type: 'success' });
  };

  return (
    <div className="max-w-[1600px] mx-auto flex flex-col h-[calc(100vh-140px)] space-y-8 select-none animate-in fade-in duration-700">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={onCancel} className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm">
            <i className="fas fa-times"></i>
          </button>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Template Architect</h2>
            <p className="text-sm font-medium text-slate-500">Construct the logical skeleton of your legal assets</p>
          </div>
        </div>
        <button 
          onClick={handleDeploy} 
          className="px-10 py-4 bg-slate-900 text-white rounded-2xl shadow-2xl hover:bg-black font-black text-sm transition-all flex items-center gap-3"
        >
          <i className="fas fa-rocket text-blue-400"></i> Deploy Prototype
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8 flex-1 min-h-0 overflow-hidden">
        {/* Left Panel */}
        <div className="col-span-3 space-y-6 overflow-y-auto pb-10">
          <GlassCard className="p-6">
            <SectionHeader title="Blueprint Title" />
            <div className="space-y-4 mt-6">
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border-slate-200/60 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all"
                placeholder="Entre title..."
              />
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <SectionHeader title="Logic Blocks" />
            <div className="grid grid-cols-1 gap-3 mt-6">
              {[
                { type: FieldType.TEXT, icon: 'fa-text-width', color: 'blue', label: 'String Input' },
                { type: FieldType.DATE, icon: 'fa-calendar-day', color: 'emerald', label: 'Temporal Node' },
                { type: FieldType.CHECKBOX, icon: 'fa-toggle-on', color: 'amber', label: 'Boolean Toggle' },
                { type: FieldType.SIGNATURE, icon: 'fa-file-signature', color: 'rose', label: 'E-Sign Port' }
              ].map(block => (
                <button 
                  key={block.type}
                  onClick={() => addField(block.type)} 
                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-200/60 hover:border-blue-500 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all group"
                >
                  <div className={`w-10 h-10 rounded-xl bg-white border border-slate-200 text-${block.color}-500 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all`}>
                    <i className={`fas ${block.icon}`}></i>
                  </div>
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{block.label}</span>
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Canvas */}
        <div className="col-span-6 bg-slate-200/50 rounded-[3rem] border-2 border-slate-300/50 relative overflow-hidden flex flex-col shadow-inner">
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
             <div className="px-6 py-2 bg-white/90 backdrop-blur rounded-full text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] shadow-lg flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              Precision Canvas Engine
            </div>
          </div>
          <div className="flex-1 overflow-auto p-12">
            <div 
              ref={canvasRef}
              className="bg-white shadow-2xl relative rounded-xl border border-slate-200/50 min-h-[1200px] w-full"
              style={{ 
                backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                backgroundSize: '30px 30px'
              }}
            >
              {fields.map((f) => (
                <div 
                  key={f.id}
                  onMouseDown={(e) => handleMouseDown(e, f)}
                  style={{ top: f.y, left: f.x, zIndex: draggingId === f.id ? 50 : 10 }}
                  className={`absolute p-6 border-2 group transition-all w-[240px] rounded-2xl ${
                    selectedField === f.id 
                      ? 'border-blue-500 ring-8 ring-blue-500/5 bg-blue-50/30' 
                      : 'border-white bg-white/80 backdrop-blur shadow-lg hover:border-blue-200'
                  } ${draggingId === f.id ? 'scale-[1.05] shadow-2xl rotate-1' : ''}`}
                >
                  <div className="flex items-center justify-between mb-4 pointer-events-none">
                    <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${f.type === FieldType.SIGNATURE ? 'bg-rose-100 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                      {f.type}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); removeField(f.id); }} className="text-slate-200 hover:text-rose-500 transition-colors pointer-events-auto">
                      <i className="fas fa-trash-can"></i>
                    </button>
                  </div>
                  <div className="text-[10px] font-black text-slate-800 uppercase tracking-wider mb-2">{f.label}</div>
                  <div className="h-6 bg-slate-100/50 rounded-lg border border-dashed border-slate-200"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Inspector */}
        <div className="col-span-3">
          {selectedField ? (
            <GlassCard className="p-8 animate-in slide-in-from-right-4 duration-500">
              <SectionHeader title="Inspector Panel" subtitle="Fine-tune block parameters" />
              <div className="space-y-6 mt-10">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Node Label</label>
                  <input 
                    type="text" 
                    value={fields.find(f => f.id === selectedField)?.label || ''} 
                    onChange={(e) => updateField(selectedField, { label: e.target.value })}
                    className="w-full bg-slate-50 border-slate-200/60 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">POS_X</p>
                    <p className="text-lg font-black text-slate-800">{Math.round(fields.find(f => f.id === selectedField)?.x || 0)}px</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">POS_Y</p>
                    <p className="text-lg font-black text-slate-800">{Math.round(fields.find(f => f.id === selectedField)?.y || 0)}px</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-white/50 text-center">
              <i className="fas fa-crosshairs text-slate-200 text-3xl mb-4"></i>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Select a node on canvas to access configuration tools</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlueprintBuilder;
