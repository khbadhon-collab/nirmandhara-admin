import { useState, useEffect } from 'react'
import { clientsApi, cleanForm } from '../../lib/api'

const DEMO = [
  { id: 1, name: 'Dr.Mahbub', phone: '01711-000001', area: 'Tangail Sadar', category: 'Residential', status: 'Active', next_call_date: '2026-06-25', created_at: '2024-11-01' },
  { id: 2, name: 'Md Rakib Hasan', phone: '01711-000002', area: 'Akur Takur Para', category: 'Residential', status: 'Active', next_call_date: '2026-06-28', created_at: '2024-12-10' },
  { id: 3, name: 'Mrs. Fatima Tuj Johra', phone: '01711-000003', area: 'Tangail Sadar', category: 'Residential', status: 'Converted', next_call_date: null, created_at: '2025-01-15' },
  { id: 4, name: 'Mr.Safi', phone: '01711-000004', area: 'Jabale Noor Tower', category: 'Commercial', status: 'Active', next_call_date: '2026-07-01', created_at: '2025-02-20' },
  { id: 5, name: 'Mr.Zulfikar Haider', phone: '01711-000005', area: 'Bankstown NSW', category: 'Residential', status: 'Completed', next_call_date: null, created_at: '2025-08-27' },
  { id: 6, name: 'Mr.Mohammad Amir Hossain', phone: '01711-000006', area: 'Tangail Sadar', category: 'Institutional', status: 'Active', next_call_date: '2026-07-05', created_at: '2025-11-06' },
  { id: 7, name: 'Mrs Sultana Parvin', phone: '01711-000007', area: 'Akur Takur Para', category: 'Residential', status: 'Active', next_call_date: '2026-07-10', created_at: '2026-05-06' },
  { id: 8, name: 'Adv Imdadul Hoque Emon', phone: '01711-000008', area: 'Tangail Bar Office', category: 'Commercial', status: 'Completed', next_call_date: null, created_at: '2026-02-05' },
  { id: 9, name: 'MS Akhlima Akter', phone: '01711-000009', area: 'Akur Takur Para', category: 'Residential', status: 'Active', next_call_date: '2026-07-15', created_at: '2026-05-19' },
  { id: 10, name: 'Mr.Sanjay Kormomar', phone: '01711-000010', area: 'Chowani Bazar', category: 'Residential', status: 'Active', next_call_date: '2026-07-20', created_at: '2025-06-05' },
]

export default function ClientList({ onNavigate, toast }) {
  const [clients, setClients] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', area: '', category: 'Residential', status: 'Active', next_call_date: '', notes: '' })

  useEffect(() => { loadClients() }, [])

  async function loadClients() {
    setLoading(true)
    try {
      const { data, error } = await clientsApi.getAll()
      if (error) toast.error('Could not load clients: ' + error.message)
      setClients(data || [])
    } catch { setClients([]) }
    setLoading(false)
  }

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.area?.toLowerCase().includes(search.toLowerCase())
  )

  function openAdd() { setForm({ name: '', phone: '', email: '', address: '', area: '', category: 'Residential', status: 'Active', next_call_date: '', notes: '' }); setEditItem(null); setShowModal(true) }
  function openEdit(c) { setForm({ ...c }); setEditItem(c); setShowModal(true) }

  async function handleSave() {
    if (!form.name.trim()) { toast.error('Client name is required'); return }
    const payload = cleanForm({ name: form.name, phone: form.phone, email: form.email, address: form.address, area: form.area, category: form.category, status: form.status, next_call_date: form.next_call_date, notes: form.notes })
    if (editItem) {
      const { data, error } = await clientsApi.update(editItem.id, payload)
      if (error) { toast.error('Save failed: ' + error.message); return }
      setClients(prev => prev.map(c => c.id === editItem.id ? data : c))
      toast.success('Client updated!')
    } else {
      const { data, error } = await clientsApi.create(payload)
      if (error) { toast.error('Save failed: ' + error.message); return }
      setClients(prev => [data, ...prev])
      toast.success('Client added!')
    }
    setShowModal(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this client?')) return
    const { error } = await clientsApi.delete(id)
    if (error) { toast.error('Delete failed: ' + error.message); return }
    setClients(prev => prev.filter(c => c.id !== id))
    toast.success('Client deleted')
  }

  const statusBadge = (s) => {
    const map = { Active: 'badge-info', Converted: 'badge-success', Completed: 'badge-secondary', Lost: 'badge-danger' }
    return <span className={`badge ${map[s] || 'badge-secondary'}`}>{s}</span>
  }

  return (
    <div>
      <div className="block">
        <div className="block-header">
          <h3 className="block-title"><i className="fas fa-users" style={{ color: 'var(--accent)', marginRight: 8 }}></i>Client List</h3>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>
            <i className="fas fa-plus"></i> Add Client
          </button>
        </div>
        <div className="block-content">
          <div className="search-bar">
            <input className="search-input" placeholder="Search by name, phone, area..." value={search} onChange={e => setSearch(e.target.value)} />
            <span className="text-muted">Total: {filtered.length} clients</span>
          </div>
          {loading ? <div className="text-center" style={{ padding: 40 }}><i className="fas fa-spinner fa-spin" style={{ fontSize: 24, color: 'var(--accent)' }}></i></div> : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Area</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Next Call</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="text-center" style={{ padding: 40, color: 'var(--text-muted)' }}>No clients found</td></tr>
                  ) : filtered.map((c, i) => (
                    <tr key={c.id}>
                      <td>{i + 1}</td>
                      <td><strong>{c.name}</strong></td>
                      <td>{c.phone || '-'}</td>
                      <td>{c.area || '-'}</td>
                      <td>{c.category || '-'}</td>
                      <td>{statusBadge(c.status)}</td>
                      <td>{c.next_call_date || '-'}</td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-info btn-xs" onClick={() => openEdit(c)} title="Edit"><i className="fas fa-edit"></i></button>
                          <button className="btn btn-danger btn-xs" onClick={() => handleDelete(c.id)} title="Delete"><i className="fas fa-trash"></i></button>
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

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay open" onClick={e => e.target.className.includes('modal-overlay') && setShowModal(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <h5>{editItem ? 'Edit Client' : 'Add New Client'}</h5>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Name <span className="required">*</span></label>
                  <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Client name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-control" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-control" type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Area</label>
                  <input className="form-control" value={form.area || ''} onChange={e => setForm({ ...form, area: e.target.value })} placeholder="Area / Location" />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-control" value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })}>
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Institutional">Institutional</option>
                    <option value="Industrial">Industrial</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-control" value={form.status || 'Active'} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="Active">Active</option>
                    <option value="Converted">Converted</option>
                    <option value="Completed">Completed</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Next Call Date</label>
                  <input type="date" className="form-control" value={form.next_call_date || ''} onChange={e => setForm({ ...form, next_call_date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Visit Date</label>
                  <input type="date" className="form-control" value={form.visit_date || ''} onChange={e => setForm({ ...form, visit_date: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input className="form-control" value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Full address" />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-control" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Any notes..." />
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
