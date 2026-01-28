
export enum MgmtStatus {
  NEW = 'New',
  IN_PROGRESS = 'In Progress',
  REVIEWING = 'Reviewing',
  PAUSED = 'Paused',
  COMPLETED = 'Completed'
}

export enum MakerStatus {
  SENT = 'Sent',
  DRAFTING = 'Drafting',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export type CustomFieldType = 'text' | 'number' | 'date';

export interface CustomColumn {
  id: string;
  name: string;
  type: CustomFieldType;
}

export interface Maker {
  id: string;
  name: string;
  initials: string;
  associatedBrands: number;
}

export interface Brand {
  id: string;
  makerId: string;
  name: string;
  category: string;
  colorClass: string;
}

export interface Campaign {
  id: string;
  makerId: string;
  brandId: string;
  name: string;
  mgmtStatus: MgmtStatus;
  makerStatus: MakerStatus;
  startDate: string; // ISO string (YYYY-MM-DD)
  endDate: string;   // ISO string (YYYY-MM-DD)
  proposedPrice: number;
  closingPrice: number;
  pptUrl?: string;
  mailUrl?: string;
  customFields?: Record<string, any>;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  isLoggedIn: boolean;
}

export type ViewType = 'workspace' | 'makers-brands' | 'analytics';
export type WorkspaceView = 'table' | 'calendar';
