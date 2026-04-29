import type { Department, Position, Employee } from '../types';

export const seedDepartments: Department[] = [
  { id: 'dept-1', name: 'Executive', parentId: null, description: 'Executive leadership team' },
  { id: 'dept-2', name: 'Engineering', parentId: 'dept-1', description: 'Software engineering and development' },
  { id: 'dept-3', name: 'Human Resources', parentId: 'dept-1', description: 'People operations and talent management' },
  { id: 'dept-4', name: 'Sales', parentId: 'dept-1', description: 'Revenue generation and client relations' },
  { id: 'dept-5', name: 'Marketing', parentId: 'dept-1', description: 'Brand management and growth' },
  { id: 'dept-6', name: 'Frontend', parentId: 'dept-2', description: 'Frontend development team' },
  { id: 'dept-7', name: 'Backend', parentId: 'dept-2', description: 'Backend development team' },
  { id: 'dept-8', name: 'DevOps', parentId: 'dept-2', description: 'Infrastructure and deployment' },
  { id: 'dept-9', name: 'Finance', parentId: 'dept-1', description: 'Financial planning and accounting' },
  { id: 'dept-10', name: 'Customer Support', parentId: 'dept-1', description: 'Customer service and support' },
  { id: 'dept-11', name: 'QA', parentId: 'dept-2', description: 'Quality assurance and testing' },
  { id: 'dept-12', name: 'Product', parentId: 'dept-1', description: 'Product management and strategy' },
];

export const seedPositions: Position[] = [
  { id: 'pos-1', title: 'CEO', departmentId: 'dept-1', description: 'Chief Executive Officer', level: 'c-level' },
  { id: 'pos-2', title: 'CTO', departmentId: 'dept-2', description: 'Chief Technology Officer', level: 'c-level' },
  { id: 'pos-3', title: 'VP of HR', departmentId: 'dept-3', description: 'Vice President of Human Resources', level: 'vp' },
  { id: 'pos-4', title: 'VP of Sales', departmentId: 'dept-4', description: 'Vice President of Sales', level: 'vp' },
  { id: 'pos-5', title: 'Marketing Director', departmentId: 'dept-5', description: 'Director of Marketing', level: 'director' },
  { id: 'pos-6', title: 'Frontend Lead', departmentId: 'dept-6', description: 'Frontend Team Lead', level: 'lead' },
  { id: 'pos-7', title: 'Backend Lead', departmentId: 'dept-7', description: 'Backend Team Lead', level: 'lead' },
  { id: 'pos-8', title: 'DevOps Engineer', departmentId: 'dept-8', description: 'Senior DevOps Engineer', level: 'senior' },
  { id: 'pos-9', title: 'Frontend Engineer', departmentId: 'dept-6', description: 'Frontend Software Engineer', level: 'mid' },
  { id: 'pos-10', title: 'Backend Engineer', departmentId: 'dept-7', description: 'Backend Software Engineer', level: 'mid' },
  { id: 'pos-11', title: 'HR Specialist', departmentId: 'dept-3', description: 'Human Resources Specialist', level: 'mid' },
  { id: 'pos-12', title: 'Sales Representative', departmentId: 'dept-4', description: 'Sales Representative', level: 'entry' },
  { id: 'pos-13', title: 'Marketing Specialist', departmentId: 'dept-5', description: 'Marketing Specialist', level: 'mid' },
  { id: 'pos-14', title: 'Junior Frontend Dev', departmentId: 'dept-6', description: 'Junior Frontend Developer', level: 'entry' },
  { id: 'pos-15', title: 'Junior Backend Dev', departmentId: 'dept-7', description: 'Junior Backend Developer', level: 'entry' },
  { id: 'pos-16', title: 'CFO', departmentId: 'dept-9', description: 'Chief Financial Officer', level: 'c-level' },
  { id: 'pos-17', title: 'Financial Analyst', departmentId: 'dept-9', description: 'Financial Analyst', level: 'mid' },
  { id: 'pos-18', title: 'Accountant', departmentId: 'dept-9', description: 'Staff Accountant', level: 'entry' },
  { id: 'pos-19', title: 'Support Manager', departmentId: 'dept-10', description: 'Customer Support Manager', level: 'manager' },
  { id: 'pos-20', title: 'Support Specialist', departmentId: 'dept-10', description: 'Customer Support Specialist', level: 'entry' },
  { id: 'pos-21', title: 'QA Lead', departmentId: 'dept-11', description: 'QA Team Lead', level: 'lead' },
  { id: 'pos-22', title: 'QA Engineer', departmentId: 'dept-11', description: 'Quality Assurance Engineer', level: 'mid' },
  { id: 'pos-23', title: 'Product Manager', departmentId: 'dept-12', description: 'Product Manager', level: 'manager' },
  { id: 'pos-24', title: 'Product Analyst', departmentId: 'dept-12', description: 'Product Analyst', level: 'mid' },
  { id: 'pos-25', title: 'Senior Backend Engineer', departmentId: 'dept-7', description: 'Senior Backend Engineer', level: 'senior' },
  { id: 'pos-26', title: 'Senior Frontend Engineer', departmentId: 'dept-6', description: 'Senior Frontend Engineer', level: 'senior' },
  { id: 'pos-27', title: 'Sales Manager', departmentId: 'dept-4', description: 'Sales Team Manager', level: 'manager' },
  { id: 'pos-28', title: 'HR Manager', departmentId: 'dept-3', description: 'HR Operations Manager', level: 'manager' },
  { id: 'pos-29', title: 'Content Strategist', departmentId: 'dept-5', description: 'Content Strategy Specialist', level: 'mid' },
  { id: 'pos-30', title: 'DevOps Lead', departmentId: 'dept-8', description: 'DevOps Team Lead', level: 'lead' },
];

