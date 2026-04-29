import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHRMS } from '../context/useHRMS';
import type { Department, Employee } from '../types';
import './OrgChart.css';

interface OrgTreeNodeProps {
  department: Department;
  departments: Department[];
  employees: Employee[];
  getPosition: (id: string) => { title: string } | undefined;
  navigate: (path: string) => void;
  expandedDepts: Set<string>;
  toggleDept: (id: string) => void;
}

function OrgTreeNode({ department, departments, employees, getPosition, navigate, expandedDepts, toggleDept }: OrgTreeNodeProps) {
  const deptEmployees = employees.filter((e) => e.departmentId === department.id);
  const childDepts = departments.filter((d) => d.parentId === department.id);
  const isExpanded = expandedDepts.has(department.id);

  return (
    <div className="org-node">
      <div className="org-node-header" onClick={() => toggleDept(department.id)}>
        <div className="org-node-expand">
          {(childDepts.length > 0 || deptEmployees.length > 0) && (
            <span className={`expand-arrow ${isExpanded ? 'expanded' : ''}`}>&#9654;</span>
          )}
        </div>
        <div className="org-dept-badge">
          <span className="org-dept-name">{department.name}</span>
          <span className="org-dept-count">{deptEmployees.length}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="org-node-children">
          {deptEmployees.map((emp) => (
            <div
              key={emp.id}
              className="org-employee"
              onClick={() => navigate(`/employees/${emp.id}`)}
            >
              <div className="org-emp-avatar">{emp.firstName[0]}{emp.lastName[0]}</div>
              <div className="org-emp-info">
                <span className="org-emp-name">{emp.firstName} {emp.lastName}</span>
                <span className="org-emp-title">{getPosition(emp.positionId)?.title ?? 'Unassigned'}</span>
              </div>
            </div>
          ))}

          {childDepts.map((child) => (
            <OrgTreeNode
              key={child.id}
              department={child}
              departments={departments}
              employees={employees}
              getPosition={getPosition}
              navigate={navigate}
              expandedDepts={expandedDepts}
              toggleDept={toggleDept}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrgChart() {
  const { state, getPosition } = useHRMS();
  const navigate = useNavigate();
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(() => {
    return new Set(state.departments.map((d) => d.id));
  });

  const toggleDept = (id: string) => {
    setExpandedDepts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setExpandedDepts(new Set(state.departments.map((d) => d.id)));
  const collapseAll = () => setExpandedDepts(new Set());

  const rootDepts = state.departments.filter((d) => d.parentId === null);

  return (
    <div className="orgchart-page">
      <div className="page-header">
        <h2 className="page-title">Organization Chart</h2>
        <div className="orgchart-controls">
          <button className="btn btn-sm" onClick={expandAll}>Expand All</button>
          <button className="btn btn-sm" onClick={collapseAll}>Collapse All</button>
        </div>
      </div>

      <div className="orgchart-container">
        {rootDepts.length === 0 ? (
          <div className="empty-state">No departments defined. Create departments to see the org chart.</div>
        ) : (
          rootDepts.map((dept) => (
            <OrgTreeNode
              key={dept.id}
              department={dept}
              departments={state.departments}
              employees={state.employees}
              getPosition={getPosition}
              navigate={navigate}
              expandedDepts={expandedDepts}
              toggleDept={toggleDept}
            />
          ))
        )}
      </div>
    </div>
  );
}
