
import React, { useMemo } from 'react';
import { Campaign, MgmtStatus, Maker, Brand } from '../types';

interface Props {
  campaigns: Campaign[];
  makers: Maker[];
  brands: Brand[];
  onViewAll?: () => void;
}

const AnalyticsView: React.FC<Props> = ({ campaigns, makers, brands, onViewAll }) => {
  // KPIs dinámicos
  const totalProposed = campaigns.reduce((acc, c) => acc + c.proposedPrice, 0);
  const totalClosed = campaigns.reduce((acc, c) => acc + c.closingPrice, 0);
  const totalDiff = totalClosed - totalProposed;

  // Función para exportar a CSV
  const handleExportCSV = () => {
    if (campaigns.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = ["Campaign Name", "Maker", "Brand", "Status", "Proposed Price", "Closing Price", "Start Date", "End Date"];
    const rows = campaigns.map(c => [
      c.name,
      makers.find(m => m.id === c.makerId)?.name || 'Unknown',
      brands.find(b => b.id === c.brandId)?.name || 'Unknown',
      c.mgmtStatus,
      c.proposedPrice,
      c.closingPrice,
      c.startDate,
      c.endDate
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `campaign_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Datos dinámicos para el gráfico de barras APILADO (Spending per Maker / Brand)
  const stackedData = useMemo(() => {
    const data = makers.map(maker => {
      const makerCampaigns = campaigns.filter(c => c.makerId === maker.id);
      const brandsInMaker = brands.filter(b => b.makerId === maker.id);
      
      const spendingByBrand = brandsInMaker.map(brand => {
        const spend = makerCampaigns
          .filter(c => c.brandId === brand.id)
          .reduce((sum, c) => sum + c.closingPrice, 0);
        return {
          brandId: brand.id,
          brandName: brand.name,
          spend,
          color: brand.colorClass || 'bg-primary'
        };
      }).filter(b => b.spend > 0);

      const totalMakerSpend = spendingByBrand.reduce((sum, b) => sum + b.spend, 0);

      return {
        makerName: maker.name,
        brands: spendingByBrand,
        total: totalMakerSpend
      };
    }).filter(m => m.total > 0);

    const maxTotal = Math.max(...data.map(d => d.total), 1);
    return data.map(d => ({
      ...d,
      relativeHeight: `${(d.total / maxTotal) * 100}%`
    }));
  }, [campaigns, makers, brands]);

  // Leyenda dinámica: todas las marcas que tienen gasto actual
  const activeBrandsLegend = useMemo(() => {
    const brandIdsWithSpend = new Set<string>();
    campaigns.forEach(c => {
      if (c.closingPrice > 0) brandIdsWithSpend.add(c.brandId);
    });
    
    return brands.filter(b => brandIdsWithSpend.has(b.id));
  }, [campaigns, brands]);

  // Datos dinámicos para la distribución de campañas (Doughnut chart)
  const distributionData = useMemo(() => {
    const counts = {
      [MgmtStatus.NEW]: 0,
      [MgmtStatus.IN_PROGRESS]: 0,
      [MgmtStatus.REVIEWING]: 0,
      [MgmtStatus.PAUSED]: 0,
      [MgmtStatus.COMPLETED]: 0,
    };

    campaigns.forEach(c => {
      counts[c.mgmtStatus]++;
    });

    const total = campaigns.length || 1;
    return {
      active: ((counts[MgmtStatus.IN_PROGRESS] + counts[MgmtStatus.REVIEWING]) / total) * 100,
      completed: (counts[MgmtStatus.COMPLETED] / total) * 100,
      paused: (counts[MgmtStatus.PAUSED] / total) * 100,
      new: (counts[MgmtStatus.NEW] / total) * 100,
      counts
    };
  }, [campaigns]);

  const kpis = [
    {
      title: 'TOTAL PROPOSED',
      value: `$${totalProposed.toLocaleString()}`,
      change: '+12% from last month',
      isPositive: true,
      icon: 'request_quote',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary'
    },
    {
      title: 'TOTAL CLOSED',
      value: `$${totalClosed.toLocaleString()}`,
      change: totalClosed > totalProposed ? '+5% above target' : '-3% vs target',
      isPositive: totalClosed >= totalProposed,
      icon: 'check_circle',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'TOTAL DIFFERENCE',
      value: `${totalDiff < 0 ? '-' : ''}$${Math.abs(totalDiff).toLocaleString()}`,
      change: 'Calculated in real-time',
      isPositive: totalDiff >= 0,
      icon: 'balance',
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400'
    }
  ];

  return (
    <div className="animate-in fade-in duration-500 space-y-8 pb-10">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[#111418] dark:text-white text-3xl font-black leading-tight tracking-tight">Performance Overview</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Real-time metrics from your active campaigns</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-bold shadow-md hover:bg-primary/90 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="group relative overflow-hidden flex flex-col gap-3 rounded-2xl p-6 bg-white dark:bg-[#1c2632] border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
            <div className="flex justify-between items-start">
              <p className="text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-widest">{kpi.title}</p>
              <div className={`p-2.5 rounded-xl ${kpi.iconBg} ${kpi.iconColor} transition-transform group-hover:scale-110`}>
                <span className="material-symbols-outlined">{kpi.icon}</span>
              </div>
            </div>
            <p className="text-[#111418] dark:text-white tracking-tighter text-3xl font-black leading-none tabular-nums">
              {kpi.value}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-black ${kpi.isPositive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                <span className="material-symbols-outlined text-[14px]">
                  {kpi.isPositive ? 'trending_up' : 'trending_down'}
                </span>
                {kpi.change.split(' ')[0]}
              </div>
              <p className="text-xs font-medium text-slate-400">{kpi.change.split(' ').slice(1).join(' ')}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico de Barras Apilado */}
        <div className="lg:col-span-2 flex flex-col gap-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1c2632] p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-[#111418] dark:text-white text-xl font-black leading-tight">Spending per Maker</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Stacked by brand contribution</p>
            </div>
            {/* Leyenda Dinámica */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 max-w-[400px] justify-end">
              {activeBrandsLegend.length > 0 ? activeBrandsLegend.map(b => (
                <div key={b.id} className="flex items-center gap-1.5">
                  <div className={`size-2.5 rounded-full ${b.colorClass} border border-white/20`}></div>
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight">{b.name}</span>
                </div>
              )) : (
                <span className="text-[10px] text-slate-400 italic">No brands with spend yet</span>
              )}
            </div>
          </div>
          
          <div className="flex items-end justify-between h-[350px] gap-6 pt-10 px-4 relative">
            {/* Grid lines background */}
            <div className="absolute inset-x-0 bottom-0 top-10 flex flex-col justify-between pointer-events-none opacity-[0.03] dark:opacity-[0.1]">
              {[...Array(5)].map((_, i) => <div key={i} className="w-full border-t border-slate-900 dark:border-white"></div>)}
            </div>

            {stackedData.length > 0 ? (
              stackedData.map((maker, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-4 group h-full justify-end z-10">
                  <div className="w-full flex flex-col-reverse rounded-t-xl overflow-hidden shadow-sm transition-all group-hover:shadow-lg group-hover:brightness-110" style={{ height: maker.relativeHeight }}>
                    {maker.brands.map((b, bIdx) => (
                      <div 
                        key={bIdx} 
                        className={`${b.color} w-full relative group/segment transition-all duration-300 border-t border-white/10 first:border-t-0 cursor-pointer hover:brightness-125 hover:scale-x-105 z-10`} 
                        style={{ height: `${(b.spend / maker.total) * 100}%` }}
                      >
                        {/* Tooltip centrado en el segmento */}
                        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[10px] py-2 px-3 rounded-lg opacity-0 group-hover/segment:opacity-100 group-hover/segment:scale-110 transition-all pointer-events-none z-[60] whitespace-nowrap font-black shadow-2xl border border-slate-700">
                          <div className="flex items-center gap-2">
                             <div className={`size-2.5 rounded-full ${b.color} border border-white/20`}></div>
                             <span>{b.brandName}</span>
                             <span className="text-white/50 px-1.5 border-l border-white/20">${b.spend.toLocaleString()}</span>
                          </div>
                          {/* Pequeño indicador de flecha */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-slate-900"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-center w-full">
                    <p className="text-[#111418] dark:text-white text-[10px] font-black uppercase tracking-[0.1em] truncate mb-0.5" title={maker.makerName}>
                      {maker.makerName}
                    </p>
                    <p className="text-primary text-[10px] font-black tabular-nums tracking-wider">${maker.total.toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-3 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                <span className="material-symbols-outlined text-5xl">bar_chart</span>
                <p className="text-sm font-bold">No data to display</p>
              </div>
            )}
          </div>
        </div>

        {/* Campaign Distribution */}
        <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1c2632] p-8 shadow-sm">
          <div>
            <p className="text-[#111418] dark:text-white text-xl font-black leading-tight">Campaign Status</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Operational distribution</p>
          </div>
          
          <div className="relative flex justify-center items-center py-4">
            <div className="relative w-48 h-48 group">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="currentColor" strokeWidth="4" className="text-slate-100 dark:text-slate-800"></circle>
                <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#137fec" strokeWidth="4" strokeDasharray={`${distributionData.active} ${100 - distributionData.active}`} strokeDashoffset="0"></circle>
                <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#078838" strokeWidth="4" strokeDasharray={`${distributionData.completed} ${100 - distributionData.completed}`} strokeDashoffset={-distributionData.active}></circle>
                <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#f59e0b" strokeWidth="4" strokeDasharray={`${distributionData.paused} ${100 - distributionData.paused}`} strokeDashoffset={-(distributionData.active + distributionData.completed)}></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform group-hover:scale-110">
                <span className="text-4xl font-black dark:text-white tabular-nums leading-none">{campaigns.length}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest mt-1">Campaigns</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { label: 'Active / Review', color: 'bg-primary', count: distributionData.counts[MgmtStatus.IN_PROGRESS] + distributionData.counts[MgmtStatus.REVIEWING] },
              { label: 'Completed', color: 'bg-emerald-500', count: distributionData.counts[MgmtStatus.COMPLETED] },
              { label: 'Paused', color: 'bg-amber-500', count: distributionData.counts[MgmtStatus.PAUSED] },
              { label: 'New', color: 'bg-slate-200 dark:bg-slate-600', count: distributionData.counts[MgmtStatus.NEW] }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`size-3 rounded-full ${item.color} shadow-sm`}></div>
                  <span className="text-xs font-bold dark:text-slate-300">{item.label}</span>
                </div>
                <span className="text-xs font-black dark:text-white tabular-nums">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1c2632] shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-xl font-black leading-tight">Top Performing Campaigns</h3>
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full">Sorted by Spend</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-[#0f172a]/50 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-4">Campaign Name</th>
                <th className="px-8 py-4">Brand / Maker</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Revenue (Closed)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[...campaigns].sort((a, b) => b.closingPrice - a.closingPrice).slice(0, 5).map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary transition-colors">{c.name}</span>
                      <span className="text-[10px] font-medium text-slate-400">ID: {c.id}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {brands.find(b => b.id === c.brandId)?.name || 'Unknown'}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                        {makers.find(m => m.id === c.makerId)?.name || 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      c.mgmtStatus === MgmtStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                      c.mgmtStatus === MgmtStatus.PAUSED ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {c.mgmtStatus}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right font-black text-sm tabular-nums text-slate-900 dark:text-white">
                    ${c.closingPrice.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-8 py-6 text-center border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10">
          <button 
            onClick={onViewAll}
            className="group flex items-center justify-center gap-2 mx-auto text-primary text-sm font-black uppercase tracking-widest hover:text-primary/80 transition-all"
          >
            Manage All Campaigns
            <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
