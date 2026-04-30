import { useParams, useNavigate } from 'react-router-dom';
import { useHRMS } from '../context/useHRMS';
import StatusBadge from '../components/StatusBadge';
import './EmployeeDetail.css';

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEmployee, getDepartment, getPosition, getDirectReports } = useHRMS();

  const employee = id ? getEmployee(id) : undefined;
  if (!employee) {
    return (
      <div className="employee-detail">
        <p>Employee not found.</p>
        <button className="btn btn-primary" onClick={() => navigate('/employees')}>Back to Employees</button>
      </div>
    );
  }

  const department = getDepartment(employee.departmentId);
  const position = getPosition(employee.positionId);
  const manager = employee.managerId ? getEmployee(employee.managerId) : null;
  const directReports = getDirectReports(employee.id);

  return (
    <div className="employee-detail">
      <button className="btn btn-secondary back-btn" onClick={() => navigate('/employees')}>&larr; Back</button>

      <div className="detail-header">
        <div className="detail-avatar">{employee.firstName[0]}{employee.lastName[0]}</div>
        <div className="detail-info">
          <h2 className="detail-name">{employee.firstName} {employee.lastName}</h2>
          <div className="detail-position">
            {position?.title ?? 'No Position'} &middot; {department?.name ?? 'No Department'}
          </div>
          <StatusBadge status={employee.status} />
        </div>
        <button className="btn btn-primary" onClick={() => navigate(`/employees/${employee.id}/edit`)}>Edit</button>
      </div>

      <div className="detail-grid">
        <div className="detail-card">
          <h3>Contact Information</h3>
          <div className="detail-row">
            <span className="detail-label">Email</span>
            <span className="detail-value">{employee.email}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Phone</span>
            <span className="detail-value">{employee.phone || 'N/A'}</span>
          </div>
        </div>

        <div className="detail-card">
          <h3>Employment</h3>
          <div className="detail-row">
            <span className="detail-label">Hire Date</span>
            <span className="detail-value">{new Date(employee.hireDate).toLocaleDateString()}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Department</span>
            <span className="detail-value">{department?.name ?? 'Unassigned'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Position</span>
            <span className="detail-value">{position?.title ?? 'Unassigned'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Reports To</span>
            <span className="detail-value">
              {manager ? (
                <a
                  onClick={() => navigate(`/employees/${manager.id}`)}
                >
                  {manager.firstName} {manager.lastName}
                </a>
              ) : (
                'N/A'
              )}
            </span>
          </div>
        </div>

        {employee.skills && employee.skills.length > 0 && (
          <div className="detail-card" style={{ gridColumn: '1 / -1' }}>
            <h3>Skills &amp; Competencies</h3>
            <div className="skills-display">
              {employee.skills.map((skill, i) => (
                <div key={i} className="skill-badge">
                  <span className="skill-badge-name">{skill.name}</span>
                  <span className="skill-badge-level">
                    {Array.from({ length: 5 }, (_, j) => (
                      <span key={j} className={`skill-dot ${j < skill.proficiency ? 'filled' : ''}`} />
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {directReports.length > 0 && (
          <div className="detail-card" style={{ gridColumn: '1 / -1' }}>
            <h3>Direct Reports ({directReports.length})</h3>
            <div className="direct-reports-grid">
              {directReports.map((r) => (
                <div
                  key={r.id}
                  className="report-card"
                  onClick={() => navigate(`/employees/${r.id}`)}
                >
                  <div className="emp-avatar">{r.firstName[0]}{r.lastName[0]}</div>
                  <div>
                    <div className="report-name">{r.firstName} {r.lastName}</div>
                    <div className="report-title">{getPosition(r.positionId)?.title ?? 'Unassigned'}</div>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
