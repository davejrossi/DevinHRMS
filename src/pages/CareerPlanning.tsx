import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHRMS } from '../context/useHRMS';
import type { Employee, Position } from '../types';
import './CareerPlanning.css';

interface PositionMatch {
  position: Position;
  fitScore: number;
  matchedSkills: { name: string; empLevel: number; reqLevel: number }[];
  gapSkills: { name: string; empLevel: number; reqLevel: number }[];
  extraSkills: string[];
}

function computeMatches(employee: Employee, positions: Position[]): PositionMatch[] {
  const empSkills = employee.skills ?? [];
  const empSkillMap = new Map(empSkills.map((s) => [s.name.toLowerCase(), s]));

  return positions.map((pos) => {
    const matchedSkills: PositionMatch['matchedSkills'] = [];
    const gapSkills: PositionMatch['gapSkills'] = [];
    const reqSkills = pos.requiredSkills ?? [];

    let totalRequired = 0;
    let totalMet = 0;

    for (const req of reqSkills) {
      const empSkill = empSkillMap.get(req.name.toLowerCase());
      const empLevel = empSkill?.proficiency ?? 0;
      totalRequired += req.proficiency;

      if (empLevel >= req.proficiency) {
        totalMet += req.proficiency;
        matchedSkills.push({ name: req.name, empLevel, reqLevel: req.proficiency });
      } else if (empLevel > 0) {
        totalMet += empLevel;
        gapSkills.push({ name: req.name, empLevel, reqLevel: req.proficiency });
      } else {
        gapSkills.push({ name: req.name, empLevel: 0, reqLevel: req.proficiency });
      }
    }

    const reqNames = new Set(reqSkills.map((r) => r.name.toLowerCase()));
    const extraSkills = empSkills
      .filter((s) => !reqNames.has(s.name.toLowerCase()))
      .map((s) => s.name);

    const fitScore = totalRequired > 0 ? Math.round((totalMet / totalRequired) * 100) : 0;

    return { position: pos, fitScore, matchedSkills, gapSkills, extraSkills };
  }).sort((a, b) => b.fitScore - a.fitScore);
}

function FitBar({ score }: { score: number }) {
  const color = score >= 80 ? '#1d4ed8' : score >= 60 ? '#2563eb' : score >= 40 ? '#3b82f6' : '#93c5fd';
  return (
    <div className="fit-bar-container">
      <div className="fit-bar" style={{ width: `${score}%`, background: color }} />
      <span className="fit-score" style={{ color }}>{score}%</span>
    </div>
  );
}

function SkillComparisonRow({ name, empLevel, reqLevel }: { name: string; empLevel: number; reqLevel: number }) {
  const met = empLevel >= reqLevel;
  return (
    <div className={`skill-comparison-row ${met ? 'met' : 'gap'}`}>
      <span className="scr-name">{name}</span>
      <div className="scr-dots">
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={`scr-dot ${i < empLevel ? 'emp-filled' : ''} ${i < reqLevel ? 'req-mark' : ''}`}
          />
        ))}
      </div>
      <span className="scr-label">{empLevel}/{reqLevel}</span>
    </div>
  );
}

