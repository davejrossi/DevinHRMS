import { useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Department } from '../types';
import { seedDepartments, seedPositions, seedEmployees } from '../utils/seedData';
import { HRMSContext } from './hrmsContext';
import type { HRMSState, HRMSAction } from './hrmsContext';

const STORAGE_KEY = 'hrms-data';

function getInitialState(): HRMSState {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored) as HRMSState;
    const seedPosMap = new Map(seedPositions.map((p) => [p.id, p]));
    const seedEmpMap = new Map(seedEmployees.map((e) => [e.id, e]));
    return {
      departments: parsed.departments,
      positions: parsed.positions.map((p) => {
        if (!p.requiredSkills || p.requiredSkills.length === 0) {
          const seed = seedPosMap.get(p.id);
          return { ...p, requiredSkills: seed?.requiredSkills ?? [] };
        }
        return p;
      }),
      employees: parsed.employees.map((e) => {
        if (!e.skills || e.skills.length === 0) {
          const seed = seedEmpMap.get(e.id);
          return { ...e, skills: seed?.skills ?? [] };
        }
        return e;
      }),
    };
  }
  return {
    departments: seedDepartments,
    positions: seedPositions,
    employees: seedEmployees,
  };
}

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
      return {
        ...state,
        employees: [...state.employees, { ...action.payload, id: uuidv4(), avatar: '', skills: action.payload.skills ?? [] }],
      };
    case 'UPDATE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.map((e) => (e.id === action.payload.id ? action.payload : e)),
      };
    case 'DELETE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees
          .filter((e) => e.id !== action.payload)
          .map((e) => (e.managerId === action.payload ? { ...e, managerId: null } : e)),
      };
    case 'ADD_DEPARTMENT':
      return {
        ...state,
        departments: [...state.departments, { ...action.payload, id: uuidv4() }],
      };
    case 'UPDATE_DEPARTMENT':
      return {
        ...state,
        departments: state.departments.map((d) => (d.id === action.payload.id ? action.payload : d)),
      };
    case 'DELETE_DEPARTMENT': {
      const deptIds = getAllChildDeptIds(state.departments, action.payload);
      deptIds.push(action.payload);
      return {
        ...state,
        departments: state.departments.filter((d) => !deptIds.includes(d.id)),
        positions: state.positions.filter((p) => !deptIds.includes(p.departmentId)),
        employees: state.employees.map((e) =>
          deptIds.includes(e.departmentId) ? { ...e, departmentId: '', positionId: '' } : e
        ),
      };
    }
    case 'ADD_POSITION':
      return {
        ...state,
        positions: [...state.positions, { ...action.payload, id: uuidv4() }],
      };
    case 'UPDATE_POSITION':
      return {
        ...state,
        positions: state.positions.map((p) => (p.id === action.payload.id ? action.payload : p)),
      };
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
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

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
