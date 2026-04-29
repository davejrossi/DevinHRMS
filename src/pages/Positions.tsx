import { useState } from 'react';
import { useHRMS } from '../context/useHRMS';
import ConfirmDialog from '../components/ConfirmDialog';
import './Positions.css';

const levels = [
  { value: 'entry', label: 'Entry' },
  { value: 'mid', label: 'Mid' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
  { value: 'manager', label: 'Manager' },
  { value: 'director', label: 'Director' },
  { value: 'vp', label: 'VP' },
  { value: 'c-level', label: 'C-Level' },
] as const;

export default function Positions() {
  const { state, dispatch, getDepartment } = useHRMS();
  const [editId, setEditId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deptFilter, setDeptFilter] = useState('');
  const [form, setForm] = useState({
    title: '',
    departmentId: '',
    description: '',
    level: 'mid' as typeof levels[number]['value'],
  });

  const filtered = state.positions.filter((p) => !deptFilter || p.departmentId === deptFilter);

  const handleEdit = (id: string) => {
    const pos = state.positions.find((p) => p.id === id);
    if (pos) {
      setForm({ title: pos.title, departmentId: pos.departmentId, description: pos.description, level: pos.level });
      setEditId(id);
      setShowAdd(false);
    }
  };

  const handleAdd = () => {
    setForm({ title: '', departmentId: '', description: '', level: 'mid' });
    setEditId(null);
    setShowAdd(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.departmentId) return;
    if (editId) {
      dispatch({ type: 'UPDATE_POSITION', payload: { ...form, id: editId } });
    } else {
      dispatch({ type: 'ADD_POSITION', payload: form });
    }
    setEditId(null);
    setShowAdd(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      dispatch({ type: 'DELETE_POSITION', payload: deleteId });
      setDeleteId(null);
      if (editId === deleteId) setEditId(null);
    }
  };

  const empCount = (posId: string) => state.employees.filter((e) => e.positionId === posId).length;

  return (
    <div className="positions-page">
      <div className="page-header">
        <h2 className="page-title">Positions</h2>
        <button className="btn btn-primary" onClick={handleAdd}>+ Add Position</button>
      </div>

      <div className="pos-layout">
        <div className="pos-list-panel">
          <div className="filters-bar">
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
          </div>

          <div className="pos-grid">
            {filtered.map((pos) => (
              <div
                key={pos.id}
                className={`pos-card ${editId === pos.id ? 'editing' : ''}`}
                onClick={() => handleEdit(pos.id)}
              >
                <div className="pos-card-header">
                  <span className="pos-title">{pos.title}</span>
                  <span className={`level-badge level-${pos.level}`}>{pos.level}</span>
                </div>
                <div className="pos-card-dept">{getDepartment(pos.departmentId)?.name ?? 'Unassigned'}</div>
                <div className="pos-card-desc">{pos.description}</div>
                <div className="pos-card-footer">
                  <span className="pos-emp-count">{empCount(pos.id)} assigned</span>
                  <div className="pos-card-actions" onClick={(e) => e.stopPropagation()}>
                    <button className="btn btn-sm" onClick={() => handleEdit(pos.id)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => setDeleteId(pos.id)}>Del</button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="empty-state">No positions found</div>}
          </div>
        </div>

        {(showAdd || editId) && (
          <div className="pos-form-panel">
            <h3>{editId ? 'Edit Position' : 'New Position'}</h3>
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Position title"
              />
            </div>
            <div className="form-group">
              <label>Department *</label>
              <select
                value={form.departmentId}
                onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
              >
                <option value="">Select Department</option>
                {state.departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Level</label>
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value as typeof form.level })}
              >
                {levels.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Position description"
                rows={3}
              />
            </div>
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => { setEditId(null); setShowAdd(false); }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>{editId ? 'Update' : 'Add'}</button>
            </div>
          </div>
        )}
      </div>

      {deleteId && (
        <ConfirmDialog
          title="Delete Position"
          message="Employees with this position will become unassigned. Continue?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