export default function CareerPlanning() {
  const { state, getDepartment } = useHRMS();
  const navigate = useNavigate();
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [minFit, setMinFit] = useState<number>(0);
  const [expandedPos, setExpandedPos] = useState<Set<string>>(new Set());

  const activeEmployees = state.employees.filter((e) => e.status === 'active');
  const selectedEmployee = activeEmployees.find((e) => e.id === selectedEmpId);

  const matches = (() => {
    if (!selectedEmployee) return [];
    let positionsToCheck = state.positions.filter((p) => p.id !== selectedEmployee.positionId);
    if (deptFilter) positionsToCheck = positionsToCheck.filter((p) => p.departmentId === deptFilter);
    if (levelFilter) positionsToCheck = positionsToCheck.filter((p) => p.level === levelFilter);
    return computeMatches(selectedEmployee, positionsToCheck).filter((m) => m.fitScore >= minFit);
  })();

  const toggleExpanded = (posId: string) => {
    setExpandedPos((prev) => {
      const next = new Set(prev);
      if (next.has(posId)) next.delete(posId);
      else next.add(posId);
      return next;
    });
  };

  const levels = ['entry', 'mid', 'senior', 'lead', 'manager', 'director', 'vp', 'c-level'];

  return (
    <div className="career-planning-page">
      <div className="page-header">
        <h2 className="page-title">Career Planning</h2>
      </div>

      <div className="cp-controls">
        <div className="cp-control-group">
          <label>Employee</label>
          <select value={selectedEmpId} onChange={(e) => { setSelectedEmpId(e.target.value); setExpandedPos(new Set()); }}>
            <option value="">Select an employee...</option>
            {activeEmployees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
            ))}
          </select>
        </div>
        <div className="cp-control-group">
          <label>Department</label>
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
            <option value="">All Departments</option>
            {state.departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div className="cp-control-group">
          <label>Level</label>
          <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
            <option value="">All Levels</option>
            {levels.map((l) => (
              <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="cp-control-group">
          <label>Min Fit: {minFit}%</label>
          <input type="range" min={0} max={100} step={5} value={minFit} onChange={(e) => setMinFit(Number(e.target.value))} />
        </div>
      </div>

      {selectedEmployee && (
        <div className="cp-employee-summary">
          <div className="cp-emp-header" onClick={() => navigate(`/employees/${selectedEmployee.id}`)}>
            <div className="cp-emp-avatar">{selectedEmployee.firstName[0]}{selectedEmployee.lastName[0]}</div>
            <div className="cp-emp-info">
              <div className="cp-emp-name">{selectedEmployee.firstName} {selectedEmployee.lastName}</div>
              <div className="cp-emp-role">
                {state.positions.find((p) => p.id === selectedEmployee.positionId)?.title ?? 'Unassigned'}
                {' '}&middot;{' '}
                {getDepartment(selectedEmployee.departmentId)?.name ?? ''}
              </div>
            </div>
          </div>
          <div className="cp-emp-skills">
            {(selectedEmployee.skills ?? []).map((s, i) => (
              <span key={i} className="cp-skill-chip">
                {s.name} <strong>{s.proficiency}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="cp-results">
        {!selectedEmployee ? (
          <div className="empty-state">Select an employee to see career path matches based on skills alignment.</div>
        ) : matches.length === 0 ? (
          <div className="empty-state">No matching positions found. Try adjusting filters.</div>
        ) : (
          <div className="cp-match-list">
            <div className="cp-match-header-row">
              <span>Position</span>
              <span>Department</span>
              <span>Level</span>
              <span>Fit Score</span>
              <span>Gaps</span>
            </div>
            {matches.map((match) => {
              const isOpen = expandedPos.has(match.position.id);
              return (
                <div key={match.position.id} className={`cp-match-item ${isOpen ? 'open' : ''}`}>
                  <div className="cp-match-row" onClick={() => toggleExpanded(match.position.id)}>
                    <span className="cp-match-title">{match.position.title}</span>
                    <span className="cp-match-dept">{getDepartment(match.position.departmentId)?.name ?? ''}</span>
                    <span className={`level-badge level-${match.position.level}`}>{match.position.level}</span>
                    <FitBar score={match.fitScore} />
                    <span className="cp-match-gaps">{match.gapSkills.length > 0 ? match.gapSkills.length : '-'}</span>
                  </div>
                  {isOpen && (
                    <div className="cp-match-detail">
                      <div className="cp-detail-columns">
                        <div className="cp-detail-col">
                          <h4>Skill Alignment</h4>
                          {match.matchedSkills.map((s, i) => (
                            <SkillComparisonRow key={i} name={s.name} empLevel={s.empLevel} reqLevel={s.reqLevel} />
                          ))}
                          {match.gapSkills.map((s, i) => (
                            <SkillComparisonRow key={i} name={s.name} empLevel={s.empLevel} reqLevel={s.reqLevel} />
                          ))}
                        </div>
                        <div className="cp-detail-col">
                          {match.gapSkills.length > 0 && (
                            <>
                              <h4>Development Needed</h4>
                              {match.gapSkills.map((s, i) => (
                                <div key={i} className="dev-needed-item">
                                  <span className="dev-skill">{s.name}</span>
                                  <span className="dev-gap">+{s.reqLevel - s.empLevel} level{s.reqLevel - s.empLevel > 1 ? 's' : ''}</span>
                                </div>
                              ))}
                            </>
                          )}
                          {match.extraSkills.length > 0 && (
                            <>
                              <h4>Transferable Skills</h4>
                              <div className="extra-skills">
                                {match.extraSkills.map((s, i) => (
                                  <span key={i} className="extra-skill-chip">{s}</span>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
