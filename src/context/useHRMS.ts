import { useContext } from 'react';
import { HRMSContext } from './hrmsContext';

export function useHRMS() {
  const context = useContext(HRMSContext);
  if (!context) throw new Error('useHRMS must be used within HRMSProvider');
  return context;
}
