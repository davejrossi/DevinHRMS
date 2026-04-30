import { createContext } from 'react';
import type { Department, Position, Employee } from '../types';

export interface HRMSState {
  departments: Department[];
  positions: Position[];
  employees: Employee[];
}

export interface HRMSContextType {
  state: HRMSState;
  dispatch: (action: HRMSAction) => Promise<void>;
  getDepartment: (id: string) => Department | undefined;
  getPosition: (id: string) => Position | undefined;
  getEmployee: (id: string) => Employee | undefined;
  getPositionsForDepartment: (departmentId: string) => Position[];
  getEmployeesForDepartment: (departmentId: string) => Employee[];
  getDirectReports: (managerId: string) => Employee[];
}

export type HRMSAction =
  | { type: 'ADD_EMPLOYEE'; payload: Omit<Employee, 'id' | 'avatar'> & { id?: string } }
  | { type: 'UPDATE_EMPLOYEE'; payload: Employee }
  | { type: 'DELETE_EMPLOYEE'; payload: string }
  | { type: 'ADD_DEPARTMENT'; payload: Omit<Department, 'id'> & { id?: string } }
  | { type: 'UPDATE_DEPARTMENT'; payload: Department }
  | { type: 'DELETE_DEPARTMENT'; payload: string }
  | { type: 'ADD_POSITION'; payload: Omit<Position, 'id'> & { id?: string } }
  | { type: 'UPDATE_POSITION'; payload: Position }
  | { type: 'DELETE_POSITION'; payload: string }
  | { type: 'LOAD_STATE'; payload: HRMSState };

export const HRMSContext = createContext<HRMSContextType | null>(null);
