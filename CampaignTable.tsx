
import React, { useState, useMemo } from 'react';
import { Campaign, MgmtStatus, MakerStatus, Maker, Brand, CustomColumn, CustomFieldType } from '../types';

interface Props {
  campaigns: Campaign[];
  makers: Maker[];
  brands: Brand[];
  customColumns: CustomColumn[];
  columnOrder: string[];
  onUpdateStatus: (id: string, field: 'mgmtStatus' | 'makerStatus', value: any) => void;
  onEdit: (campaign: Campaign) => void;
  onAddColumn: (column: CustomColumn) => void;
  onDeleteColumn: (id: string) => void;
  onMoveColumn: (id: string, direction: 'left' | 'right') => void;
}

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc' | null;
};

const CampaignTable: React.FC<Props> = ({ 
  campaigns, 
  makers, 
  brands, 
  customColumns,
  columnOrder,
  onUpdateStatus, 
  onEdit, 
  onAddColumn,
  onDeleteColumn,
  onMoveColumn
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'startDate', direction: 'asc' });
  const [isEditingTable, setIsEditingTable] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColType, setNewColType] = useState<CustomFieldType>('text');

  const sortedCampaigns = useMemo(() => {
    let sortableItems = [...campaigns];
    if (sortConfig.direction !== null) {
      sortableItems.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (sortConfig.key === 'maker') {
          aValue = makers.find(m => m.id === a.makerId)?.name || '';
          bValue = makers.find(m => m.id === b.makerId)?.name || '';
        } else if (sortConfig.key === 'brand') {
          aValue = brands.find(br => br.id === a.brandId)?.name || '';
          bValue = brands.find(br => br.id === b.brandId)?.name || '';
        } else if (customColumns.some(cc => cc.id === sortConfig.key)) {
          aValue = a.customFields?.[sortConfig.key] || '';
          bValue = b.customFields?.[sortConfig.key] || '';
        } else {
          aValue = (a as any)[sortConfig.key];
          bValue = (b as any)[sortConfig.key];
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [campaigns, sortConfig, makers, brands, customColumns]);

  const requestSort = (key: string) => {
    if (isEditingTable) return;
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return 'unfold_more';
    return sortConfig.direction === 'asc' ? 'expand_less' : 'expand_more';
  };

  const handleAddColSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newColName.trim()) {
      onAddColumn({
        id: `custom_${Date.now()}`,
        name: newColName.trim(),
        type: newColType
      });
      setNewColName('');
    }
  };

  const getMgmtStatusStyles = (status: MgmtStatus) => {
    switch (status) {
      case MgmtStatus.NEW: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
      case MgmtStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
      case MgmtStatus.REVIEWING: return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
      case MgmtStatus.PAUSED: return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300';
      case MgmtStatus.COMPLETED: return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getMakerStatusStyles = (status: MakerStatus) => {
    switch (status) {
      case MakerStatus.SENT: return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300';
      case MakerStatus.DRAFTING: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
      case MakerStatus.APPROVED: return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
      case MakerStatus.REJECTED: return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const renderHeader = (colId: string) => {
    const customCol = customColumns.find(cc => cc.id === colId);
    const label = customCol ? customCol.name : colId.charAt(0).toUpperCase() + colId.slice(1).replace(/([A-Z])/g, ' $1');

    return (
      <th 
        key={colId} 
        onClick={() => requestSort(colId)}
        className={`px-4 py-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider ${!isEditingTable ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors' : ''} min-w-[140px] select-none ${colId === 'proposedPrice' || colId === 'closingPrice' || colId.startsWith('custom_') ? 'text-right' : 'text-left'}`}
      >
        <div className={`flex items-center gap-1 ${colId === 'proposedPrice' || colId === 'closingPrice' || colId.startsWith('custom_') ? 'justify-end' : 'justify-start'}`}>
          <span className="truncate">{label}</span>
          {!isEditingTable && (
            <span className="material-symbols-outlined text-[14px] opacity-40 shrink-0">{getSortIcon(colId)}</span>
          )}
        </div>
      </th>
    );
  };

  const renderCell = (colId: string, campaign: Campaign) => {
    const maker = makers.find(m => m.id === campaign.makerId);
    const brand = brands.find(b => b.id === campaign.brandId);

    switch (colId) {
      case 'maker': return (
        <td key={colId} className="px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0">
              {maker?.initials || '??'}
            </div>
            <span className="text-sm font-medium dark:text-slate-300 truncate">{maker?.name}</span>
          </div>
        </td>
      );
      case 'brand': return (
        <td key={colId} className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400 truncate">{brand?.name}</td>
      );
      case 'name': return (
        <td key={colId} className="px-4 py-4 text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{campaign.name}</td>
      );
      case 'mgmtStatus': return (
        <td key={colId} className="px-4 py-4 min-w-[150px]">
          <select 
            value={campaign.mgmtStatus} 
            onChange={(e) => onUpdateStatus(campaign.id, 'mgmtStatus', e.target.value)}
            className={`w-full appearance-none border-none text-[10px] font-bold rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 cursor-pointer transition-all shadow-sm uppercase tracking-wider ${getMgmtStatusStyles(campaign.mgmtStatus)}`}
          >
            {Object.values(MgmtStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </td>
      );
      case 'makerStatus': return (
        <td key={colId} className="px-4 py-4 min-w-[150px]">
          <select 
            value={campaign.makerStatus} 
            onChange={(e) => onUpdateStatus(campaign.id, 'makerStatus', e.target.value)}
            className={`w-full appearance-none border-none text-[10px] font-bold rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 cursor-pointer transition-all shadow-sm uppercase tracking-wider ${getMakerStatusStyles(campaign.makerStatus)}`}
          >
            {Object.values(MakerStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </td>
      );
      case 'timeline': return (
        <td key={colId} className="px-4 py-4 text-[13px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
          {new Date(campaign.startDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} - {new Date(campaign.endDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
        </td>
      );
      case 'links': return (
        <td key={colId} className="px-4 py-4">
          <div className="flex gap-1.5">
            {campaign.pptUrl ? (
              <a href={campaign.pptUrl} target="_blank" rel="noopener noreferrer" className="p-1 px-2 rounded bg-primary text-white transition-all text-[9px] font-bold shadow-sm hover:brightness-110">PPT</a>
            ) : <span className="text-[9px] text-slate-300 dark:text-slate-700">—</span>}
          </div>
        </td>
      );
      case 'proposedPrice': return (
        <td key={colId} className="px-4 py-4 text-sm font-medium text-slate-500 dark:text-slate-400 text-right tabular-nums">${campaign.proposedPrice.toLocaleString()}</td>
      );
      case 'closingPrice': return (
        <td key={colId} className="px-4 py-4 text-sm font-bold text-slate-900 dark:text-slate-100 text-right tabular-nums">${campaign.closingPrice.toLocaleString()}</td>
      );
      default:
        if (colId.startsWith('custom_')) {
          return (
            <td key={colId} className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400 text-right font-medium">
              {campaign.customFields?.[colId] || <span className="text-slate-300 dark:text-slate-700">—</span>}
            </td>
          );
        }
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end items-center gap-3">
        {!isEditingTable ? (
          <button 
            onClick={() => setIsEditingTable(true)} 
            className="text-slate-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">settings_suggest</span>
            Edit Table Structure
          </button>
        ) : (
          <button 
            onClick={() => setIsEditingTable(false)} 
            className="text-white bg-primary px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-primary/30 active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            Apply Changes
          </button>
        )}
      </div>

      {isEditingTable && (
        <div className="bg-white dark:bg-slate-900 border-2 border-primary/20 rounded-2xl p-8 animate-in slide-in-from-top-4 duration-300 shadow-2xl z-[70] relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="material-symbols-outlined text-primary">reorder</span>
                <h4 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400">Manage Columns</h4>
              </div>
              <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {columnOrder.map((id, index) => {
                  const custom = customColumns.find(cc => cc.id === id);
                  const isFirst = index === 0;
                  const isLast = index === columnOrder.length - 1;
                  const label = custom ? custom.name : id.charAt(0).toUpperCase() + id.slice(1).replace(/([A-Z])/g, ' $1');
                  
                  return (
                    <div key={id} className={`flex items-center justify-between p-3 px-4 rounded-xl border-2 transition-all ${custom ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800' : 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800'}`}>
                      <div className="flex items-center gap-3">
                        <span className={`text-[11px] font-black uppercase tracking-wider ${custom ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>
                          {label}
                        </span>
                        {custom && <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Custom</span>}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => onMoveColumn(id, 'left')}
                          disabled={isFirst}
                          className="size-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-primary hover:text-white transition-all disabled:opacity-20"
                        >
                          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        </button>
                        <button 
                          onClick={() => onMoveColumn(id, 'right')}
                          disabled={isLast}
                          className="size-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-primary hover:text-white transition-all disabled:opacity-20"
                        >
                          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </button>
                        
                        {custom && (
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onDeleteColumn(id);
                            }}
                            className="size-8 ml-4 flex items-center justify-center rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-all shadow-md active:scale-95"
                            title="Delete Column"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/20 rounded-2xl p-8 flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="material-symbols-outlined text-primary">add_circle</span>
                <h4 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400">Add New Column</h4>
              </div>
              
              <form onSubmit={handleAddColSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Column Name</label>
                  <input 
                    type="text" 
                    placeholder="E.g. ROI, CTR, Notes..."
                    value={newColName}
                    onChange={(e) => setNewColName(e.target.value)}
                    className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-sm px-4 py-3 outline-none dark:text-white focus:border-primary transition-all"
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Data Type</label>
                  <select 
                    value={newColType}
                    onChange={(e) => setNewColType(e.target.value as CustomFieldType)}
                    className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-sm px-4 py-3 outline-none dark:text-white focus:border-primary transition-all appearance-none"
                  >
                    <option value="text">Text / General</option>
                    <option value="number">Number / Currency</option>
                    <option value="date">Date</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  disabled={!newColName.trim()}
                  className="mt-4 bg-primary text-white py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  Create Column
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-all ${isEditingTable ? 'opacity-30 pointer-events-none scale-[0.98]' : 'opacity-100'}`}>
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1600px]">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
                {columnOrder.map(colId => renderHeader(colId))}
                <th className="px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedCampaigns.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group">
                  {columnOrder.map(colId => renderCell(colId, c))}
                  <td className="px-4 py-4 text-center">
                    <button 
                      onClick={() => onEdit(c)} 
                      className="size-9 rounded-full text-slate-400 hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center transform group-hover:scale-110"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sortedCampaigns.length === 0 && (
          <div className="py-24 text-center flex flex-col items-center gap-4 text-slate-400">
            <span className="material-symbols-outlined text-6xl opacity-20">inventory_2</span>
            <p className="text-sm font-bold tracking-wider uppercase opacity-40">No campaigns found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignTable;
