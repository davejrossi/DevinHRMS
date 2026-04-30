export interface Department {
  id: string;
  name: string;
  parentId: string | null;
  description: string;
}

export type ProficiencyLevel = 1 | 2 | 3 | 4 | 5;

export interface Skill {
  name: string;
  proficiency: ProficiencyLevel;
}

export interface Position {
  id: string;
  title: string;
  departmentId: string;
  description: string;
  level: 'entry' | 'mid' | 'senior' | 'lead' | 'manager' | 'director' | 'vp' | 'c-level';
  requiredSkills: Skill[];
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
  skills: Skill[];
}

export type EmployeeFormData = Omit<Employee, 'id' | 'avatar'>;

export interface OrgNode {
  department: Department;
  employees: Employee[];
  children: OrgNode[];
}
