import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHRMS } from '../context/useHRMS';
import type { EmployeeFormData } from '../types';
import './EmployeeForm.css';

const emptyForm: EmployeeFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  hireDate: new Date().toISOString().split('T')[0],
  departmentId: '',
  positionId: '',
  managerId: null,
  status: 'active',
};

export default function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch, getEmployee, getPositionsForDepartment } = useHRMS();
  const isEdit = !!id;

  const [form, setForm] = useState<EmployeeFormData>(() => {
    if (isEdit && id) {
      const emp = state.employees.find((e) => e.id === id);
      if (emp) {
        const { id: _id, avatar: _avatar, ...rest } = emp;
        void _id;
        void _avatar;
        return rest;
      }
    }
    return emptyForm;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const positions = form.departmentId ? getPositionsForDepartment(form.departmentId) : [];
  const managers = state.employees.filter((e) => e.id !== id);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = 'Required';
    if (!form.lastName.trim()) errs.lastName = 'Required';
    if (!form.email.trim()) errs.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email';
    if (!form.hireDate) errs.hireDate = 'Required';
    if (!form.departmentId) errs.departmentId = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEdit && id) {
      const existing = getEmployee(id);
      if (existing) {
        dispatch({ type: 'UPDATE_EMPLOYEE', payload: { ...existing, ...form } });
      }
    } else {
      dispatch({ type: 'ADD_EMPLOYEE', payload: form });
    }
    navigate('/employees');
  };

  const handleChange = (field: keyof EmployeeFormData, value: string | null) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'departmentId') {
        updated.positionId = '';
      }
      return updated;
    });
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div className="employee-form-page">
      <h2 className="page-title">{isEdit ? 'Edit Employee' : 'Add Employee'}</h2>
      <form className="emp-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>First Name *</label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className={errors.firstName ? 'error' : ''}
            />
            {errors.firstName && <span className="field-error">{errors.firstName}</span>}
          </div>
          <div className="form-group">
            <label>Last Name *</label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className={errors.lastName ? 'error' : ''}
            />
            {errors.lastName && <span className="field-error">{errors.lastName}</span>}
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Hire Date *</label>
            <input
              type="date"
              value={form.hireDate}
              onChange={(e) => handleChange('hireDate', e.target.value)}
              className={errors.hireDate ? 'error' : ''}
            />
            {errors.hireDate && <span className="field-error">{errors.hireDate}</span>}
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={form.status} onChange={(e) => handleChange('status', e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="onleave">On Leave</option>
            </select>
          </div>
          <div className="form-group">
            <label>Department *</label>
            <select
              value={form.departmentId}
              onChange={(e) => handleChange('departmentId', e.target.value)}
              className={errors.departmentId ? 'error' : ''}
            >
              <option value="">Select Department</option>
              {state.departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            {errors.departmentId && <span className="field-error">{errors.departmentId}</span>}
          </div>
          <div className="form-group">
            <label>Position</label>
            <select
              value={form.positionId}
              onChange={(e) => handleChange('positionId', e.target.value)}
              disabled={!form.departmentId}
            >
              <option value="">Select Position</option>
              {positions.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div className="form-group full-width">
            <label>Reports To</label>
            <select
              value={form.managerId ?? ''}
              onChange={(e) => handleChange('managerId', e.target.value || null)}
            >
              <option value="">No Manager</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/employees')}>Cancel</button>
          <button type="submit" className="btn btn-primary">{isEdit ? 'Update' : 'Add'} Employee</button>
        </div>
      </form>
    </div>
  );
}
