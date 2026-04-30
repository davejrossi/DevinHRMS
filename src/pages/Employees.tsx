import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHRMS } from '../context/useHRMS';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import './Employees.css';

export default function Employees() {
  const { state, getDepartment, getPosition, dispatch } = useHRMS();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return state.employees.filter((e) => {
      const matchSearch =
        !search ||
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase());
      const matchDept = !deptFilter || e.departmentId === deptFilter;
      const matchStatus = !statusFilter || e.status === statusFilter;
      return matchSearch && matchDept && matchStatus;
    });
  }, [state.employees, search, deptFilter, statusFilter]);

  const handleDelete = async () => {
    if (deleteId) {
      await dispatch({ type: 'DELETE_EMPLOYEE', payload: deleteId });
      setDeleteId(null);
    }
  };

  return (
    <div className="employees-page">
      <div className="page-header">
        <h2 className="page-title">Employees</h2>
        <button className="btn btn-primary" onClick={() => navigate('/employees/new')}>
          + Add Employee
        </button>
      </div>

      <div className="filters-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="filter-select"
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
        >
          <option value="">All Departments</option>
          {state.departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="onleave">On Leave</option>
        </select>
        <span className="results-count">{filtered.length} of {state.employees.length}</span>
      </div>

      <div className="employees-table-wrapper">
        <table className="employees-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Position</th>
              <th>Status</th>
              <th>Hire Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp) => (
              <tr key={emp.id}>
                <td>
                  <div className="emp-name-cell" onClick={() => navigate(`/employees/${emp.id}`)}>
                    <div className="emp-avatar">{emp.firstName[0]}{emp.lastName[0]}</div>
                    <span>{emp.firstName} {emp.lastName}</span>
                  </div>
                </td>
                <td className="hide-mobile">{emp.email}</td>
                <td>{getDepartment(emp.departmentId)?.name ?? <span className="text-muted">Unassigned</span>}</td>
                <td className="hide-mobile">{getPosition(emp.positionId)?.title ?? <span className="text-muted">Unassigned</span>}</td>
                <td><StatusBadge status={emp.status} /></td>
                <td className="hide-mobile">{new Date(emp.hireDate).toLocaleDateString()}</td>
                <td>
                  <div className="action-btns">
                    <button className="btn btn-sm" onClick={() => navigate(`/employees/${emp.id}/edit`)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => setDeleteId(emp.id)}>Del</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="empty-row">No employees found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="employees-cards">
        {filtered.map((emp) => (
          <div key={emp.id} className="emp-card" onClick={() => navigate(`/employees/${emp.id}`)}>
            <div className="emp-card-header">
              <div className="emp-avatar">{emp.firstName[0]}{emp.lastName[0]}</div>
              <div>
                <div className="emp-card-name">{emp.firstName} {emp.lastName}</div>
                <div className="emp-card-detail">{emp.email}</div>
              </div>
              <StatusBadge status={emp.status} />
            </div>
            <div className="emp-card-body">
              <div><strong>Dept:</strong> {getDepartment(emp.departmentId)?.name ?? 'Unassigned'}</div>
              <div><strong>Position:</strong> {getPosition(emp.positionId)?.title ?? 'Unassigned'}</div>
              <div><strong>Hired:</strong> {new Date(emp.hireDate).toLocaleDateString()}</div>
            </div>
            <div className="emp-card-actions" onClick={(e) => e.stopPropagation()}>
              <button className="btn btn-sm" onClick={() => navigate(`/employees/${emp.id}/edit`)}>Edit</button>
              <button className="btn btn-sm btn-danger" onClick={() => setDeleteId(emp.id)}>Delete</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="empty-state">No employees found</div>}
      </div>

      {deleteId && (
        <ConfirmDialog
          title="Delete Employee"
          message="Are you sure you want to delete this employee? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
