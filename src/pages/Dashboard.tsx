import { useHRMS } from '../context/useHRMS';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import './Dashboard.css';

export default function Dashboard() {
  const { state, getDepartment, getPosition } = useHRMS();
  const navigate = useNavigate();
  const { employees, departments, positions } = state;

  const activeCount = employees.filter((e) => e.status === 'active').length;
  const onLeaveCount = employees.filter((e) => e.status === 'onleave').length;
  const inactiveCount = employees.filter((e) => e.status === 'inactive').length;

  const recentHires = [...employees]
    .sort((a, b) => new Date(b.hireDate).getTime() - new Date(a.hireDate).getTime())
    .slice(0, 5);

  const deptStats = departments.map((d) => ({
    ...d,
    count: employees.filter((e) => e.departmentId === d.id).length,
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="dashboard">
      <h2 className="page-title">Dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/employees')}>
          <div className="stat-value">{employees.length}</div>
          <div className="stat-label">Total Employees</div>
        </div>
        <div className="stat-card stat-active">
          <div className="stat-value">{activeCount}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card stat-leave">
          <div className="stat-value">{onLeaveCount}</div>
          <div className="stat-label">On Leave</div>
        </div>
        <div className="stat-card stat-inactive">
          <div className="stat-value">{inactiveCount}</div>
          <div className="stat-label">Inactive</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/departments')}>
          <div className="stat-value">{departments.length}</div>
          <div className="stat-label">Departments</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/positions')}>
          <div className="stat-value">{positions.length}</div>
          <div className="stat-label">Positions</div>
        </div>
      </div>

      <div className="dashboard-panels">
        <div className="panel">
          <h3 className="panel-title">Recent Hires</h3>
          <div className="panel-content">
            {recentHires.map((emp) => (
              <div key={emp.id} className="recent-hire-row" onClick={() => navigate(`/employees/${emp.id}`)}>
                <div className="hire-avatar">{emp.firstName[0]}{emp.lastName[0]}</div>
                <div className="hire-info">
                  <div className="hire-name">{emp.firstName} {emp.lastName}</div>
                  <div className="hire-detail">
                    {getPosition(emp.positionId)?.title ?? 'Unassigned'} &middot; {getDepartment(emp.departmentId)?.name ?? 'Unassigned'}
                  </div>
                </div>
                <div className="hire-meta">
                  <StatusBadge status={emp.status} />
                  <div className="hire-date">{new Date(emp.hireDate).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3 className="panel-title">Department Headcount</h3>
          <div className="panel-content">
            {deptStats.map((d) => (
              <div key={d.id} className="dept-stat-row">
                <span className="dept-stat-name">{d.name}</span>
                <div className="dept-stat-bar-container">
                  <div
                    className="dept-stat-bar"
                    style={{ width: `${Math.max(8, (d.count / Math.max(1, employees.length)) * 100)}%` }}
                  />
                </div>
                <span className="dept-stat-count">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
