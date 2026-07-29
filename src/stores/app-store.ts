import { create } from 'zustand';

type AppView = 'landing' | 'rms';
type RMSPage =
  | 'dashboard'
  | 'businesses'
  | 'properties'
  | 'rates'
  | 'billing'
  | 'payments'
  | 'payment-history'
  | 'receipts'
  | 'reports'
  | 'users'
  | 'settings'
  | 'search'
  | 'audit-trail';

interface AppState {
  view: AppView;
  rmsPage: RMSPage;
  setView: (view: AppView) => void;
  setRMSPage: (page: RMSPage) => void;
  openRMS: () => void;
  backToLanding: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  view: 'landing',
  rmsPage: 'dashboard',
  setView: (view) => set({ view }),
  setRMSPage: (page) => set({ rmsPage: page }),
  openRMS: () => set({ view: 'rms', rmsPage: 'dashboard' }),
  backToLanding: () => set({ view: 'landing' }),
}));

export type { AppView, RMSPage };
