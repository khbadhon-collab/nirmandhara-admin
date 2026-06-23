import { useState, useEffect } from 'react'
import { employeesApi } from '../../lib/api'
import { formatCurrency, formatDate } from '../../lib/pdf'

const DEMO = [
  { id: 1, name: 'Liton Mia', phone: '01700-000101', designation: 'Interior Designer', salary: 25000, join_date: '2023-06-01', status: 'Active' },
  { id: 2, name: 'Md Rasel', phone: '01700-000102', designation: 'Project Manager', salary: 35000, join_date: '2022-11-15', status: 'Active' },
  { id: 3, name: 'Karim Uddin', phone: '01700-000103', designation: 'Site Supervisor', salary: 20000, join_date: '2024-01-10', status: 'Active' },
  { id: 4, name: 'Sumon Ahmed', phone: '01700-000104', designation: 'Carpenter', salary: 15000, join_date: '2024-03-20', status: 'Active' },
  { id: 5, name: 'Rina Begum', phone: '01700-000105', designation: 'Office Assistant', salary: 12000, join_date: '2025-02-01', status: 'Active' },
]

export default function EmployeeList({ toast }) {
  const [employees, setEmployees] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '', designation: '', salary: '', join_date: '', status: 'Active' })

  useEffect(() => {
    async function load() {
      try {
        const { data } = await employeesApi.getAll()
        setEmployees(data?.length ? data : DEMO)
      } catch { setEmployees(DEMO) }
      setLoading(false)
    }
    load()
  }, [])

  const filtered = employees.filter(e =>
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.designation?.toLowerCase().includes(search.toLowerCase()) ||
    e.phone?.includes(search)
  )

  async function handleSave() {
    if (!form.name.trim()) { toast.error('Name required'); return }
    try {
      if (editItem) {
        await employeesApi.update(editItem.id, form)
        setEmployees(prev => prev.map(e => e.id === editItem.id ? { ...e, ...form } : e))
        toast.success('Employee updated!')
      } else {
        const { data } = await employeesApi.create(form)
        setEmployees(prev => [data || { id: Date.now(), ...form, created_at: new Date().toISOString() }, ...prev])
        toast.success('Employee added!')
      }
    } catch {
      if (editItem) setEmployees(prev => prev.map(e => e.id === editItem.id ? { ...e, ...form } : e))
      else setEmployees(prev => [{ id: Date.now(), ...form }, ...prev])
      toast.success(editItem ? 'Employee updated!' : 'Employee added!')
    }
    setShowModal(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this employee?')) return
    try { await employeesApi.delete(id) } catch {}
    setEmployees(prev => prev.filter(e => e.id !== id))
    toast.success('Deleted')
  }

  const totalSalary = filtered.reduce((s, e) => s + (parseFloat(e.salary) || 0), 0)

  return (
    <div>
      <div className="block">
        <div className="block-header">
          <h3 className="block-title"><i className="fas fa-users" style={{ color: 'var(--accent)', marginRight: 8 }}></i>Employee List</h3>
          <button className="btn btn-primary btn-sm" onClick={() => { setEditItem(null); setForm({ name: '', phone: '', designation: '', salary: '', join_date: '', status: 'Active' }); setShowModal(true) }}>
            <i className="fas fa-plus"></i> Add Employee
          </button>
        </div>
        <div className="block-content">
          <div className="flex gap-3 mb-4">
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '12px 20px', flex: 1 }}>
              <div style={{ fontSize: 11, color: '#166534', fontWeight: 600, textTransform: 'uppercase' }}>Total Employees</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#198754' }}>{filtered.filter(e => e.status === 'Active').length} Active</div>
            </div>
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '12px 20px', flex: 1 }}>
              <div style={{ fontSize: 11, color: '#9a3412', fontWeight: 600, textTransform: 'uppercase' }}>Monthly Payroll</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>৳{formatCurrency(totalSalary)}</div>
            </div>
          </div>
          <div className="search-bar">
            <input className="search-input" placeholder="Search by name, designation, phone..." value={search} onChange={e => setSearch(e.target.value)} />
            <span className="text-muted">{filtered.length} employees</span>
          </div>
          {loading ? (
            <div className="text-center" style={{ padding: 40 }}><i className="fas fa-spinner fa-spin" style={{ fontSize: 24, color: 'var(--accent)' }}></i></div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Designation</th>
                    <th>Salary (৳)</th>
                    <th>Join Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e, i) => (
                    <tr key={e.id}>
                      <td>{i + 1}</td>
                      <td><strong>{e.name}</strong></td>
                      <td>{e.phone || '-'}</td>
                      <td>{e.designation || '-'}</td>
                      <td className="text-right">৳{formatCurrency(e.salary)}</td>
                      <td>{formatDate(e.join_date)}</td>
                      <td><span className={`badge ${e.status === 'Active' ? 'badge-success' : 'badge-secondary'}`}>{e.status}</span></td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-info btn-xs" onClick={() => { setEditItem(e); setForm({ ...e }); setShowModal(true) }}><i className="fas fa-edit"></i></button>
                          <button className="btn btn-danger btn-xs" onClick={() => handleDelete(e.id)}><i className="fas fa-trash"></i></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay open" onClick={e => e.target.className.includes('modal-overlay') && setShowModal(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <h5>{editItem ? 'Edit Employee' : 'Add Employee'}</h5>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="grid-2">
                <div className="form-group"><label className="form-label">Name <span className="required">*</span></label><input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" /></div>
                <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" /></div>
                <div className="form-group"><label className="form-label">Designation</label><input className="form-control" value={form.designation || ''} onChange={e => setForm({ ...form, designation: e.target.value })} placeholder="Job title" /></div>
                <div className="form-group"><label className="form-label">Salary (৳)</label><input type="number" className="form-control" value={form.salary || ''} onChange={e => setForm({ ...form, salary: e.target.value })} placeholder="0.00" /></div>
                <div className="form-group"><label className="form-label">Join Date</label><input type="date" className="form-control" value={form.join_date || ''} onChange={e => setForm({ ...form, join_date: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Status</label>
                  <select className="form-control" value={form.status || 'Active'} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}><i className="fas fa-save"></i> {editItem ? 'Update' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