export const seedEmployees: Employee[] = [
  // Executive
  { id: 'emp-1', firstName: 'Sarah', lastName: 'Chen', email: 'sarah.chen@company.com', phone: '(555) 100-0001', hireDate: '2018-03-15', departmentId: 'dept-1', positionId: 'pos-1', managerId: null, status: 'active', avatar: '' },

  // Engineering Leadership
  { id: 'emp-2', firstName: 'James', lastName: 'Wilson', email: 'james.wilson@company.com', phone: '(555) 100-0002', hireDate: '2019-06-01', departmentId: 'dept-2', positionId: 'pos-2', managerId: 'emp-1', status: 'active', avatar: '' },

  // HR
  { id: 'emp-3', firstName: 'Maria', lastName: 'Garcia', email: 'maria.garcia@company.com', phone: '(555) 100-0003', hireDate: '2019-08-12', departmentId: 'dept-3', positionId: 'pos-3', managerId: 'emp-1', status: 'active', avatar: '' },
  { id: 'emp-11', firstName: 'Lisa', lastName: 'Thomas', email: 'lisa.thomas@company.com', phone: '(555) 100-0011', hireDate: '2021-09-05', departmentId: 'dept-3', positionId: 'pos-28', managerId: 'emp-3', status: 'active', avatar: '' },
  { id: 'emp-28', firstName: 'Hannah', lastName: 'Moore', email: 'hannah.moore@company.com', phone: '(555) 100-0028', hireDate: '2023-04-15', departmentId: 'dept-3', positionId: 'pos-11', managerId: 'emp-11', status: 'active', avatar: '' },

  // Sales
  { id: 'emp-4', firstName: 'Robert', lastName: 'Johnson', email: 'robert.johnson@company.com', phone: '(555) 100-0004', hireDate: '2020-01-20', departmentId: 'dept-4', positionId: 'pos-4', managerId: 'emp-1', status: 'active', avatar: '' },
  { id: 'emp-12', firstName: 'Chris', lastName: 'Jackson', email: 'chris.jackson@company.com', phone: '(555) 100-0012', hireDate: '2022-01-10', departmentId: 'dept-4', positionId: 'pos-27', managerId: 'emp-4', status: 'active', avatar: '' },
  { id: 'emp-29', firstName: 'Tyler', lastName: 'Brooks', email: 'tyler.brooks@company.com', phone: '(555) 100-0029', hireDate: '2023-06-01', departmentId: 'dept-4', positionId: 'pos-12', managerId: 'emp-12', status: 'active', avatar: '' },
  { id: 'emp-30', firstName: 'Samantha', lastName: 'Reed', email: 'samantha.reed@company.com', phone: '(555) 100-0030', hireDate: '2023-07-15', departmentId: 'dept-4', positionId: 'pos-12', managerId: 'emp-12', status: 'active', avatar: '' },
  { id: 'emp-31', firstName: 'Derek', lastName: 'Foster', email: 'derek.foster@company.com', phone: '(555) 100-0031', hireDate: '2024-01-08', departmentId: 'dept-4', positionId: 'pos-12', managerId: 'emp-12', status: 'active', avatar: '' },

  // Marketing
  { id: 'emp-5', firstName: 'Emily', lastName: 'Davis', email: 'emily.davis@company.com', phone: '(555) 100-0005', hireDate: '2020-04-10', departmentId: 'dept-5', positionId: 'pos-5', managerId: 'emp-1', status: 'active', avatar: '' },
  { id: 'emp-13', firstName: 'Rachel', lastName: 'White', email: 'rachel.white@company.com', phone: '(555) 100-0013', hireDate: '2022-03-18', departmentId: 'dept-5', positionId: 'pos-13', managerId: 'emp-5', status: 'active', avatar: '' },
  { id: 'emp-32', firstName: 'Olivia', lastName: 'Barnes', email: 'olivia.barnes@company.com', phone: '(555) 100-0032', hireDate: '2023-09-10', departmentId: 'dept-5', positionId: 'pos-29', managerId: 'emp-5', status: 'active', avatar: '' },

  // Frontend
  { id: 'emp-6', firstName: 'Michael', lastName: 'Brown', email: 'michael.brown@company.com', phone: '(555) 100-0006', hireDate: '2020-09-01', departmentId: 'dept-6', positionId: 'pos-6', managerId: 'emp-2', status: 'active', avatar: '' },
  { id: 'emp-9', firstName: 'Amanda', lastName: 'Taylor', email: 'amanda.taylor@company.com', phone: '(555) 100-0009', hireDate: '2021-05-10', departmentId: 'dept-6', positionId: 'pos-26', managerId: 'emp-6', status: 'active', avatar: '' },
  { id: 'emp-14', firstName: 'Daniel', lastName: 'Harris', email: 'daniel.harris@company.com', phone: '(555) 100-0014', hireDate: '2022-06-01', departmentId: 'dept-6', positionId: 'pos-9', managerId: 'emp-6', status: 'active', avatar: '' },
  { id: 'emp-33', firstName: 'Ethan', lastName: 'Rivera', email: 'ethan.rivera@company.com', phone: '(555) 100-0033', hireDate: '2024-02-12', departmentId: 'dept-6', positionId: 'pos-14', managerId: 'emp-6', status: 'active', avatar: '' },
  { id: 'emp-34', firstName: 'Sophia', lastName: 'Nguyen', email: 'sophia.nguyen@company.com', phone: '(555) 100-0034', hireDate: '2024-03-20', departmentId: 'dept-6', positionId: 'pos-14', managerId: 'emp-6', status: 'active', avatar: '' },

  // Backend
  { id: 'emp-7', firstName: 'Jessica', lastName: 'Martinez', email: 'jessica.martinez@company.com', phone: '(555) 100-0007', hireDate: '2020-11-15', departmentId: 'dept-7', positionId: 'pos-7', managerId: 'emp-2', status: 'active', avatar: '' },
  { id: 'emp-10', firstName: 'Kevin', lastName: 'Anderson', email: 'kevin.anderson@company.com', phone: '(555) 100-0010', hireDate: '2021-07-22', departmentId: 'dept-7', positionId: 'pos-25', managerId: 'emp-7', status: 'active', avatar: '' },
  { id: 'emp-15', firstName: 'Nicole', lastName: 'Clark', email: 'nicole.clark@company.com', phone: '(555) 100-0015', hireDate: '2022-08-20', departmentId: 'dept-7', positionId: 'pos-10', managerId: 'emp-7', status: 'onleave', avatar: '' },
  { id: 'emp-35', firstName: 'Marcus', lastName: 'Patel', email: 'marcus.patel@company.com', phone: '(555) 100-0035', hireDate: '2023-11-01', departmentId: 'dept-7', positionId: 'pos-15', managerId: 'emp-7', status: 'active', avatar: '' },
  { id: 'emp-36', firstName: 'Aisha', lastName: 'Washington', email: 'aisha.washington@company.com', phone: '(555) 100-0036', hireDate: '2024-04-15', departmentId: 'dept-7', positionId: 'pos-15', managerId: 'emp-7', status: 'active', avatar: '' },

  // DevOps
  { id: 'emp-8', firstName: 'David', lastName: 'Lee', email: 'david.lee@company.com', phone: '(555) 100-0008', hireDate: '2021-02-28', departmentId: 'dept-8', positionId: 'pos-30', managerId: 'emp-2', status: 'active', avatar: '' },
  { id: 'emp-37', firstName: 'Ryan', lastName: 'Kim', email: 'ryan.kim@company.com', phone: '(555) 100-0037', hireDate: '2022-10-05', departmentId: 'dept-8', positionId: 'pos-8', managerId: 'emp-8', status: 'active', avatar: '' },
  { id: 'emp-38', firstName: 'Priya', lastName: 'Sharma', email: 'priya.sharma@company.com', phone: '(555) 100-0038', hireDate: '2023-08-20', departmentId: 'dept-8', positionId: 'pos-8', managerId: 'emp-8', status: 'active', avatar: '' },

  // Finance
  { id: 'emp-16', firstName: 'Andrew', lastName: 'Martinez', email: 'andrew.martinez@company.com', phone: '(555) 100-0016', hireDate: '2019-11-01', departmentId: 'dept-9', positionId: 'pos-16', managerId: 'emp-1', status: 'active', avatar: '' },
  { id: 'emp-17', firstName: 'Jennifer', lastName: 'Lopez', email: 'jennifer.lopez@company.com', phone: '(555) 100-0017', hireDate: '2021-03-15', departmentId: 'dept-9', positionId: 'pos-17', managerId: 'emp-16', status: 'active', avatar: '' },
  { id: 'emp-18', firstName: 'Brian', lastName: 'Scott', email: 'brian.scott@company.com', phone: '(555) 100-0018', hireDate: '2022-07-01', departmentId: 'dept-9', positionId: 'pos-18', managerId: 'emp-16', status: 'active', avatar: '' },

  // Customer Support
  { id: 'emp-19', firstName: 'Michelle', lastName: 'Young', email: 'michelle.young@company.com', phone: '(555) 100-0019', hireDate: '2020-06-15', departmentId: 'dept-10', positionId: 'pos-19', managerId: 'emp-1', status: 'active', avatar: '' },
  { id: 'emp-20', firstName: 'Jason', lastName: 'King', email: 'jason.king@company.com', phone: '(555) 100-0020', hireDate: '2021-11-10', departmentId: 'dept-10', positionId: 'pos-20', managerId: 'emp-19', status: 'active', avatar: '' },
  { id: 'emp-21', firstName: 'Stephanie', lastName: 'Wright', email: 'stephanie.wright@company.com', phone: '(555) 100-0021', hireDate: '2022-04-20', departmentId: 'dept-10', positionId: 'pos-20', managerId: 'emp-19', status: 'inactive', avatar: '' },
  { id: 'emp-39', firstName: 'Carlos', lastName: 'Diaz', email: 'carlos.diaz@company.com', phone: '(555) 100-0039', hireDate: '2023-12-01', departmentId: 'dept-10', positionId: 'pos-20', managerId: 'emp-19', status: 'active', avatar: '' },

  // QA
  { id: 'emp-22', firstName: 'Matthew', lastName: 'Adams', email: 'matthew.adams@company.com', phone: '(555) 100-0022', hireDate: '2021-01-18', departmentId: 'dept-11', positionId: 'pos-21', managerId: 'emp-2', status: 'active', avatar: '' },
  { id: 'emp-23', firstName: 'Laura', lastName: 'Nelson', email: 'laura.nelson@company.com', phone: '(555) 100-0023', hireDate: '2021-08-25', departmentId: 'dept-11', positionId: 'pos-22', managerId: 'emp-22', status: 'active', avatar: '' },
  { id: 'emp-24', firstName: 'Patrick', lastName: 'Hill', email: 'patrick.hill@company.com', phone: '(555) 100-0024', hireDate: '2022-11-15', departmentId: 'dept-11', positionId: 'pos-22', managerId: 'emp-22', status: 'onleave', avatar: '' },

  // Product
  { id: 'emp-25', firstName: 'Diana', lastName: 'Campbell', email: 'diana.campbell@company.com', phone: '(555) 100-0025', hireDate: '2020-08-01', departmentId: 'dept-12', positionId: 'pos-23', managerId: 'emp-1', status: 'active', avatar: '' },
  { id: 'emp-26', firstName: 'Nathan', lastName: 'Mitchell', email: 'nathan.mitchell@company.com', phone: '(555) 100-0026', hireDate: '2021-12-10', departmentId: 'dept-12', positionId: 'pos-24', managerId: 'emp-25', status: 'active', avatar: '' },
  { id: 'emp-27', firstName: 'Victoria', lastName: 'Roberts', email: 'victoria.roberts@company.com', phone: '(555) 100-0027', hireDate: '2023-02-01', departmentId: 'dept-12', positionId: 'pos-24', managerId: 'emp-25', status: 'active', avatar: '' },
];
