
import React, { useState, useMemo, useEffect } from 'react';
import { Campaign, MgmtStatus, MakerStatus, Maker, Brand, CustomColumn, UserProfile } from './types';
import { INITIAL_CAMPAIGNS, MAKERS, BRANDS } from './constants';
import CampaignTable from './components/CampaignTable';
import CampaignCalendar from './components/CampaignCalendar';
import MakersBrands from './components/MakersBrands';
import AnalyticsView from './components/AnalyticsView';
import CreateCampaignModal from './components/CreateCampaignModal';
import SettingsView from './components/SettingsView';

const DEFAULT_COLUMN_ORDER = [
  'maker', 'brand', 'name', 'mgmtStatus', 'makerStatus', 'timeline', 'links', 'proposedPrice', 'closingPrice'
];

const App: React.FC = () => {
  const [activeMainView, setActiveMainView] = useState<'dashboard' | 'campaigns' | 'makers-brands' | 'settings'>('dashboard');
  const [activeSubTab, setActiveSubTab] = useState<'table' | 'calendar'>('table');
  
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const saved = localStorage.getItem('cp_campaigns');
    return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
  });

  const [makers, setMakers] = useState<Maker[]>(() => {
    const saved = localStorage.getItem('cp_makers');
    return saved ? JSON.parse(saved) : MAKERS;
  });

  const [brands, setBrands] = useState<Brand[]>(() => {
    const saved = localStorage.getItem('cp_brands');
    return saved ? JSON.parse(saved) : BRANDS;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('cp_user_profile');
    return saved ? JSON.parse(saved) : { name: '', email: '', avatarUrl: '', isLoggedIn: false };
  });

  const [customColumns, setCustomColumns] = useState<CustomColumn[]>(() => {
    const saved = localStorage.getItem('cp_custom_columns');
    return saved ? JSON.parse(saved) : [];
  });

  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('cp_column_order');
    return saved ? JSON.parse(saved) : DEFAULT_COLUMN_ORDER;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    localStorage.setItem('cp_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  useEffect(() => {
    localStorage.setItem('cp_makers', JSON.stringify(makers));
  }, [makers]);

  useEffect(() => {
    localStorage.setItem('cp_brands', JSON.stringify(brands));
  }, [brands]);

  useEffect(() => {
    localStorage.setItem('cp_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('cp_custom_columns', JSON.stringify(customColumns));
  }, [customColumns]);

  useEffect(() => {
    localStorage.setItem('cp_column_order', JSON.stringify(columnOrder));
  }, [columnOrder]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      makers.find(m => m.id === c.makerId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [campaigns, searchQuery, makers]);

  const handleUpdateStatus = (id: string, field: 'mgmtStatus' | 'makerStatus', value: any) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleCreateOrUpdateCampaign = (data: Partial<Campaign>) => {
    if (editingCampaign) {
      setCampaigns(prev => prev.map(c => c.id === editingCampaign.id ? { ...c, ...data } : c));
    } else {
      const newCampaign: Campaign = {
        id: `c${Date.now()}`,
        makerId: data.makerId || makers[0].id,
        brandId: data.brandId || brands[0].id,
        name: data.name || 'Untitled Campaign',
        mgmtStatus: data.mgmtStatus || MgmtStatus.NEW,
        makerStatus: data.makerStatus || MakerStatus.DRAFTING,
        startDate: data.startDate || new Date().toISOString().split('T')[0],
        endDate: data.endDate || new Date().toISOString().split('T')[0],
        proposedPrice: data.proposedPrice || 0,
        closingPrice: data.closingPrice || 0,
        pptUrl: data.pptUrl || '',
        customFields: data.customFields || {},
      };
      setCampaigns(prev => [...prev, newCampaign]);
    }
    closeModal();
  };

  const handleAddCustomColumn = (column: CustomColumn) => {
    setCustomColumns(prev => [...prev, column]);
    setColumnOrder(prev => [...prev, column.id]);
  };

  const handleDeleteCustomColumn = (id: string) => {
    setCustomColumns(prev => prev.filter(c => c.id !== id));
    setColumnOrder(prev => prev.filter(colId => colId !== id));
  };

  const handleMoveColumn = (id: string, direction: 'left' | 'right') => {
    const index = columnOrder.indexOf(id);
    if (index === -1) return;
    
    const newOrder = [...columnOrder];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newOrder.length) {
      [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
      setColumnOrder(newOrder);
    }
  };

  const handleAddMaker = (name: string) => {
    const newMaker: Maker = {
      id: `m${Date.now()}`,
      name,
      initials: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      associatedBrands: 0
    };
    setMakers(prev => [...prev, newMaker]);
  };

  const handleUpdateMaker = (id: string, name: string) => {
    setMakers(prev => prev.map(m => m.id === id ? { 
      ...m, 
      name, 
      initials: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) 
    } : m));
  };

  const handleAddBrand = (makerId: string, name: string) => {
    const newBrand: Brand = {
      id: `b${Date.now()}`,
      makerId,
      name,
      category: 'General',
      colorClass: `bg-${['blue', 'emerald', 'purple', 'amber', 'rose', 'cyan', 'indigo', 'pink', 'orange', 'lime'][Math.floor(Math.random() * 10)]}-500`
    };
    setBrands(prev => [...prev, newBrand]);
    setMakers(prev => prev.map(m => m.id === makerId ? { ...m, associatedBrands: m.associatedBrands + 1 } : m));
  };

  const handleUpdateBrand = (id: string, name: string) => {
    setBrands(prev => prev.map(b => b.id === id ? { ...b, name } : b));
  };

  const openModal = (campaign?: Campaign) => {
    if (campaign) setEditingCampaign(campaign);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingCampaign(null);
    setIsModalOpen(false);
  };

  const handleResetData = () => {
    if (window.confirm("¿Seguro que quieres resetear todo? Se borrarán todos los cambios locales.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const renderContent = () => {
    if (activeMainView === 'dashboard') {
      return <AnalyticsView campaigns={campaigns} makers={makers} brands={brands} onViewAll={() => setActiveMainView('campaigns')} />;
    }

    if (activeMainView === 'makers-brands') {
      return (
        <MakersBrands 
          makers={makers} 
          brands={brands} 
          onAddMaker={handleAddMaker} 
          onUpdateMaker={handleUpdateMaker}
          onAddBrand={handleAddBrand} 
          onUpdateBrand={handleUpdateBrand}
        />
      );
    }

    if (activeMainView === 'settings') {
      return (
        <SettingsView 
          profile={userProfile} 
          onUpdateProfile={setUserProfile} 
          onResetData={handleResetData} 
        />
      );
    }

    return (
      <>
        <div className="mb-6">
          <div className="flex border-b border-[#dbe0e6] dark:border-slate-800 gap-8">
            <button 
              onClick={() => setActiveSubTab('table')}
              className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 transition-all ${activeSubTab === 'table' ? 'border-primary text-primary' : 'border-transparent text-[#617589] dark:text-slate-400 hover:text-primary'}`}
            >
              <p className="text-sm font-bold leading-normal tracking-[0.015em]">Table</p>
            </button>
            <button 
              onClick={() => setActiveSubTab('calendar')}
              className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 transition-all ${activeSubTab === 'calendar' ? 'border-primary text-primary' : 'border-transparent text-[#617589] dark:text-slate-400 hover:text-primary'}`}
            >
              <p className="text-sm font-bold leading-normal tracking-[0.015em]">Calendar</p>
            </button>
          </div>
        </div>

        <div className="animate-in fade-in duration-300">
          {activeSubTab === 'table' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-[#111418] dark:text-white text-[24px] font-bold">Campaigns List</h2>
                <button onClick={() => openModal()} className="flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-white text-sm font-bold hover:bg-primary/90 transition-all shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">add_circle</span>
                  <span>New Campaign</span>
                </button>
              </div>
              <CampaignTable 
                campaigns={filteredCampaigns} 
                makers={makers} 
                brands={brands} 
                customColumns={customColumns}
                columnOrder={columnOrder}
                onUpdateStatus={handleUpdateStatus} 
                onEdit={openModal} 
                onAddColumn={handleAddCustomColumn}
                onDeleteColumn={handleDeleteCustomColumn}
                onMoveColumn={handleMoveColumn}
              />
            </div>
          )}
          {activeSubTab === 'calendar' && <CampaignCalendar campaigns={filteredCampaigns} makers={makers} brands={brands} />}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark">
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#dbe0e6] dark:border-slate-800 bg-white dark:bg-background-dark px-10 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 text-primary cursor-pointer" onClick={() => setActiveMainView('dashboard')}>
            <div className="bg-primary/10 p-1.5 rounded-lg text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">analytics</span>
            </div>
            <h2 className="text-lg font-bold tracking-tight text-[#111418] dark:text-white">Campaign Manager</h2>
          </div>
          
          <div className="relative hidden lg:block">
             <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#617589] text-lg">search</span>
             <input 
              type="text" 
              placeholder="Search campaigns..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background-light dark:bg-slate-800 border-none rounded-lg py-2 pl-10 pr-4 text-sm w-64 focus:ring-1 focus:ring-primary dark:text-white"
             />
          </div>
        </div>

        <div className="flex flex-1 justify-end gap-8 items-center">
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => setActiveMainView('dashboard')} className={`text-sm font-medium transition-all ${activeMainView === 'dashboard' ? 'text-primary' : 'text-[#617589] dark:text-slate-400 hover:text-primary'}`}>Dashboard</button>
            <button onClick={() => setActiveMainView('campaigns')} className={`text-sm font-medium transition-all ${activeMainView === 'campaigns' ? 'text-primary' : 'text-[#617589] dark:text-slate-400 hover:text-primary'}`}>Campaigns</button>
            <button onClick={() => setActiveMainView('makers-brands')} className={`text-sm font-medium transition-all ${activeMainView === 'makers-brands' ? 'text-primary' : 'text-[#617589] dark:text-slate-400 hover:text-primary'}`}>Makers & Brands</button>
          </nav>
          
          <div className="flex gap-4 items-center">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="flex items-center justify-center rounded-lg h-10 w-10 bg-background-light dark:bg-slate-800 text-[#111418] dark:text-white transition-all hover:bg-gray-200 dark:hover:bg-gray-700">
              <span className="material-symbols-outlined text-[20px]">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
            </button>
            
            <div 
              onClick={() => setActiveMainView('settings')}
              className={`flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full cursor-pointer transition-all border ${activeMainView === 'settings' ? 'bg-primary/10 border-primary/30 text-primary' : 'hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent'}`}
            >
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-[11px] font-black leading-none uppercase tracking-widest">{userProfile.isLoggedIn ? userProfile.name.split(' ')[0] : 'Guest'}</span>
                <span className="text-[9px] font-bold text-slate-400 leading-none mt-1">{userProfile.isLoggedIn ? 'PRO USER' : 'SIGN IN'}</span>
              </div>
              <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/20">
                {userProfile.isLoggedIn && userProfile.avatarUrl ? (
                  <img src={userProfile.avatarUrl} alt="avatar" className="size-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-primary text-[20px]">person</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-10 max-w-[1400px] mx-auto w-full">
        {renderContent()}
      </main>

      {isModalOpen && (
        <CreateCampaignModal 
          isOpen={isModalOpen} 
          onClose={closeModal} 
          onCreate={handleCreateOrUpdateCampaign} 
          campaign={editingCampaign || undefined} 
          makers={makers} 
          brands={brands}
          customColumns={customColumns}
        />
      )}
    </div>
  );
};

export default App;
