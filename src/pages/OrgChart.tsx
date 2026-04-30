import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHRMS } from '../context/useHRMS';
import type { Department, Employee } from '../types';
import './OrgChart.css';

type BoxStyle = 'compact' | 'standard' | 'detailed';

interface ContextMenuState {
  x: number;
  y: number;
  deptId: string | null;
  empId: string | null;
}

interface OrgBoxNodeProps {
  department: Department;
  departments: Department[];
  employees: Employee[];
  getPosition: (id: string) => { title: string } | undefined;
  getDepartment: (id: string) => Department | undefined;
  navigate: (path: string) => void;
  boxStyle: BoxStyle;
  expandedDepts: Set<string>;
  toggleDept: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, deptId: string, empId?: string) => void;
}

function OrgBoxNode({
  department, departments, employees, getPosition, getDepartment,
  navigate, boxStyle, expandedDepts, toggleDept, onContextMenu,
}: OrgBoxNodeProps) {
  const deptEmployees = employees.filter((e) => e.departmentId === department.id);
  const childDepts = departments.filter((d) => d.parentId === department.id);
  const isExpanded = expandedDepts.has(department.id);
  const hasChildren = childDepts.length > 0 || deptEmployees.length > 0;

  return (
    <div className="org-box-branch">
      <div
        className={`org-box dept-box ${isExpanded && hasChildren ? 'expanded' : ''}`}
        onClick={() => hasChildren && toggleDept(department.id)}
        onContextMenu={(e) => onContextMenu(e, department.id)}
      >
        <div className="org-box-dept-name">{department.name}</div>
        <div className="org-box-dept-meta">{deptEmployees.length} member{deptEmployees.length !== 1 ? 's' : ''}</div>
        {hasChildren && (
          <div className="org-box-toggle">{isExpanded ? '\u25B4' : '\u25BE'}</div>
        )}
      </div>

      {isExpanded && hasChildren && (
        <div className="org-box-children-wrapper">
          <div className="org-box-connector-down" />
          <div className="org-box-children">
            {deptEmployees.map((emp) => {
              const pos = getPosition(emp.positionId);
              const dept = getDepartment(emp.departmentId);
              return (
                <div className="org-box-branch" key={emp.id}>
                  <div
                    className={`org-box emp-box box-${boxStyle}`}
                    onClick={() => navigate(`/employees/${emp.id}`)}
                    onContextMenu={(e) => onContextMenu(e, department.id, emp.id)}
                  >
                    <div className="org-box-avatar">{emp.firstName[0]}{emp.lastName[0]}</div>
                    <div className="org-box-emp-name">{emp.firstName} {emp.lastName}</div>
                    {(boxStyle === 'standard' || boxStyle === 'detailed') && (
                      <div className="org-box-emp-title">{pos?.title ?? 'Unassigned'}</div>
                    )}
                    {(boxStyle === 'standard' || boxStyle === 'detailed') && (
                      <div className="org-box-emp-dept">{dept?.name ?? ''}</div>
                    )}
                    {boxStyle === 'detailed' && (
                      <>
                        <div className="org-box-emp-email">{emp.email}</div>
                        <div className="org-box-emp-hire">Hired {new Date(emp.hireDate).toLocaleDateString()}</div>
                        <div className={`org-box-emp-status status-${emp.status}`}>
                          {emp.status === 'onleave' ? 'On Leave' : emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {childDepts.map((child) => (
              <OrgBoxNode
                key={child.id}
                department={child}
                departments={departments}
                employees={employees}
                getPosition={getPosition}
                getDepartment={getDepartment}
                navigate={navigate}
                boxStyle={boxStyle}
                expandedDepts={expandedDepts}
                toggleDept={toggleDept}
                onContextMenu={onContextMenu}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getAncestorChain(departments: Department[], targetId: string): Department[] {
  const chain: Department[] = [];
  let current = departments.find((d) => d.id === targetId);
  while (current) {
    chain.unshift(current);
    current = current.parentId ? departments.find((d) => d.id === current!.parentId) : undefined;
  }
  return chain;
}

export default function OrgChart() {
  const { state, getPosition, getDepartment } = useHRMS();
  const navigate = useNavigate();
  const [boxStyle, setBoxStyle] = useState<BoxStyle>('standard');
  const [rootDeptId, setRootDeptId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const contextRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoom((prev) => Math.min(3, Math.max(0.2, prev + delta)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({
      x: panStart.current.panX + (e.clientX - panStart.current.x),
      y: panStart.current.panY + (e.clientY - panStart.current.y),
    });
  }, [isPanning]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const resetZoom = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
  const initialExpanded = useRef(false);

  useEffect(() => {
    if (state.departments.length > 0 && !initialExpanded.current) {
      setExpandedDepts(new Set(state.departments.map((d) => d.id)));
      initialExpanded.current = true;
    }
  }, [state.departments]);

  const toggleDept = useCallback((id: string) => {
    setExpandedDepts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = () => setExpandedDepts(new Set(state.departments.map((d) => d.id)));
  const collapseAll = () => setExpandedDepts(new Set());

  const handleContextMenu = useCallback((e: React.MouseEvent, deptId: string, empId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, deptId, empId: empId ?? null });
  }, []);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const setAsRoot = (deptId: string) => {
    setRootDeptId(deptId);
    setExpandedDepts(new Set(state.departments.map((d) => d.id)));
    setContextMenu(null);
  };

  const resetRoot = () => {
    setRootDeptId(null);
    setExpandedDepts(new Set(state.departments.map((d) => d.id)));
  };

  const visibleRoots = rootDeptId
    ? state.departments.filter((d) => d.id === rootDeptId)
    : state.departments.filter((d) => d.parentId === null);

  const breadcrumbs = rootDeptId ? getAncestorChain(state.departments, rootDeptId) : [];

  return (
    <div className="orgchart-page">
      <div className="page-header">
        <h2 className="page-title">Organization Chart</h2>
        <div className="orgchart-controls">
          <div className="box-style-selector">
            <label>Box Style:</label>
            <select value={boxStyle} onChange={(e) => setBoxStyle(e.target.value as BoxStyle)}>
              <option value="compact">Compact</option>
              <option value="standard">Standard</option>
              <option value="detailed">Detailed</option>
            </select>
          </div>
          <span className="zoom-display">{Math.round(zoom * 100)}%</span>
          <button className="btn btn-sm" onClick={() => setZoom((z) => Math.min(3, z + 0.2))}>+</button>
          <button className="btn btn-sm" onClick={() => setZoom((z) => Math.max(0.2, z - 0.2))}>-</button>
          <button className="btn btn-sm" onClick={resetZoom}>Reset</button>
          <button className="btn btn-sm" onClick={expandAll}>Expand All</button>
          <button className="btn btn-sm" onClick={collapseAll}>Collapse All</button>
          {rootDeptId && (
            <button className="btn btn-sm btn-secondary" onClick={resetRoot}>Show Full Org</button>
          )}
        </div>
      </div>

      {breadcrumbs.length > 1 && (
        <div className="org-breadcrumbs">
          <span className="breadcrumb-item clickable" onClick={resetRoot}>All</span>
          {breadcrumbs.map((dept, i) => (
            <span key={dept.id}>
              <span className="breadcrumb-sep">/</span>
              {i < breadcrumbs.length - 1 ? (
                <span className="breadcrumb-item clickable" onClick={() => setAsRoot(dept.id)}>{dept.name}</span>
              ) : (
                <span className="breadcrumb-item current">{dept.name}</span>
              )}
            </span>
          ))}
        </div>
      )}

      <div
        ref={containerRef}
        className={`orgchart-container ${isPanning ? 'panning' : ''}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {visibleRoots.length === 0 ? (
          <div className="empty-state">No departments defined. Create departments to see the org chart.</div>
        ) : (
          <div
            className="org-box-tree"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'top center',
            }}
          >
            {visibleRoots.map((dept) => (
              <OrgBoxNode
                key={dept.id}
                department={dept}
                departments={state.departments}
                employees={state.employees}
                getPosition={getPosition}
                getDepartment={getDepartment}
                navigate={navigate}
                boxStyle={boxStyle}
                expandedDepts={expandedDepts}
                toggleDept={toggleDept}
                onContextMenu={handleContextMenu}
              />
            ))}
          </div>
        )}
      </div>

      {contextMenu && (
        <div
          ref={contextRef}
          className="org-context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {contextMenu.deptId && (
            <button onClick={() => setAsRoot(contextMenu.deptId!)}>
              Set as top of chart
            </button>
          )}
          {contextMenu.empId && (
            <button onClick={() => { navigate(`/employees/${contextMenu.empId}`); setContextMenu(null); }}>
              View employee details
            </button>
          )}
          {contextMenu.empId && (
            <button onClick={() => { navigate(`/employees/${contextMenu.empId}/edit`); setContextMenu(null); }}>
              Edit employee
            </button>
          )}
          {rootDeptId && (
            <button onClick={() => { resetRoot(); setContextMenu(null); }}>
              Show full organization
            </button>
          )}
        </div>
      )}
    </div>
  );
}
