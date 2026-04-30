import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from './db.js';

const router = Router();

interface SkillRow { name: string; proficiency: number; }

// ── Departments ──
router.get('/departments', (_req, res) => {
  const rows = db.prepare('SELECT id, name, parent_id as parentId, description FROM departments').all();
  res.json(rows);
});

router.post('/departments', (req, res) => {
  const { name, parentId, description } = req.body;
  const id = uuidv4();
  db.prepare('INSERT INTO departments (id, name, parent_id, description) VALUES (?, ?, ?, ?)').run(id, name, parentId ?? null, description ?? '');
  res.status(201).json({ id, name, parentId: parentId ?? null, description: description ?? '' });
});

router.put('/departments/:id', (req, res) => {
  const { name, parentId, description } = req.body;
  db.prepare('UPDATE departments SET name = ?, parent_id = ?, description = ? WHERE id = ?').run(name, parentId ?? null, description ?? '', req.params.id);
  res.json({ id: req.params.id, name, parentId: parentId ?? null, description: description ?? '' });
});

router.delete('/departments/:id', (req, res) => {
  const getAllChildren = (parentId: string): string[] => {
    const children = db.prepare('SELECT id FROM departments WHERE parent_id = ?').all(parentId) as { id: string }[];
    let ids: string[] = [];
    for (const c of children) {
      ids.push(c.id);
      ids = ids.concat(getAllChildren(c.id));
    }
    return ids;
  };

  const deptIds = [req.params.id, ...getAllChildren(req.params.id)];
  const placeholders = deptIds.map(() => '?').join(',');

  const tx = db.transaction(() => {
    db.prepare(`DELETE FROM employee_skills WHERE employee_id IN (SELECT id FROM employees WHERE department_id IN (${placeholders}))`).run(...deptIds);
    db.prepare(`DELETE FROM employees WHERE department_id IN (${placeholders})`).run(...deptIds);
    db.prepare(`DELETE FROM position_skills WHERE position_id IN (SELECT id FROM positions WHERE department_id IN (${placeholders}))`).run(...deptIds);
    db.prepare(`DELETE FROM positions WHERE department_id IN (${placeholders})`).run(...deptIds);
    db.prepare(`DELETE FROM departments WHERE id IN (${placeholders})`).run(...deptIds);
  });
  tx();
  res.status(204).end();
});

// ── Positions ──
function getPositionWithSkills(id: string) {
  const pos = db.prepare('SELECT id, title, department_id as departmentId, description, level FROM positions WHERE id = ?').get(id) as Record<string, string> | undefined;
  if (!pos) return null;
  const skills = db.prepare('SELECT name, proficiency FROM position_skills WHERE position_id = ?').all(id) as SkillRow[];
  return { ...pos, requiredSkills: skills };
}

router.get('/positions', (_req, res) => {
  const positions = db.prepare('SELECT id, title, department_id as departmentId, description, level FROM positions').all() as Record<string, string>[];
  const allSkills = db.prepare('SELECT position_id, name, proficiency FROM position_skills').all() as (SkillRow & { position_id: string })[];
  const skillMap = new Map<string, SkillRow[]>();
  for (const s of allSkills) {
    if (!skillMap.has(s.position_id)) skillMap.set(s.position_id, []);
    skillMap.get(s.position_id)!.push({ name: s.name, proficiency: s.proficiency });
  }
  res.json(positions.map((p) => ({ ...p, requiredSkills: skillMap.get(p.id) ?? [] })));
});

router.post('/positions', (req, res) => {
  const { title, departmentId, description, level, requiredSkills } = req.body;
  const id = uuidv4();
  const tx = db.transaction(() => {
    db.prepare('INSERT INTO positions (id, title, department_id, description, level) VALUES (?, ?, ?, ?, ?)').run(id, title, departmentId, description ?? '', level ?? 'mid');
    if (requiredSkills) {
      const insert = db.prepare('INSERT INTO position_skills (position_id, name, proficiency) VALUES (?, ?, ?)');
      for (const s of requiredSkills as SkillRow[]) {
        insert.run(id, s.name, s.proficiency);
      }
    }
  });
  tx();
  res.status(201).json(getPositionWithSkills(id));
});

