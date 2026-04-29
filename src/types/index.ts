export interface Department {
  id: string;
  name: string;
  parentId: string | null;
  description: string;
}

export interface Position {
  id: string;
  title: string;
  departmentId: string;
  description: string;
  level: 'entry' | 'mid' | 'senior' | 'lead' | 'manager' | 'director' | 'vp' | 'c-level';
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  hireDate: string;
  departmentId: string;
  positionId: string;
  managerId: string | null;
  status: 'active' | 'inactive' | 'onleave';
  avatar: string;
}

export type EmployeeFormData = Omit<Employee, 'id' | 'avatar'>;

export interface OrgNode {
  department: Department;
  employees: Employee[];
  children: OrgNode[];
}
