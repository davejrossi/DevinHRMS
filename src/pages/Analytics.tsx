import { useMemo } from 'react';
import { useHRMS } from '../context/useHRMS';
import './Analytics.css';

export default function Analytics() {
  const { state, getDepartment } = useHRMS();
  const { employees, departments, positions } = state;

  const metrics = useMemo(() => {
    const now = new Date();
    const activeEmps = employees.filter((e) => e.status === 'active');
    const inactiveEmps = employees.filter((e) => e.status === 'inactive');
    const onLeaveEmps = employees.filter((e) => e.status === 'onleave');

    // Tenure calculations
    const tenures = activeEmps.map((e) => {
      const hire = new Date(e.hireDate);
      return (now.getTime() - hire.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    });
    const avgTenure = tenures.length > 0 ? tenures.reduce((a, b) => a + b, 0) / tenures.length : 0;
    const maxTenure = tenures.length > 0 ? Math.max(...tenures) : 0;
    const minTenure = tenures.length > 0 ? Math.min(...tenures) : 0;

    // Tenure distribution buckets
    const tenureBuckets = [
      { label: '< 1 year', count: tenures.filter((t) => t < 1).length },
      { label: '1-2 years', count: tenures.filter((t) => t >= 1 && t < 2).length },
      { label: '2-3 years', count: tenures.filter((t) => t >= 2 && t < 3).length },
      { label: '3-5 years', count: tenures.filter((t) => t >= 3 && t < 5).length },
      { label: '5+ years', count: tenures.filter((t) => t >= 5).length },
    ];

    // Hires per year
    const hireCounts: Record<string, number> = {};
    employees.forEach((e) => {
      const year = new Date(e.hireDate).getFullYear().toString();
      hireCounts[year] = (hireCounts[year] || 0) + 1;
    });
    const hireYears = Object.entries(hireCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([year, count]) => ({ year, count }));

    // Hires in last 12 months
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const recentHires = employees.filter((e) => new Date(e.hireDate) >= oneYearAgo).length;

    // Department headcount
    const deptHeadcount = departments
      .map((d) => ({
        name: d.name,
        total: employees.filter((e) => e.departmentId === d.id).length,
        active: employees.filter((e) => e.departmentId === d.id && e.status === 'active').length,
      }))
      .filter((d) => d.total > 0)
      .sort((a, b) => b.total - a.total);

    // Position level distribution
    const levelOrder = ['c-level', 'vp', 'director', 'manager', 'lead', 'senior', 'mid', 'entry'];
    const levelLabels: Record<string, string> = {
      'c-level': 'C-Level', vp: 'VP', director: 'Director', manager: 'Manager',
      lead: 'Lead', senior: 'Senior', mid: 'Mid-Level', entry: 'Entry',
    };
    const levelDist = levelOrder.map((level) => {
      const posIds = positions.filter((p) => p.level === level).map((p) => p.id);
      return {
        level,
        label: levelLabels[level],
        count: employees.filter((e) => posIds.includes(e.positionId)).length,
      };
    }).filter((l) => l.count > 0);

    // Span of control (avg direct reports per manager)
    const managersWithReports = new Map<string, number>();
    employees.forEach((e) => {
      if (e.managerId) {
        managersWithReports.set(e.managerId, (managersWithReports.get(e.managerId) || 0) + 1);
      }
    });
    const reportCounts = Array.from(managersWithReports.values());
    const avgSpanOfControl = reportCounts.length > 0
      ? reportCounts.reduce((a, b) => a + b, 0) / reportCounts.length
      : 0;

    // Turnover rate (inactive / total)
    const turnoverRate = employees.length > 0
      ? (inactiveEmps.length / employees.length) * 100
      : 0;

    // Vacancy: positions with no employees
    const filledPositionIds = new Set(employees.map((e) => e.positionId));
    const vacantPositions = positions.filter((p) => !filledPositionIds.has(p.id));

    // Hires per quarter (last 2 years)
    const quarterData: { label: string; count: number }[] = [];
    for (let q = 7; q >= 0; q--) {
      const qStart = new Date(now);
      qStart.setMonth(qStart.getMonth() - (q + 1) * 3);
      const qEnd = new Date(now);
      qEnd.setMonth(qEnd.getMonth() - q * 3);
      const qHires = employees.filter((e) => {
        const d = new Date(e.hireDate);
        return d >= qStart && d < qEnd;
      }).length;
      const qLabel = `Q${Math.floor(qStart.getMonth() / 3) + 1} ${qStart.getFullYear()}`;
      quarterData.push({ label: qLabel, count: qHires });
    }

    return {
      total: employees.length,
      active: activeEmps.length,
      inactive: inactiveEmps.length,
      onLeave: onLeaveEmps.length,
      avgTenure,
      maxTenure,
      minTenure,
      tenureBuckets,
      hireYears,
      recentHires,
      deptHeadcount,
      levelDist,
      avgSpanOfControl,
      turnoverRate,
      vacantPositions,
      quarterData,
      totalManagers: managersWithReports.size,
    };
  }, [employees, departments, positions]);

  const maxBarValue = (items: { count?: number; total?: number }[]) => Math.max(1, ...items.map((i) => i.count ?? i.total ?? 0));

  return (
    <div className="analytics-page">
      <h2 className="page-title">HR Analytics</h2>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-value">{metrics.total}</div>
          <div className="kpi-label">Total Headcount</div>
        </div>
        <div className="kpi-card kpi-green">
          <div className="kpi-value">{metrics.active}</div>
          <div className="kpi-label">Active Employees</div>
        </div>
        <div className="kpi-card kpi-orange">
          <div className="kpi-value">{metrics.onLeave}</div>
          <div className="kpi-label">On Leave</div>
        </div>
        <div className="kpi-card kpi-red">
          <div className="kpi-value">{metrics.turnoverRate.toFixed(1)}%</div>
          <div className="kpi-label">Turnover Rate</div>
        </div>
        <div className="kpi-card kpi-blue">
          <div className="kpi-value">{metrics.avgTenure.toFixed(1)}y</div>
          <div className="kpi-label">Avg Tenure</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{metrics.recentHires}</div>
          <div className="kpi-label">Hires (12mo)</div>
        </div>
        <div className="kpi-card kpi-purple">
          <div className="kpi-value">{metrics.avgSpanOfControl.toFixed(1)}</div>
          <div className="kpi-label">Avg Span of Control</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{metrics.vacantPositions.length}</div>
          <div className="kpi-label">Vacant Positions</div>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Department Headcount */}
        <div className="analytics-panel">
          <h3>Department Headcount</h3>
          <div className="chart-area">
            {metrics.deptHeadcount.map((d) => (
              <div key={d.name} className="bar-row">
                <span className="bar-label">{d.name}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill bar-blue"
                    style={{ width: `${(d.total / maxBarValue(metrics.deptHeadcount)) * 100}%` }}
                  />
                </div>
                <span className="bar-value">{d.total}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Position Level Distribution */}
        <div className="analytics-panel">
          <h3>Position Level Distribution</h3>
          <div className="chart-area">
            {metrics.levelDist.map((l) => (
              <div key={l.level} className="bar-row">
                <span className="bar-label">{l.label}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill bar-purple"
                    style={{ width: `${(l.count / maxBarValue(metrics.levelDist)) * 100}%` }}
                  />
                </div>
                <span className="bar-value">{l.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tenure Distribution */}
        <div className="analytics-panel">
          <h3>Tenure Distribution</h3>
          <div className="chart-area">
            {metrics.tenureBuckets.map((b) => (
              <div key={b.label} className="bar-row">
                <span className="bar-label">{b.label}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill bar-teal"
                    style={{ width: `${(b.count / maxBarValue(metrics.tenureBuckets)) * 100}%` }}
                  />
                </div>
                <span className="bar-value">{b.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hiring Trend by Year */}
        <div className="analytics-panel">
          <h3>Annual Hiring Trend</h3>
          <div className="chart-area">
            {metrics.hireYears.map((h) => (
              <div key={h.year} className="bar-row">
                <span className="bar-label">{h.year}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill bar-green"
                    style={{ width: `${(h.count / maxBarValue(metrics.hireYears)) * 100}%` }}
                  />
                </div>
                <span className="bar-value">{h.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quarterly Hiring Trend */}
        <div className="analytics-panel wide">
          <h3>Quarterly Hiring Trend (Last 2 Years)</h3>
          <div className="quarter-chart">
            {metrics.quarterData.map((q) => (
              <div key={q.label} className="quarter-bar-col">
                <div className="quarter-value">{q.count}</div>
                <div className="quarter-bar-track">
                  <div
                    className="quarter-bar-fill"
                    style={{ height: `${Math.max(4, (q.count / maxBarValue(metrics.quarterData)) * 100)}%` }}
                  />
                </div>
                <div className="quarter-label">{q.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tenure Summary */}
        <div className="analytics-panel">
          <h3>Tenure Summary</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Average</span>
              <span className="summary-value">{metrics.avgTenure.toFixed(1)} years</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Longest</span>
              <span className="summary-value">{metrics.maxTenure.toFixed(1)} years</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Shortest</span>
              <span className="summary-value">{metrics.minTenure.toFixed(1)} years</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Managers</span>
              <span className="summary-value">{metrics.totalManagers}</span>
            </div>
          </div>
        </div>

        {/* Vacant Positions */}
        {metrics.vacantPositions.length > 0 && (
          <div className="analytics-panel">
            <h3>Vacant Positions ({metrics.vacantPositions.length})</h3>
            <div className="vacant-list">
              {metrics.vacantPositions.map((p) => (
                <div key={p.id} className="vacant-item">
                  <span className="vacant-title">{p.title}</span>
                  <span className="vacant-dept">{getDepartment(p.departmentId)?.name ?? 'N/A'}</span>
                  <span className={`level-badge level-${p.level}`}>{p.level}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
