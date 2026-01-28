
import { MgmtStatus, MakerStatus, Maker, Brand, Campaign } from './types';

export const MAKERS: Maker[] = [
  { id: 'm1', name: 'Acme Corp', initials: 'AC', associatedBrands: 8 },
  { id: 'm2', name: 'TechFlow', initials: 'TF', associatedBrands: 5 },
  { id: 'm3', name: 'Zion Retail', initials: 'ZN', associatedBrands: 12 },
  { id: 'm4', name: 'Alpha Auto', initials: 'AL', associatedBrands: 24 },
  { id: 'm5', name: 'Wayne Enterprises', initials: 'WE', associatedBrands: 15 },
  { id: 'm6', name: 'Globex Corp', initials: 'GL', associatedBrands: 10 },
];

export const BRANDS: Brand[] = [
  { id: 'b1', makerId: 'm1', name: 'Global Tech', category: 'Technology', colorClass: 'bg-blue-500' },
  { id: 'b2', makerId: 'm2', name: 'SaaS Suite', category: 'Software', colorClass: 'bg-purple-500' },
  { id: 'b3', makerId: 'm3', name: 'Apparel', category: 'Retail', colorClass: 'bg-orange-500' },
  { id: 'b4', makerId: 'm4', name: 'Automotive', category: 'Cars', colorClass: 'bg-cyan-500' },
  { id: 'b5', makerId: 'm6', name: 'Apex Dynamics', category: 'Tech', colorClass: 'bg-indigo-500' },
  { id: 'b6', makerId: 'm6', name: 'Zenith Tech', category: 'Systems', colorClass: 'bg-pink-500' },
];

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'c1',
    makerId: 'm1',
    brandId: 'b1',
    name: 'Spring Product Launch 2024',
    mgmtStatus: MgmtStatus.IN_PROGRESS,
    makerStatus: MakerStatus.SENT,
    startDate: '2024-03-01',
    endDate: '2024-03-08',
    proposedPrice: 12500,
    closingPrice: 11200,
  },
  {
    id: 'c2',
    makerId: 'm2',
    brandId: 'b2',
    name: 'AI Feature Roadmap Promo',
    mgmtStatus: MgmtStatus.REVIEWING,
    makerStatus: MakerStatus.DRAFTING,
    startDate: '2024-03-05',
    endDate: '2024-03-12',
    proposedPrice: 8200,
    closingPrice: 8500,
  },
  {
    id: 'c3',
    makerId: 'm3',
    brandId: 'b3',
    name: 'Winter Clearance Sale',
    mgmtStatus: MgmtStatus.COMPLETED,
    makerStatus: MakerStatus.APPROVED,
    startDate: '2024-03-15',
    endDate: '2024-03-22',
    proposedPrice: 20000,
    closingPrice: 21500,
  },
  {
    id: 'c4',
    makerId: 'm4',
    brandId: 'b4',
    name: 'Model X Reservation Campaign',
    mgmtStatus: MgmtStatus.PAUSED,
    makerStatus: MakerStatus.SENT,
    startDate: '2024-03-20',
    endDate: '2024-03-28',
    proposedPrice: 15000,
    closingPrice: 15000,
  },
];