router.put('/positions/:id', (req, res) => {
  const { title, departmentId, description, level, requiredSkills } = req.body;
  const tx = db.transaction(() => {
    db.prepare('UPDATE positions SET title = ?, department_id = ?, description = ?, level = ? WHERE id = ?').run(title, departmentId, description ?? '', level ?? 'mid', req.params.id);
    db.prepare('DELETE FROM position_skills WHERE position_id = ?').run(req.params.id);
    if (requiredSkills) {
      const insert = db.prepare('INSERT INTO position_skills (position_id, name, proficiency) VALUES (?, ?, ?)');
      for (const s of requiredSkills as SkillRow[]) {
        insert.run(req.params.id, s.name, s.proficiency);
      }
    }
  });
  tx();
  res.json(getPositionWithSkills(req.params.id));
});

router.delete('/positions/:id', (req, res) => {
  const tx = db.transaction(() => {
    db.prepare("UPDATE employees SET position_id = '' WHERE position_id = ?").run(req.params.id);
    db.prepare('DELETE FROM position_skills WHERE position_id = ?').run(req.params.id);
    db.prepare('DELETE FROM positions WHERE id = ?').run(req.params.id);
  });
  tx();
  res.status(204).end();
});

// ── Employees ──
function getEmployeeWithSkills(id: string) {
  const emp = db.prepare(`SELECT id, first_name as firstName, last_name as lastName, email, phone,
    hire_date as hireDate, department_id as departmentId, position_id as positionId,
    manager_id as managerId, status, avatar FROM employees WHERE id = ?`).get(id) as Record<string, string> | undefined;
  if (!emp) return null;
  const skills = db.prepare('SELECT name, proficiency FROM employee_skills WHERE employee_id = ?').all(id) as SkillRow[];
  return { ...emp, skills };
}

router.get('/employees', (_req, res) => {
  const employees = db.prepare(`SELECT id, first_name as firstName, last_name as lastName, email, phone,
    hire_date as hireDate, department_id as departmentId, position_id as positionId,
    manager_id as managerId, status, avatar FROM employees`).all() as Record<string, string>[];
  const allSkills = db.prepare('SELECT employee_id, name, proficiency FROM employee_skills').all() as (SkillRow & { employee_id: string })[];
  const skillMap = new Map<string, SkillRow[]>();
  for (const s of allSkills) {
    if (!skillMap.has(s.employee_id)) skillMap.set(s.employee_id, []);
    skillMap.get(s.employee_id)!.push({ name: s.name, proficiency: s.proficiency });
  }
  res.json(employees.map((e) => ({ ...e, skills: skillMap.get(e.id) ?? [] })));
});

router.post('/employees', (req, res) => {
  const { firstName, lastName, email, phone, hireDate, departmentId, positionId, managerId, status, skills } = req.body;
  const id = uuidv4();
  const tx = db.transaction(() => {
    db.prepare(`INSERT INTO employees (id, first_name, last_name, email, phone, hire_date, department_id, position_id, manager_id, status, avatar)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '')`).run(id, firstName, lastName, email, phone ?? '', hireDate, departmentId, positionId ?? '', managerId ?? null, status ?? 'active');
    if (skills) {
      const insert = db.prepare('INSERT INTO employee_skills (employee_id, name, proficiency) VALUES (?, ?, ?)');
      for (const s of skills as SkillRow[]) {
        insert.run(id, s.name, s.proficiency);
      }
    }
  });
  tx();
  res.status(201).json(getEmployeeWithSkills(id));
});

router.put('/employees/:id', (req, res) => {
  const { firstName, lastName, email, phone, hireDate, departmentId, positionId, managerId, status, skills } = req.body;
  const tx = db.transaction(() => {
    db.prepare(`UPDATE employees SET first_name = ?, last_name = ?, email = ?, phone = ?, hire_date = ?,
      department_id = ?, position_id = ?, manager_id = ?, status = ? WHERE id = ?`)
      .run(firstName, lastName, email, phone ?? '', hireDate, departmentId, positionId ?? '', managerId ?? null, status ?? 'active', req.params.id);
    db.prepare('DELETE FROM employee_skills WHERE employee_id = ?').run(req.params.id);
    if (skills) {
      const insert = db.prepare('INSERT INTO employee_skills (employee_id, name, proficiency) VALUES (?, ?, ?)');
      for (const s of skills as SkillRow[]) {
        insert.run(req.params.id, s.name, s.proficiency);
      }
    }
  });
  tx();
  res.json(getEmployeeWithSkills(req.params.id));
});

router.delete('/employees/:id', (req, res) => {
  const tx = db.transaction(() => {
    db.prepare('UPDATE employees SET manager_id = NULL WHERE manager_id = ?').run(req.params.id);
    db.prepare('DELETE FROM employee_skills WHERE employee_id = ?').run(req.params.id);
    db.prepare('DELETE FROM employees WHERE id = ?').run(req.params.id);
  });
  tx();
  res.status(204).end();
});

export default router;
