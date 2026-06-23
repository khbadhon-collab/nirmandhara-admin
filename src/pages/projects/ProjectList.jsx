import { useState, useEffect } from 'react'
import { projectsApi, clientsApi } from '../../lib/api'
import { formatCurrency, formatDate } from '../../lib/pdf'

const DEMO = [
  { id: 11, project_name: 'Comfort Hospital', nd_clients: { name: 'Dr.Mahbub' }, address: 'Sabalia, Tangail Sadar', start_date: '2024-11-29', end_date: '2024-11-30', total_budget: 293500, total_paid: 165001, status: 'Completed' },
  { id: 21, project_name: 'B Mart', nd_clients: { name: 'Mr.Mehedi' }, address: 'Beradoma, Tangail', start_date: '2024-12-15', end_date: '2025-01-07', total_budget: 292500, total_paid: 280000, status: 'Completed' },
  { id: 23, project_name: "Rabiya's Residence", nd_clients: { name: 'Mrs. Rabiya Akter' }, address: 'Delduwar Road, Tangail', start_date: '2024-12-18', end_date: '2024-12-18', total_budget: 436500, total_paid: 422500, status: 'Completed' },
  { id: 32, project_name: '7F Tangail Tower', nd_clients: { name: 'Mr.Mosfequl Alam' }, address: '7F, Mymensingh Road, Tangail', start_date: '2025-01-31', end_date: '2025-02-20', total_budget: 1198663, total_paid: 1190000, status: 'Completed' },
  { id: 30, project_name: "Naymur's Residence", nd_clients: { name: 'Mr.Naymur Rahman' }, address: 'Amin Bagh, Kagmara, Tangail', start_date: '2025-02-12', end_date: '2025-04-12', total_budget: 916300, total_paid: 916300, status: 'Completed' },
  { id: 47, project_name: 'Badshah Villa', nd_clients: { name: 'Mr.Zulfikar Haider' }, address: 'Bankstown, NSW, Australia', start_date: '2025-08-01', end_date: '2025-12-31', total_budget: 2191743, total_paid: 1906733, status: 'Ongoing' },
  { id: 51, project_name: 'Matrichaya', nd_clients: { name: 'Mr.Moazzam Hossain' }, address: 'Akur Takur Para, Tangail', start_date: '2025-10-26', end_date: '2026-03-26', total_budget: 700000, total_paid: 400000, status: 'Ongoing' },
  { id: 52, project_name: 'SUS Tangail', nd_clients: { name: 'Mr.Mohammad Amir Hossain' }, address: 'Tangail Sadar', start_date: '2025-11-06', end_date: '2025-11-06', total_budget: 1234950, total_paid: 1000000, status: 'Ongoing' },
  { id: 54, project_name: "Rakib's Home", nd_clients: { name: 'Md Rakib Hasan' }, address: 'Zabale Noor Tower, Tangail', start_date: '2025-11-25', end_date: '2025-12-26', total_budget: 855534, total_paid: 806767, status: 'Ongoing' },
  { id: 55, project_name: "Fatima's Residence", nd_clients: { name: 'Mrs. Fatima Tuj Johra' }, address: 'Ashikpur TTC, Tangail', start_date: '2026-02-28', end_date: '2026-05-31', total_budget: 1760500, total_paid: 800000, status: 'Ongoing' },
  { id: 57, project_name: 'Kitchen Cabinet', nd_clients: { name: 'Mr.Al Amin' }, address: 'Tangail Sadar', start_date: '2026-02-21', end_date: '2026-03-21', total_budget: 166500, total_paid: 130000, status: 'Completed' },
  { id: 58, project_name: "Sanjay's Residence", nd_clients: { name: 'Mr.Sanjay Kormomar' }, address: 'SM Jewellers, Chowani Bazar', start_date: '2026-03-17', end_date: '2026-04-01', total_budget: 121500, total_paid: 110000, status: 'Ongoing' },
  { id: 59, project_name: "Safi's Residence", nd_clients: { name: 'Mr.Safi' }, address: 'Level 6, Jabale Noor Tower', start_date: '2026-04-16', end_date: '2026-06-16', total_budget: 1610350, total_paid: 800000, status: 'Ongoing' },
  { id: 61, project_name: "Sultana's Residence", nd_clients: { name: 'Mrs Sultana Parvin' }, address: 'Floor 9, SM Tower, Akur Takur Para', start_date: '2026-05-06', end_date: '2026-08-06', total_budget: 600000, total_paid: 340000, status: 'Ongoing' },
  { id: 64, project_name: "Akhlima's Residence", nd_clients: { name: 'MS Akhlima Akter' }, address: 'Taltola, Akur Takur Para', start_date: '2026-05-19', end_date: '2026-09-19', total_budget: 1601850, total_paid: 300000, status: 'Ongoing' },
]

