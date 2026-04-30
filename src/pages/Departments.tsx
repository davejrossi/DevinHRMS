import { useState } from 'react';
import { useHRMS } from '../context/useHRMS';
import ConfirmDialog from '../components/ConfirmDialog';
import './Departments.css';

export default function Departments() {
  const { state, dispatch, getEmployeesForDepartment } = useHRMS();
  const [editId, setEditId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', parentId: '' as string | null, description: '' });

  const rootDepts = state.departments.filter((d) => d.parentId === null);

  const handleEdit = (id: string) => {
    const dept = state.departments.find((d) => d.id === id);
    if (dept) {
      setForm({ name: dept.name, parentId: dept.parentId ?? '', description: dept.description });
      setEditId(id);
      setShowAdd(false);
    }
  };

  const handleAdd = () => {
    setForm({ name: '', parentId: '', description: '' });
    setEditId(null);
    setShowAdd(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    const payload = { name: form.name, parentId: form.parentId || null, description: form.description };
    try {
      if (editId) {
        await dispatch({ type: 'UPDATE_DEPARTMENT', payload: { ...payload, id: editId } });
      } else {
        await dispatch({ type: 'ADD_DEPARTMENT', payload });
      }
      setEditId(null);
      setShowAdd(false);
    } catch { /* error logged by dispatch */ }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await dispatch({ type: 'DELETE_DEPARTMENT', payload: deleteId });
        setDeleteId(null);
        if (editId === deleteId) {
          setEditId(null);
        }
      } catch { setDeleteId(null); }
    }
  };

  const renderDeptTree = (parentId: string | null, depth: number = 0): React.ReactNode => {
    const children = state.departments.filter((d) => d.parentId === parentId);
    if (children.length === 0) return null;

    return (
      <div className="dept-tree-level">
        {children.map((dept) => {
          const empCount = getEmployeesForDepartment(dept.id).length;
          return (
            <div key={dept.id} className="dept-tree-node" style={{ marginLeft: depth * 20 }}>
              <div className={`dept-node-card ${editId === dept.id ? 'editing' : ''}`}>
                <div className="dept-node-info" onClick={() => handleEdit(dept.id)}>
                  <span className="dept-node-name">{dept.name}</span>
                  <span className="dept-node-count">{empCount} employee{empCount !== 1 ? 's' : ''}</span>
                </div>
                <div className="dept-node-actions">
                  <button className="btn btn-sm" onClick={() => handleEdit(dept.id)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => setDeleteId(dept.id)}>Del</button>
                </div>
              </div>
              {renderDeptTree(dept.id, depth + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="departments-page">
      <div className="page-header">
        <h2 className="page-title">Departments</h2>
        <button className="btn btn-primary" onClick={handleAdd}>+ Add Department</button>
      </div>

      <div className="dept-layout">
        <div className="dept-tree-panel">
          {rootDepts.length === 0 ? (
            <div className="empty-state">No departments yet. Add one to get started.</div>
          ) : (
            renderDeptTree(null)
          )}
        </div>

        {(showAdd || editId) && (
          <div className="dept-form-panel">
            <h3>{editId ? 'Edit Department' : 'New Department'}</h3>
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Department name"
              />
            </div>
            <div className="form-group">
              <label>Parent Department</label>
              <select
                value={form.parentId ?? ''}
                onChange={(e) => setForm({ ...form, parentId: e.target.value || null })}
              >
                <option value="">None (Top Level)</option>
                {state.departments
                  .filter((d) => {
                    if (!editId) return true;
                    if (d.id === editId) return false;
                    const getDescs = (parentId: string): string[] => {
                      const children = state.departments.filter((c) => c.parentId === parentId);
                      return children.flatMap((c) => [c.id, ...getDescs(c.id)]);
                    };
                    return !getDescs(editId).includes(d.id);
                  })
                  .map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
              </select>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Optional description"
                rows={3}
              />
            </div>
            <div className="form-actions">
              <button
                className="btn btn-secondary"
                onClick={() => { setEditId(null); setShowAdd(false); }}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                {editId ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        )}
      </div>

      {deleteId && (
        <ConfirmDialog
          title="Delete Department"
          message="This will also remove all child departments and unassign employees. Continue?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
