
import React, { useState } from 'react';
import { Maker, Brand } from '../types';

interface Props {
  makers: Maker[];
  brands: Brand[];
  onAddMaker: (name: string) => void;
  onUpdateMaker: (id: string, name: string) => void;
  onAddBrand: (makerId: string, name: string) => void;
  onUpdateBrand: (id: string, name: string) => void;
}

const MakersBrands: React.FC<Props> = ({ 
  makers, 
  brands, 
  onAddMaker, 
  onUpdateMaker,
  onAddBrand,
  onUpdateBrand 
}) => {
  const [makerSearch, setMakerSearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  
  // States for adding
  const [isAddingMaker, setIsAddingMaker] = useState(false);
  const [newMakerName, setNewMakerName] = useState('');
  const [addingBrandToMakerId, setAddingBrandToMakerId] = useState<string | null>(null);
  const [newBrandName, setNewBrandName] = useState('');

  // States for editing
  const [editingMakerId, setEditingMakerId] = useState<string | null>(null);
  const [editMakerName, setEditMakerName] = useState('');
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [editBrandName, setEditBrandName] = useState('');

  const filteredMakers = makers.filter(m => m.name.toLowerCase().includes(makerSearch.toLowerCase()));

  const handleMakerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMakerName.trim()) {
      onAddMaker(newMakerName.trim());
      setNewMakerName('');
      setIsAddingMaker(false);
    }
  };

  const handleMakerEditSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (editMakerName.trim()) {
      onUpdateMaker(id, editMakerName.trim());
      setEditingMakerId(null);
      setEditMakerName('');
    }
  };

  const handleBrandSubmit = (e: React.FormEvent, makerId: string) => {
    e.preventDefault();
    if (newBrandName.trim()) {
      onAddBrand(makerId, newBrandName.trim());
      setNewBrandName('');
      setAddingBrandToMakerId(null);
    }
  };

  const handleBrandEditSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (editBrandName.trim()) {
      onUpdateBrand(id, editBrandName.trim());
      setEditingBrandId(null);
      setEditBrandName('');
    }
  };

  const startEditingMaker = (maker: Maker) => {
    setEditingMakerId(maker.id);
    setEditMakerName(maker.name);
    // Close other forms
    setIsAddingMaker(false);
    setAddingBrandToMakerId(null);
    setEditingBrandId(null);
  };

  const startEditingBrand = (brand: Brand) => {
    setEditingBrandId(brand.id);
    setEditBrandName(brand.name);
    // Close other forms
    setIsAddingMaker(false);
    setAddingBrandToMakerId(null);
    setEditingMakerId(null);
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight dark:text-white">Makers & Brands Management</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your advertising entities and brand hierarchies in one place.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Makers Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Makers</h3>
              <button 
                onClick={() => {
                  setIsAddingMaker(!isAddingMaker);
                  setEditingMakerId(null);
                }}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-sm active:scale-95"
              >
                <span className="material-symbols-outlined">{isAddingMaker ? 'close' : 'add'}</span>
                {isAddingMaker ? 'Cancel' : 'Add Maker'}
              </button>
            </div>

            {isAddingMaker && (
              <form onSubmit={handleMakerSubmit} className="mb-4 p-4 bg-primary/5 rounded-lg border border-primary/20 animate-in slide-in-from-top duration-200">
                <p className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">New Maker Name</p>
                <div className="flex gap-2">
                  <input 
                    autoFocus
                    type="text" 
                    value={newMakerName}
                    onChange={(e) => setNewMakerName(e.target.value)}
                    placeholder="E.g. SpaceX"
                    className="flex-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2"
                  />
                  <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold">Save</button>
                </div>
              </form>
            )}

            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input 
                type="text" 
                placeholder="Search makers..." 
                value={makerSearch}
                onChange={e => setMakerSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary dark:text-white" 
              />
            </div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto max-h-[500px] hide-scrollbar">
            {filteredMakers.map(m => (
              <div key={m.id} className={`group flex flex-col p-4 transition-colors border-l-4 ${editingMakerId === m.id ? 'bg-primary/5 border-primary' : 'hover:bg-primary/5 border-transparent hover:border-primary'}`}>
                {editingMakerId === m.id ? (
                  <form onSubmit={(e) => handleMakerEditSubmit(e, m.id)} className="animate-in fade-in duration-200">
                    <div className="flex gap-2 items-center">
                      <input 
                        autoFocus
                        type="text" 
                        value={editMakerName}
                        onChange={(e) => setEditMakerName(e.target.value)}
                        className="flex-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2"
                      />
                      <button type="submit" className="p-2 bg-primary text-white rounded-lg text-sm font-bold">
                        <span className="material-symbols-outlined text-sm">check</span>
                      </button>
                      <button type="button" onClick={() => setEditingMakerId(null)} className="p-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-bold">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-500 dark:text-gray-300">{m.initials}</div>
                      <div>
                        <p className="text-sm font-bold dark:text-white">{m.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{m.associatedBrands} brands</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEditingMaker(m)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-primary transition-all">
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Brands Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-2xl font-bold mb-6">Brands by Maker</h3>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input 
                type="text" 
                placeholder="Search brands..." 
                value={brandSearch}
                onChange={e => setBrandSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary dark:text-white" 
              />
            </div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto max-h-[500px] hide-scrollbar">
            {filteredMakers.map(m => (
              <div key={m.id} className="flex flex-col">
                <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 sticky top-0 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{m.name}</span>
                  <button 
                    onClick={() => {
                      setAddingBrandToMakerId(addingBrandToMakerId === m.id ? null : m.id);
                      setEditingBrandId(null);
                    }}
                    className="flex items-center gap-1 p-1 px-2 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all text-[10px] font-bold"
                  >
                    <span className="material-symbols-outlined text-sm">{addingBrandToMakerId === m.id ? 'close' : 'add'}</span>
                    {addingBrandToMakerId === m.id ? 'CANCEL' : 'ADD BRAND'}
                  </button>
                </div>

                {addingBrandToMakerId === m.id && (
                  <form onSubmit={(e) => handleBrandSubmit(e, m.id)} className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-800 animate-in slide-in-from-top duration-200">
                    <div className="flex gap-2">
                      <input 
                        autoFocus
                        type="text" 
                        value={newBrandName}
                        onChange={(e) => setNewBrandName(e.target.value)}
                        placeholder={`New brand for ${m.name}...`}
                        className="flex-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2"
                      />
                      <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Add</button>
                    </div>
                  </form>
                )}

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {brands
                    .filter(b => b.makerId === m.id)
                    .filter(b => b.name.toLowerCase().includes(brandSearch.toLowerCase()))
                    .map(b => (
                    <div key={b.id} className={`group flex flex-col p-4 transition-colors ${editingBrandId === b.id ? 'bg-slate-50 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                      {editingBrandId === b.id ? (
                        <form onSubmit={(e) => handleBrandEditSubmit(e, b.id)} className="animate-in fade-in duration-200">
                           <div className="flex gap-2 items-center">
                            <input 
                              autoFocus
                              type="text" 
                              value={editBrandName}
                              onChange={(e) => setEditBrandName(e.target.value)}
                              className="flex-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2"
                            />
                            <button type="submit" className="p-2 bg-emerald-600 text-white rounded-lg text-sm font-bold">
                              <span className="material-symbols-outlined text-sm">check</span>
                            </button>
                            <button type="button" onClick={() => setEditingBrandId(null)} className="p-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-bold">
                              <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`size-8 rounded-full ${b.colorClass} opacity-80 shadow-sm`}></div>
                            <p className="text-sm font-medium dark:text-white">{b.name}</p>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEditingBrand(b)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-primary transition-all">
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {brands.filter(b => b.makerId === m.id).length === 0 && !addingBrandToMakerId && (
                    <div className="p-4 text-center text-xs text-slate-400 italic">No brands added yet.</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MakersBrands;
