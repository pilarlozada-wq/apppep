
import React, { useState, useMemo } from 'react';
import { Campaign, Maker, Brand } from '../types';

interface Props {
  campaigns: Campaign[];
  makers: Maker[];
  brands: Brand[];
}

const CampaignCalendar: React.FC<Props> = ({ campaigns, makers, brands }) => {
  const [viewDate, setViewDate] = useState(new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthName = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Get days in current viewing month
  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);
  
  // Get day of the week the month starts on (0 for Sunday, 1 for Monday...)
  const startDayOfWeek = useMemo(() => new Date(year, month, 1).getDay(), [year, month]);

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: startDayOfWeek }, (_, i) => i);

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleGoToToday = () => {
    setViewDate(new Date());
  };

  // Pre-define unique color classes
  const campaignColors = [
    'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 border-blue-200',
    'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-200 border-emerald-200',
    'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200 border-purple-200',
    'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-200 border-amber-200',
    'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-200 border-rose-200',
    'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-200 border-cyan-200',
  ];

  const isCampaignInDay = (campaign: Campaign, day: number) => {
    const checkDate = new Date(year, month, day);
    const start = new Date(campaign.startDate + 'T00:00:00');
    const end = new Date(campaign.endDate + 'T23:59:59');
    return checkDate >= start && checkDate <= end;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === month && 
           today.getFullYear() === year;
  };

  return (
    <div className="bg-white dark:bg-[#1a232e] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full min-h-[750px] animate-in fade-in duration-500">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
        <div className="flex flex-col">
          <h2 className="text-2xl font-black dark:text-white capitalize">{monthName}</h2>
          <p className="text-xs text-slate-500 font-medium">Viewing campaign schedule</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button 
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all text-slate-600 dark:text-slate-300 shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button 
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all text-slate-600 dark:text-slate-300 shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
          <button 
            onClick={handleGoToToday}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm dark:text-white"
          >
            Today
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="py-3 text-center text-[11px] font-black text-slate-400 uppercase border-r border-slate-200 dark:border-slate-800 last:border-r-0 tracking-widest">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-slate-50/30 dark:bg-slate-900/10">
        {/* Empty cells for month offset */}
        {paddingDays.map(i => (
          <div key={`p-${i}`} className="border-r border-b border-slate-100 dark:border-slate-800 p-2 bg-slate-50/50 dark:bg-slate-900/50"></div>
        ))}
        
        {days.map(day => {
          const todaysCampaigns = campaigns.filter(c => isCampaignInDay(c, day));
          const isDayToday = isToday(day);

          return (
            <div 
              key={day} 
              className={`border-r border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-transparent p-2 relative min-h-[120px] transition-colors group ${isDayToday ? 'ring-1 ring-inset ring-primary/30 bg-primary/5' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20'}`}
            >
              <span className={`text-xs font-bold ${isDayToday ? 'bg-primary text-white size-6 flex items-center justify-center rounded-full -mt-1 -ml-1 shadow-md shadow-primary/30' : 'text-slate-400 dark:text-slate-500'}`}>
                {day}
              </span>
              
              <div className="mt-2 flex flex-col gap-1 overflow-y-auto max-h-[100px] hide-scrollbar">
                {todaysCampaigns.map((c) => {
                  const colorClass = campaignColors[parseInt(c.id.replace(/\D/g, '') || '0') % campaignColors.length];
                  const brand = brands.find(b => b.id === c.brandId);
                  
                  // Simple logic to show indicator if campaign starts or ends today
                  const isStart = new Date(c.startDate + 'T00:00:00').getDate() === day && new Date(c.startDate + 'T00:00:00').getMonth() === month;
                  const isEnd = new Date(c.endDate + 'T00:00:00').getDate() === day && new Date(c.endDate + 'T00:00:00').getMonth() === month;

                  return (
                    <div 
                      key={c.id} 
                      className={`${colorClass} text-[9px] font-bold px-2 py-1.5 rounded-md border truncate shadow-xs transition-transform hover:scale-[1.02] cursor-pointer relative ${isStart ? 'rounded-l-md border-l-2' : ''} ${isEnd ? 'rounded-r-md border-r-2' : ''}`} 
                      title={`${c.name} (${brand?.name})`}
                    >
                      {isStart ? <span className="mr-1 inline-block size-1 bg-current rounded-full"></span> : null}
                      {c.name}
                    </div>
                  );
                })}
              </div>
              
              {/* Subtle indicator for many campaigns */}
              {todaysCampaigns.length > 4 && (
                <div className="absolute bottom-1 right-2 text-[8px] font-bold text-slate-400">
                  +{todaysCampaigns.length - 4} more
                </div>
              )}
            </div>
          );
        })}

        {/* Fill remaining cells of the grid if necessary */}
        {Array.from({ length: (7 - ((startDayOfWeek + daysInMonth) % 7)) % 7 }).map((_, i) => (
          <div key={`empty-end-${i}`} className="border-r border-b border-slate-100 dark:border-slate-800 p-2 bg-slate-50/50 dark:bg-slate-900/50"></div>
        ))}
      </div>
    </div>
  );
};

export default CampaignCalendar;
