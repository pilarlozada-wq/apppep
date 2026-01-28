
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Campaign, MgmtStatus, MakerStatus, Maker, Brand, CustomColumn } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (campaign: Partial<Campaign>) => void;
  campaign?: Campaign;
  makers: Maker[];
  brands: Brand[];
  customColumns: CustomColumn[];
}

const CreateCampaignModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  onCreate, 
  campaign, 
  makers, 
  brands, 
  customColumns 
}) => {
  const [formData, setFormData] = useState<Partial<Campaign>>({
    name: '',
    makerId: '',
    brandId: '',
    mgmtStatus: MgmtStatus.NEW,
    makerStatus: MakerStatus.DRAFTING,
    startDate: '',
    endDate: '',
    proposedPrice: 0,
    closingPrice: 0,
    pptUrl: '',
    customFields: {},
  });

  const [makerSearch, setMakerSearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [isMakerOpen, setIsMakerOpen] = useState(false);
  const [isBrandOpen, setIsBrandOpen] = useState(false);

  const makerRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (campaign) {
      setFormData({
        ...campaign,
        customFields: campaign.customFields || {}
      });
      const m = makers.find(mk => mk.id === campaign.makerId);
      const b = brands.find(br => br.id === campaign.brandId);
      if (m) setMakerSearch(m.name);
      if (b) setBrandSearch(b.name);
    } else {
      setFormData({
        name: '',
        makerId: '',
        brandId: '',
        mgmtStatus: MgmtStatus.NEW,
        makerStatus: MakerStatus.DRAFTING,
        startDate: '',
        endDate: '',
        proposedPrice: 0,
        closingPrice: 0,
        pptUrl: '',
        customFields: {},
      });
      setMakerSearch('');
      setBrandSearch('');
    }
  }, [campaign, isOpen, makers, brands]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (makerRef.current && !makerRef.current.contains(event.target as Node)) setIsMakerOpen(false);
      if (brandRef.current && !brandRef.current.contains(event.target as Node)) setIsBrandOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredMakers = useMemo(() => {
    return makers.filter(m => m.name.toLowerCase().includes(makerSearch.toLowerCase()));
  }, [makers, makerSearch]);

  const filteredBrands = useMemo(() => {
    const baseBrands = formData.makerId 
      ? brands.filter(b => b.makerId === formData.makerId)
      : brands;
    return baseBrands.filter(b => b.name.toLowerCase().includes(brandSearch.toLowerCase()));
  }, [brands, brandSearch, formData.makerId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.makerId || !formData.brandId) {
      alert("Please select both a Maker and a Brand");
      return;
    }
    onCreate(formData);
  };

  const selectMaker = (m: Maker) => {
    setFormData(prev => ({ ...prev, makerId: m.id, brandId: '' }));
    setMakerSearch(m.name);
    setBrandSearch('');
    setIsMakerOpen(false);
  };

  const selectBrand = (b: Brand) => {
    setFormData(prev => ({ ...prev, brandId: b.id }));
    setBrandSearch(b.name);
    setIsBrandOpen(false);
  };

  const updateCustomField = (id: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      customFields: {
        ...(prev.customFields || {}),
        [id]: value
      }
    }));
  };

  return (
    <div className="fixed inset-0 flex justify-end z-[100] overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-[560px] bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
        <header className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 z-10">
          <h2 className="text-xl font-bold tracking-tight dark:text-white">{campaign ? 'Edit Campaign' : 'Create New Campaign'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-8 space-y-8 hide-scrollbar">
          {/* Campaign Name */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Campaign Name</label>
            <input 
              type="text" 
              placeholder="E.g. Summer Sale 2024"
              value={formData.name} 
              onChange={e => setFormData({ ...formData, name: e.target.value })} 
              className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-12 px-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none dark:text-white" 
              required 
            />
          </div>

          {/* Presentation Link */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Presentation Link (URL)</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">link</span>
              <input 
                type="url" 
                placeholder="https://docs.google.com/presentation/..."
                value={formData.pptUrl || ''} 
                onChange={e => setFormData({ ...formData, pptUrl: e.target.value })} 
                className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-12 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none dark:text-white" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2 relative" ref={makerRef}>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Maker</label>
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Search Maker..."
                  value={makerSearch}
                  onFocus={() => setIsMakerOpen(true)}
                  onChange={(e) => {
                    setMakerSearch(e.target.value);
                    setFormData(prev => ({ ...prev, makerId: '' }));
                    setIsMakerOpen(true);
                  }}
                  className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-12 px-4 pr-10 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white"
                />
              </div>
              {isMakerOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 max-h-[200px] overflow-y-auto">
                  {filteredMakers.map(m => (
                    <button key={m.id} type="button" onClick={() => selectMaker(m)} className="w-full text-left px-4 py-3 text-sm hover:bg-primary/10 transition-colors flex items-center gap-3">
                      <div className="size-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold">{m.initials}</div>
                      <span className="font-medium">{m.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 relative" ref={brandRef}>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Brand</label>
              <div className="relative">
                <input 
                  type="text"
                  placeholder={formData.makerId ? "Search Brand..." : "Select Maker first"}
                  value={brandSearch}
                  disabled={!formData.makerId && !campaign}
                  onFocus={() => setIsBrandOpen(true)}
                  onChange={(e) => {
                    setBrandSearch(e.target.value);
                    setFormData(prev => ({ ...prev, brandId: '' }));
                    setIsBrandOpen(true);
                  }}
                  className={`w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-12 px-4 pr-10 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white ${(!formData.makerId && !campaign) ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>
              {isBrandOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 max-h-[200px] overflow-y-auto">
                  {filteredBrands.map(b => (
                    <button key={b.id} type="button" onClick={() => selectBrand(b)} className="w-full text-left px-4 py-3 text-sm hover:bg-primary/10 transition-colors flex items-center gap-3">
                      <div className={`size-3 rounded-full ${b.colorClass || 'bg-slate-400'}`}></div>
                      <span className="font-medium">{b.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Start Date</label>
              <input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="h-12 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm px-4 focus:ring-2 focus:ring-primary dark:text-white" required />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">End Date</label>
              <input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} className="h-12 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm px-4 focus:ring-2 focus:ring-primary dark:text-white" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Proposed Price ($)</label>
              <input type="number" value={formData.proposedPrice || ''} onChange={e => setFormData({ ...formData, proposedPrice: Number(e.target.value) })} className="h-12 rounded-lg border-slate-200 bg-white dark:bg-slate-800 text-sm px-4" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Closing Price ($)</label>
              <input type="number" value={formData.closingPrice || ''} onChange={e => setFormData({ ...formData, closingPrice: Number(e.target.value) })} className="h-12 rounded-lg border-slate-200 bg-white dark:bg-slate-800 text-sm px-4" />
            </div>
          </div>

          {/* CUSTOM FIELDS SECTION */}
          {customColumns.length > 0 && (
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Custom Fields</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {customColumns.map(cc => (
                  <div key={cc.id} className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{cc.name}</label>
                    <input 
                      type={cc.type} 
                      value={formData.customFields?.[cc.id] || ''} 
                      onChange={e => updateCustomField(cc.id, e.target.value)}
                      placeholder={`Enter ${cc.name}...`}
                      className="h-12 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm px-4 focus:ring-2 focus:ring-primary dark:text-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>

        <footer className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-white dark:bg-slate-900 shrink-0">
          <button type="button" onClick={onClose} className="px-6 h-12 rounded-lg text-slate-600 dark:text-slate-400 font-bold text-sm">Cancel</button>
          <button type="submit" onClick={handleSubmit} className="px-10 h-12 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary/90">
            {campaign ? 'Save Changes' : 'Create Campaign'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default CreateCampaignModal;