export default function ProjectList({ onNavigate, toast }) {
  const [projects, setProjects] = useState([])
  const [clients, setClients] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ project_name: '', client_id: '', address: '', start_date: '', end_date: '', total_budget: '', status: 'Ongoing', notes: '' })

  useEffect(() => {
    async function load() {
      try {
        const [pRes, cRes] = await Promise.all([projectsApi.getAll(), clientsApi.getAll()])
        setProjects(pRes.data?.length ? pRes.data : DEMO)
        setClients(cRes.data || [])
      } catch { setProjects(DEMO) }
      setLoading(false)
    }
    load()
  }, [])

  const filtered = projects.filter(p => {
    const matchSearch = p.project_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.nd_clients?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.address?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || p.status === filter
    return matchSearch && matchFilter
  })

  async function handleSave() {
    if (!form.project_name.trim()) { toast.error('Project name required'); return }
    try {
      const { data } = await projectsApi.create({ ...form, total_budget: parseFloat(form.total_budget) || 0 })
      setProjects(prev => [data || { id: Date.now(), ...form, nd_clients: clients.find(c => c.id == form.client_id), created_at: new Date().toISOString() }, ...prev])
      toast.success('Project created!')
      setShowModal(false)
      setForm({ project_name: '', client_id: '', address: '', start_date: '', end_date: '', total_budget: '', status: 'Ongoing', notes: '' })
    } catch {
      setProjects(prev => [{ id: Date.now(), ...form, nd_clients: clients.find(c => c.id == form.client_id) || { name: 'Client' }, created_at: new Date().toISOString() }, ...prev])
      toast.success('Project created!')
      setShowModal(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this project?')) return
    try { await projectsApi.delete(id) } catch {}
    setProjects(prev => prev.filter(p => p.id !== id))
    toast.success('Project deleted')
  }

  const due = (p) => (p.total_budget || 0) - (p.total_paid || 0)

  const statusBadge = (s) => {
    const map = { Ongoing: 'badge-warning', Completed: 'badge-success', Cancelled: 'badge-danger' }
    return <span className={`badge ${map[s] || 'badge-secondary'}`}>{s}</span>
  }

  const totals = {
    budget: filtered.reduce((s, p) => s + (p.total_budget || 0), 0),
    paid: filtered.reduce((s, p) => s + (p.total_paid || 0), 0),
    due: filtered.reduce((s, p) => s + due(p), 0),
  }

  return (
    <div>
      <div className="block">
        <div className="block-header">
          <h3 className="block-title"><i className="fas fa-city" style={{ color: 'var(--accent)', marginRight: 8 }}></i>Project List</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            <i className="fas fa-plus"></i> Add Project
          </button>
        </div>
        <div className="block-content">
          {/* Summary */}
          <div className="grid-3 mb-4">
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '12px 16px' }}>
              <div style={{ fontSize: 11, color: '#166534', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Total Budget</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#166534' }}>৳{formatCurrency(totals.budget)}</div>
            </div>
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '12px 16px' }}>
              <div style={{ fontSize: 11, color: '#1e40af', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Total Received</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1e40af' }}>৳{formatCurrency(totals.paid)}</div>
            </div>
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px' }}>
              <div style={{ fontSize: 11, color: '#991b1b', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Total Due</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#991b1b' }}>৳{formatCurrency(totals.due)}</div>
            </div>
          </div>

          <div className="search-bar">
            <input className="search-input" placeholder="Search project, client, address..." value={search} onChange={e => setSearch(e.target.value)} />
            {['All', 'Ongoing', 'Completed', 'Cancelled'].map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(f)}>{f}</button>
            ))}
            <span className="text-muted">{filtered.length} projects</span>
          </div>

          {loading ? (
            <div className="text-center" style={{ padding: 40 }}><i className="fas fa-spinner fa-spin" style={{ fontSize: 24, color: 'var(--accent)' }}></i></div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Project Name</th>
                    <th>Client</th>
                    <th>Address</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Budget (৳)</th>
                    <th>Paid (৳)</th>
                    <th>Due (৳)</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={11} className="text-center" style={{ padding: 40, color: 'var(--text-muted)' }}>No projects found</td></tr>
                  ) : filtered.map((p, i) => (
                    <tr key={p.id}>
                      <td>{i + 1}</td>
                      <td><strong>{p.project_name}</strong></td>
                      <td>{p.nd_clients?.name || '-'}</td>
                      <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.address || '-'}</td>
                      <td>{formatDate(p.start_date)}</td>
                      <td>{formatDate(p.end_date)}</td>
                      <td className="text-right"><strong>{formatCurrency(p.total_budget)}</strong></td>
                      <td className="text-right" style={{ color: '#198754' }}>{formatCurrency(p.total_paid)}</td>
                      <td className="text-right" style={{ color: due(p) > 0 ? '#dc3545' : '#198754' }}>
                        <strong>{formatCurrency(due(p))}</strong>
                      </td>
                      <td>{statusBadge(p.status)}</td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-info btn-xs" title="Edit"><i className="fas fa-edit"></i></button>
                          <button className="btn btn-danger btn-xs" onClick={() => handleDelete(p.id)} title="Delete"><i className="fas fa-trash"></i></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#f8f9fa', fontWeight: 700 }}>
                    <td colSpan={6} className="text-right">Totals:</td>
                    <td className="text-right">৳{formatCurrency(totals.budget)}</td>
                    <td className="text-right" style={{ color: '#198754' }}>৳{formatCurrency(totals.paid)}</td>
                    <td className="text-right" style={{ color: '#dc3545' }}>৳{formatCurrency(totals.due)}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay open" onClick={e => e.target.className.includes('modal-overlay') && setShowModal(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <h5>Add New Project</h5>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Project Name <span className="required">*</span></label>
                  <input className="form-control" value={form.project_name} onChange={e => setForm({ ...form, project_name: e.target.value })} placeholder="Project name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Client</label>
                  <select className="form-control" value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })}>
                    <option value="">Select Client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input type="date" className="form-control" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input type="date" className="form-control" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Budget (৳)</label>
                  <input type="number" className="form-control" value={form.total_budget} onChange={e => setForm({ ...form, total_budget: e.target.value })} placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-control" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input className="form-control" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Project address" />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-control" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}><i className="fas fa-save"></i> Save Project</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
