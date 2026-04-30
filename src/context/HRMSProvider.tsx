import { useReducer, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Department } from '../types';
import { api } from '../api';
import { HRMSContext } from './hrmsContext';
import type { HRMSState, HRMSAction } from './hrmsContext';

const emptyState: HRMSState = { departments: [], positions: [], employees: [] };

function getAllChildDeptIds(departments: Department[], parentId: string): string[] {
  const children = departments.filter((d) => d.parentId === parentId);
  let ids: string[] = [];
  for (const child of children) {
    ids.push(child.id);
    ids = ids.concat(getAllChildDeptIds(departments, child.id));
  }
  return ids;
}

function reducer(state: HRMSState, action: HRMSAction): HRMSState {
  switch (action.type) {
    case 'ADD_EMPLOYEE':
      return { ...state, employees: [...state.employees, { ...action.payload, id: action.payload.id ?? '', avatar: '', skills: action.payload.skills ?? [] }] };
    case 'UPDATE_EMPLOYEE':
      return { ...state, employees: state.employees.map((e) => (e.id === action.payload.id ? action.payload : e)) };
    case 'DELETE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees
          .filter((e) => e.id !== action.payload)
          .map((e) => (e.managerId === action.payload ? { ...e, managerId: null } : e)),
      };
    case 'ADD_DEPARTMENT':
      return { ...state, departments: [...state.departments, { ...action.payload, id: action.payload.id ?? '' }] };
    case 'UPDATE_DEPARTMENT':
      return { ...state, departments: state.departments.map((d) => (d.id === action.payload.id ? action.payload : d)) };
    case 'DELETE_DEPARTMENT': {
      const deptIds = getAllChildDeptIds(state.departments, action.payload);
      deptIds.push(action.payload);
      return {
        ...state,
        departments: state.departments.filter((d) => !deptIds.includes(d.id)),
        positions: state.positions.filter((p) => !deptIds.includes(p.departmentId)),
        employees: state.employees.filter((e) => !deptIds.includes(e.departmentId)),
      };
    }
    case 'ADD_POSITION':
      return { ...state, positions: [...state.positions, { ...action.payload, id: action.payload.id ?? '' }] };
    case 'UPDATE_POSITION':
      return { ...state, positions: state.positions.map((p) => (p.id === action.payload.id ? action.payload : p)) };
    case 'DELETE_POSITION':
      return {
        ...state,
        positions: state.positions.filter((p) => p.id !== action.payload),
        employees: state.employees.map((e) =>
          e.positionId === action.payload ? { ...e, positionId: '' } : e
        ),
      };
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
}

export default function HRMSProvider({ children }: { children: ReactNode }) {
  const [state, rawDispatch] = useReducer(reducer, emptyState);

  useEffect(() => {
    Promise.all([api.getDepartments(), api.getPositions(), api.getEmployees()])
      .then(([departments, positions, employees]) => {
        rawDispatch({ type: 'LOAD_STATE', payload: { departments, positions, employees } });
      })
      .catch((err) => console.error('Failed to load data from API:', err));
  }, []);

  const dispatch = useCallback(async (action: HRMSAction) => {
    try {
      switch (action.type) {
        case 'ADD_EMPLOYEE': {
          const created = await api.createEmployee(action.payload);
          if (created) {
            rawDispatch({ type: 'ADD_EMPLOYEE', payload: created });
            return;
          }
          break;
        }
        case 'UPDATE_EMPLOYEE': {
          const updated = await api.updateEmployee(action.payload);
          if (updated) {
            rawDispatch({ type: 'UPDATE_EMPLOYEE', payload: updated });
            return;
          }
          break;
        }
        case 'DELETE_EMPLOYEE':
          await api.deleteEmployee(action.payload);
          rawDispatch(action);
          return;
        case 'ADD_DEPARTMENT': {
          const created = await api.createDepartment(action.payload);
          if (created) {
            rawDispatch({ type: 'ADD_DEPARTMENT', payload: created });
            return;
          }
          break;
        }
        case 'UPDATE_DEPARTMENT': {
          const updated = await api.updateDepartment(action.payload);
          if (updated) {
            rawDispatch({ type: 'UPDATE_DEPARTMENT', payload: updated });
            return;
          }
          break;
        }
        case 'DELETE_DEPARTMENT': {
          await api.deleteDepartment(action.payload);
          const [departments, positions, employees] = await Promise.all([
            api.getDepartments(), api.getPositions(), api.getEmployees()
          ]);
          rawDispatch({ type: 'LOAD_STATE', payload: { departments, positions, employees } });
          return;
        }
        case 'ADD_POSITION': {
          const created = await api.createPosition(action.payload);
          if (created) {
            rawDispatch({ type: 'ADD_POSITION', payload: created });
            return;
          }
          break;
        }
        case 'UPDATE_POSITION': {
          const updated = await api.updatePosition(action.payload);
          if (updated) {
            rawDispatch({ type: 'UPDATE_POSITION', payload: updated });
            return;
          }
          break;
        }
        case 'DELETE_POSITION':
          await api.deletePosition(action.payload);
          rawDispatch(action);
          return;
        case 'LOAD_STATE':
          rawDispatch(action);
          return;
      }
    } catch (err) {
      console.error('API action failed:', action.type, err);
      throw err;
    }
  }, []);

  const getDepartment = (id: string) => state.departments.find((d) => d.id === id);
  const getPosition = (id: string) => state.positions.find((p) => p.id === id);
  const getEmployee = (id: string) => state.employees.find((e) => e.id === id);
  const getPositionsForDepartment = (departmentId: string) =>
    state.positions.filter((p) => p.departmentId === departmentId);
  const getEmployeesForDepartment = (departmentId: string) =>
    state.employees.filter((e) => e.departmentId === departmentId);
  const getDirectReports = (managerId: string) =>
    state.employees.filter((e) => e.managerId === managerId);

  return (
    <HRMSContext.Provider
      value={{
        state,
        dispatch,
        getDepartment,
        getPosition,
        getEmployee,
        getPositionsForDepartment,
        getEmployeesForDepartment,
        getDirectReports,
      }}
    >
      {children}
    </HRMSContext.Provider>
  );
}
