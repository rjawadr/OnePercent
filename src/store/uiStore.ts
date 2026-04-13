import { create } from 'zustand';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertConfig {
  title: string;
  message?: string;
  buttons?: AlertButton[];
  type?: 'info' | 'success' | 'warning' | 'error';
}

interface UIStore {
  alertConfig: AlertConfig | null;
  showAlert: (config: AlertConfig) => void;
  hideAlert: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  alertConfig: null,
  showAlert: (config) => set({ alertConfig: config }),
  hideAlert: () => set({ alertConfig: null }),
}));
